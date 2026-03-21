import ssl
ssl._create_default_https_context = ssl._create_unverified_context

import io
import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

import numpy as np
import torch
import torch.nn as nn
import timm
from PIL import Image
from torchvision import transforms
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

MODEL_PATH  = os.getenv("MODEL_PATH", "truecred_v3_efficientnet_dinov2.pt")
DEVICE      = "cuda" if torch.cuda.is_available() else "cpu"
IMG_SIZE    = 224
ELA_QUALITY = 75
ELA_AMPLIFY = 12
CLASS_NAMES = ["fake", "real"]   # index 0 = fake, 1 = real  (matches training)

def compute_ela(img: Image.Image, quality: int = ELA_QUALITY,
                amplify: int = ELA_AMPLIFY) -> Image.Image:
    """
    Error Level Analysis: highlights regions with different JPEG compression
    history — a strong signal for tampered / synthesised documents.
    """
    buf = io.BytesIO()
    img.convert("RGB").save(buf, "JPEG", quality=quality)
    buf.seek(0)
    resaved = Image.open(buf).convert("RGB")

    orig_arr    = np.array(img.convert("RGB"),  dtype=np.float32)
    resaved_arr = np.array(resaved,              dtype=np.float32)
    ela_arr     = np.abs(orig_arr - resaved_arr) * amplify
    ela_arr     = np.clip(ela_arr, 0, 255).astype(np.uint8)
    return Image.fromarray(ela_arr)

to_tensor = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

ela_to_tensor = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])

class DualBranchForgeryDetector(nn.Module):
    """
    Two-branch classifier:
      • Branch A (RGB)  — DinoV2-small (384-d CLS token)
      • Branch B (ELA)  — EfficientNet-B0 (1280-d global avg pool)
    Features are concatenated → fusion head → 2-class logits.
    """
    def __init__(self, num_classes: int = 2, dropout: float = 0.4):
        super().__init__()

        # Branch A: DinoV2-small
        # pretrained=False  — weights come from the checkpoint, not the internet.
        # skip_validation=True — skip GitHub connectivity check; uses local hub cache.
        self.dino = torch.hub.load(
            "facebookresearch/dinov2", "dinov2_vits14",
            pretrained=False, verbose=False, skip_validation=True,
        )
        dino_dim = 384

        # Branch B: EfficientNet-B0  (feature extractor, no classifier head)
        self.effnet    = timm.create_model("efficientnet_b0", pretrained=False, num_classes=0)
        effnet_dim     = self.effnet.num_features   # 1280

        # Fusion head
        fused_dim = dino_dim + effnet_dim           # 1664
        self.head = nn.Sequential(
            nn.LayerNorm(fused_dim),
            nn.Dropout(dropout),
            nn.Linear(fused_dim, 512),
            nn.GELU(),
            nn.Dropout(dropout * 0.5),
            nn.Linear(512, num_classes),
        )

    def forward(self, rgb: torch.Tensor, ela: torch.Tensor) -> torch.Tensor:
        dino_feat   = self.dino(rgb)          # (B, 384)
        effnet_feat = self.effnet(ela)        # (B, 1280)
        fused       = torch.cat([dino_feat, effnet_feat], dim=1)
        return self.head(fused)

model: Optional[DualBranchForgeryDetector] = None
model_meta: dict = {}

def load_model(path: str) -> DualBranchForgeryDetector:
    log.info(f"Loading model from '{path}' onto {DEVICE} …")
    checkpoint = torch.load(path, map_location=DEVICE)

    m = DualBranchForgeryDetector(num_classes=2, dropout=0.4).to(DEVICE)
    m.load_state_dict(checkpoint["model_state_dict"])
    m.eval()

    global model_meta
    model_meta = {
        "architecture": checkpoint.get("architecture", "dual_branch_dinov2s_efficientnet_b0_ela"),
        "version":      checkpoint.get("version", "unknown"),
        "best_val_f1":  checkpoint.get("best_val_f1", "unknown"),
        "img_size":     checkpoint.get("img_size", IMG_SIZE),
        "class_to_idx": checkpoint.get("class_to_idx", {"fake": 0, "real": 1}),
    }
    log.info(f"Model loaded. val F1={model_meta['best_val_f1']:.4f}, "
             f"version={model_meta['version']}")
    return m

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    if os.path.exists(MODEL_PATH):
        model = load_model(MODEL_PATH)
    else:
        log.warning(
            f"Checkpoint '{MODEL_PATH}' not found. "
            "Set MODEL_PATH env-var to the correct path. "
            "The /predict endpoint will return 503 until the model is loaded."
        )
    yield
    log.info("Shutting down.")

app = FastAPI(
    title="TrueCred Forgery Detector API",
    description=(
        "Classifies a certificate / document image as **real** or **fake** "
        "using a dual-branch DinoV2 + EfficientNet-B0 model with ELA analysis.\n\n"
        "**Test-set performance**: 95% accuracy, macro F1 = 0.95"
    ),
    version="3.0.0",
    lifespan=lifespan,
)


class PredictionResponse(BaseModel):
    label:       str    # "fake" or "real"
    confidence:  float  # probability of the predicted class (0-1)
    fake_prob:   float  # P(fake)
    real_prob:   float  # P(real)
    latency_ms:  float  # end-to-end inference time in milliseconds

class HealthResponse(BaseModel):
    status:       str
    model_loaded: bool
    device:       str
    architecture: Optional[str]   = None
    version:      Optional[int]   = None
    best_val_f1:  Optional[float] = None

ACCEPTED_MIME = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}

def preprocess(img: Image.Image):
    """Return (rgb_tensor, ela_tensor) ready for the model."""
    img   = img.resize((IMG_SIZE, IMG_SIZE), Image.LANCZOS)
    ela   = compute_ela(img)
    rgb_t = to_tensor(img).unsqueeze(0).to(DEVICE)      # (1, 3, 224, 224)
    ela_t = ela_to_tensor(ela).unsqueeze(0).to(DEVICE)  # (1, 3, 224, 224)
    return rgb_t, ela_t

@app.get("/", summary="API info")
def root():
    return {
        "name":        "TrueCred Forgery Detector",
        "version":     "3.0",
        "description": "POST an image to /predict to classify it as real or fake.",
        "docs":        "/docs",
    }


@app.get("/health", response_model=HealthResponse, summary="Health check")
def health():
    loaded = model is not None
    return HealthResponse(
        status       = "ok" if loaded else "degraded – model not loaded",
        model_loaded = loaded,
        device       = DEVICE,
        architecture = model_meta.get("architecture") if loaded else None,
        version      = model_meta.get("version")      if loaded else None,
        best_val_f1  = model_meta.get("best_val_f1")  if loaded else None,
    )


@app.post("/predict", response_model=PredictionResponse, summary="Classify a document image")
async def predict(file: UploadFile = File(..., description="Document image (JPEG / PNG / …)")):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail=f"Model not loaded. Place the checkpoint at '{MODEL_PATH}' "
                   "and restart the server (or set MODEL_PATH).",
        )

    if file.content_type not in ACCEPTED_MIME:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported media type '{file.content_type}'. "
                   f"Accepted: {sorted(ACCEPTED_MIME)}",
        )

    try:
        raw = await file.read()
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=422, detail=f"Could not decode image: {exc}")

    t0 = time.perf_counter()
    try:
        rgb_t, ela_t = preprocess(img)
        with torch.no_grad():
            logits = model(rgb_t, ela_t)           # (1, 2)
            probs  = torch.softmax(logits, dim=1)[0].cpu().tolist()
    except Exception as exc:
        log.exception("Inference error")
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}")
    latency_ms = (time.perf_counter() - t0) * 1000

    fake_prob, real_prob = probs[0], probs[1]
    pred_idx   = int(fake_prob < real_prob)   # 0=fake, 1=real
    label      = CLASS_NAMES[pred_idx]
    confidence = probs[pred_idx]

    log.info(
        f"[{file.filename}] → {label.upper()} "
        f"(fake={fake_prob:.3f}, real={real_prob:.3f}, {latency_ms:.1f} ms)"
    )

    return PredictionResponse(
        label      = label,
        confidence = round(confidence, 4),
        fake_prob  = round(fake_prob, 4),
        real_prob  = round(real_prob, 4),
        latency_ms = round(latency_ms, 2),
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 9000))
    uvicorn.run("app:app", host="0.0.0.0", port=port, reload=False)