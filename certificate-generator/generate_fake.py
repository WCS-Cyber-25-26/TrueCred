"""
generate_fakes.py
-----------------
Fake generation pipeline for current certificate setup.

Supports current genuine dataset layout:
    dataset/genuine/template_a/
    dataset/genuine/template_b/
    dataset/genuine/template_c/
    dataset/genuine/template_d/
    dataset/genuine/template_e/
    dataset/genuine/template_f/
    dataset/genuine/template_j/
    dataset/genuine/template_k/
    dataset/genuine/template_l/
    dataset/genuine/template_m/

Usage:
    python generate_fakes.py --count 200
"""

import os
import sys
import io
import csv
import math
import random
import argparse
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import numpy as np
from PIL import (
    Image, ImageDraw, ImageFont, ImageFilter,
    ImageEnhance, ImageChops
)
from scipy.ndimage import map_coordinates, gaussian_filter


# ══════════════════════════════════════════════════════════════════════════════
# ASSET REGISTRY
# ══════════════════════════════════════════════════════════════════════════════
_HERE = os.path.dirname(__file__)

def _asset(folder, filename):
    return os.path.join(_HERE, "..", "assets", folder, filename)

def _asset_dir(folder):
    return os.path.join(_HERE, "..", "assets", folder)

TEMPLATE_ASSETS = {
    "a": {
        "logo": None,
        "seal": _asset("seals", "seal6.png"),
    },
    "b": {
        "logo": _asset("seals", "crest7.png"),
        "seal": _asset("seals", "seal9.png"),
    },
    "c": {
        "logo": None,
        "seal": _asset("seals", "sealmw.png"),
    },
    "d": {
        "logo": _asset("seals", "crest6.png"),
        "seal": _asset("seals", "seal8.png"),
    },
    "e": {
        "logo": _asset("seals", "crest5.png"),
        "seal": _asset("seals", "seal7.png"),
    },
    "f": {
        "logo": _asset("seals", "crest.png"),
        "seal": _asset("seals", "waxSeal.png"),
    },
    "j": {
        "logo": _asset("seals", "crest4.png"),
        "seal": _asset("seals", "seal4.png"),
    },
    "k": {
        "logo": _asset("seals", "crest2.png"),
        "seal": _asset("seals", "seal2.png"),
    },
    "l": {
        "logo": None,
        "seal": _asset("seals", "seal.png"),
    },
    "m": {
        "logo": _asset("seals", "crest3.png"),
        "seal": _asset("seals", "seal3.png"),
    },
}

_seals_dir = _asset_dir("seals")
_sigs_dir = _asset_dir("signatures")

ALL_SEALS = [
    os.path.join(_seals_dir, f)
    for f in os.listdir(_seals_dir)
    if f.lower().endswith(".png")
] if os.path.isdir(_seals_dir) else []

ALL_SIGS = [
    os.path.join(_sigs_dir, f)
    for f in os.listdir(_sigs_dir)
    if f.lower().endswith(".png")
] if os.path.isdir(_sigs_dir) else []

ALL_LOGOS = [
    v["logo"] for v in TEMPLATE_ASSETS.values()
    if v.get("logo") and os.path.exists(v["logo"])
]


# ══════════════════════════════════════════════════════════════════════════════
# RANDOM DATA POOLS
# ══════════════════════════════════════════════════════════════════════════════
FIRST_NAMES = [
    "James","Olivia","Liam","Emma","Noah","Ava","William","Sophia",
    "Benjamin","Mia","Henry","Charlotte","Alexander","Amelia","Mason",
    "Harper","Fatima","Omar","Yuki","Priya","Arjun","Mei","Kwame"
]

LAST_NAMES = [
    "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller",
    "Davis","Wilson","Taylor","Anderson","Thomas","Jackson","White",
    "Patel","Nguyen","Kim","Chen","Mensah","Okonkwo"
]

DAY_WORDS = {
    1:"First",2:"Second",3:"Third",4:"Fourth",5:"Fifth",6:"Sixth",
    7:"Seventh",8:"Eighth",9:"Ninth",10:"Tenth",11:"Eleventh",
    12:"Twelfth",13:"Thirteenth",14:"Fourteenth",15:"Fifteenth",
    16:"Sixteenth",17:"Seventeenth",18:"Eighteenth",19:"Nineteenth",
    20:"Twentieth",21:"Twenty-First",22:"Twenty-Second",23:"Twenty-Third",
    24:"Twenty-Fourth",25:"Twenty-Fifth",26:"Twenty-Sixth",27:"Twenty-Seventh",
    28:"Twenty-Eighth",
}

MONTHS = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
]

def random_name():
    return f"{random.choice(FIRST_NAMES)} {random.choice(LAST_NAMES)}"

def random_date_str():
    d = random.randint(1, 28)
    m = random.randint(1, 12)
    y = random.randint(2018, 2025)
    return f"{DAY_WORDS[d]} {MONTHS[m-1]} {y}"


# ══════════════════════════════════════════════════════════════════════════════
# HELPERS
# ══════════════════════════════════════════════════════════════════════════════
def _noise_patch(w, h, base_color=(245, 245, 243)):
    arr = np.full((h, w, 4), (*base_color, 255), dtype=np.float32)
    noise = np.random.normal(0, 4, (h, w, 3))
    arr[:, :, :3] = np.clip(arr[:, :, :3] + noise, 200, 255)
    return Image.fromarray(arr.astype(np.uint8), "RGBA")


def _perspective_coeffs(pa, pb):
    matrix = []
    for p1, p2 in zip(pa, pb):
        matrix.append([p1[0], p1[1], 1, 0, 0, 0, -p2[0]*p1[0], -p2[0]*p1[1]])
        matrix.append([0, 0, 0, p1[0], p1[1], 1, -p2[1]*p1[0], -p2[1]*p1[1]])
    A = np.matrix(matrix, dtype=float)
    B = np.array(pb).reshape(8)
    res = np.dot(np.linalg.inv(A.T * A) * A.T, B)
    return np.array(res).flatten()


# ══════════════════════════════════════════════════════════════════════════════
# GEOMETRIC WARPS
# ══════════════════════════════════════════════════════════════════════════════
def apply_perspective_warp(img, max_shift_frac=0.04):
    w, h = img.size
    dx = int(w * max_shift_frac)
    dy = int(h * max_shift_frac)

    def j(v, s):
        return v + random.randint(-s, s)

    src = [(0,0), (w,0), (w,h), (0,h)]
    dst = [(j(0,dx),j(0,dy)), (j(w,dx),j(0,dy)),
           (j(w,dx),j(h,dy)), (j(0,dx),j(h,dy))]

    coeffs = _perspective_coeffs(dst, src)
    return img.transform(
        img.size,
        Image.PERSPECTIVE,
        coeffs,
        Image.BICUBIC,
        fillcolor=(245, 245, 243)
    )


def apply_elastic_distortion(img, alpha=18.0, sigma=6.0):
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    h, w = arr.shape[:2]

    dx = gaussian_filter(np.random.randn(h, w).astype(np.float32), sigma) * alpha
    dy = gaussian_filter(np.random.randn(h, w).astype(np.float32), sigma) * alpha

    x, y = np.meshgrid(np.arange(w), np.arange(h))
    ix = np.clip(x + dx, 0, w - 1).astype(np.float32)
    iy = np.clip(y + dy, 0, h - 1).astype(np.float32)

    out = np.stack([
        map_coordinates(arr[:, :, c], [iy.ravel(), ix.ravel()], order=1).reshape(h, w)
        for c in range(arr.shape[2])
    ], axis=-1).clip(0, 255).astype(np.uint8)

    return Image.fromarray(out)


def apply_skew(img, max_angle_deg=3.5):
    angle = random.uniform(-max_angle_deg, max_angle_deg)
    return img.rotate(angle, resample=Image.BICUBIC, expand=False, fillcolor=(245, 245, 243))


# ══════════════════════════════════════════════════════════════════════════════
# REGION LOCATORS
# ══════════════════════════════════════════════════════════════════════════════
def _seal_box(iw, ih, template_id):
    portrait = {"a", "b", "d", "e", "k", "l"}
    if template_id in portrait:
        cx, cy = int(iw * 0.22), int(ih * 0.82)
    else:
        cx, cy = int(iw * 0.50), int(ih * 0.78)
    r = int(min(iw, ih) * 0.10)
    return cx - r, cy - r, 2 * r, 2 * r


def _logo_box(iw, ih, template_id):
    cx = iw // 2
    cy = int(ih * 0.14)
    r = int(min(iw, ih) * 0.13)
    return cx - r, cy - r, 2 * r, 2 * r


def _name_box(iw, ih, template_id):
    portrait = {"a", "b", "d", "e", "k", "l"}
    y_frac = 0.42 if template_id in portrait else 0.36
    cx = iw // 2
    bw = int(iw * 0.60)
    bh = int(ih * 0.07)
    return cx - bw // 2, int(ih * y_frac), bw, bh


def _date_box(iw, ih, template_id):
    if template_id in {"f"}:
        return int(iw * 0.35), int(ih * 0.58), int(iw * 0.30), int(ih * 0.05)
    if template_id in {"m"}:
        return int(iw * 0.38), int(ih * 0.66), int(iw * 0.25), int(ih * 0.05)
    if template_id in {"j"}:
        return int(iw * 0.42), int(ih * 0.64), int(iw * 0.25), int(ih * 0.05)
    return int(iw * 0.52), int(ih * 0.82), int(iw * 0.35), int(ih * 0.06)


# ══════════════════════════════════════════════════════════════════════════════
# TAMPERS
# ══════════════════════════════════════════════════════════════════════════════
def tamper_seal_image(img, template_id, correct_seal):
    img = img.copy().convert("RGBA")
    iw, ih = img.size
    x, y, bw, bh = _seal_box(iw, ih, template_id)
    mode = random.choice(["removed", "replaced", "degraded", "degraded"])

    if mode == "removed":
        img.paste(_noise_patch(bw, bh), (x, y))

    elif mode == "replaced":
        wrong = [s for s in ALL_SEALS if os.path.exists(s) and s != correct_seal]
        if wrong:
            w_img = Image.open(random.choice(wrong)).convert("RGBA")
            w_img.thumbnail((bw, bh), Image.LANCZOS)
            px = x + (bw - w_img.width) // 2
            py = y + (bh - w_img.height) // 2
            img.paste(w_img, (px, py), w_img)

    else:
        region = img.crop((x, y, x + bw, y + bh)).convert("RGB")
        buf = io.BytesIO()
        region.save(buf, "JPEG", quality=random.randint(25, 50))
        buf.seek(0)
        region = Image.open(buf).convert("RGB")
        region = region.filter(ImageFilter.GaussianBlur(radius=random.uniform(1.5, 3.5)))
        region = ImageEnhance.Brightness(region).enhance(random.uniform(0.65, 1.3))
        region = ImageEnhance.Color(region).enhance(random.uniform(0.3, 0.8))
        img.paste(region.convert("RGBA"), (x, y))

    return img.convert("RGB")


def tamper_logo_image(img, template_id, correct_logo):
    if not correct_logo:
        return img

    img = img.copy().convert("RGBA")
    iw, ih = img.size
    x, y, bw, bh = _logo_box(iw, ih, template_id)
    mode = random.choice(["blurred", "replaced", "colorshift", "removed"])

    if mode == "blurred":
        region = img.crop((x, y, x + bw, y + bh)).convert("RGB")
        buf = io.BytesIO()
        region.save(buf, "JPEG", quality=random.randint(20, 45))
        buf.seek(0)
        region = Image.open(buf).convert("RGB")
        region = region.filter(ImageFilter.GaussianBlur(radius=random.uniform(2.0, 5.0)))
        img.paste(region.convert("RGBA"), (x, y))

    elif mode == "replaced":
        wrong = [l for l in ALL_LOGOS if os.path.exists(l) and l != correct_logo]
        if wrong:
            w_img = Image.open(random.choice(wrong)).convert("RGBA")
            w_img.thumbnail((bw, bh), Image.LANCZOS)
            px = x + (bw - w_img.width) // 2
            py = y + (bh - w_img.height) // 2
            base = img.crop((x, y, x + bw, y + bh)).convert("RGBA")
            blend = Image.new("RGBA", base.size, (0, 0, 0, 0))
            blend.paste(w_img, (px - x, py - y), w_img)
            merged = Image.alpha_composite(base, blend)
            img.paste(merged, (x, y))

    elif mode == "colorshift":
        region = img.crop((x, y, x + bw, y + bh)).convert("RGB")
        region = ImageEnhance.Color(region).enhance(random.uniform(0.0, 0.4))
        region = ImageEnhance.Brightness(region).enhance(random.uniform(0.5, 1.5))
        tint = Image.new(
            "RGB",
            region.size,
            (random.randint(80, 200), random.randint(80, 200), random.randint(80, 200))
        )
        region = ImageChops.blend(region, tint, alpha=random.uniform(0.2, 0.5))
        img.paste(region.convert("RGBA"), (x, y))

    else:
        img.paste(_noise_patch(bw, bh), (x, y))

    return img.convert("RGB")


def _load_overlay_font(target_h):
    candidates = [
        os.path.join(_HERE, "templates", "fonts", "times.ttf"),
        "/usr/share/fonts/truetype/freefont/FreeSerifBold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/Library/Fonts/Times New Roman Bold.ttf",
        "C:\\Windows\\Fonts\\timesbd.ttf",
        "C:\\Windows\\Fonts\\arialbd.ttf",
    ]
    for candidate in candidates:
        if os.path.exists(candidate):
            try:
                return ImageFont.truetype(candidate, target_h)
            except Exception:
                pass
    return ImageFont.load_default()


def tamper_name_date_image(img, template_id):
    img = img.copy().convert("RGB")
    draw = ImageDraw.Draw(img)

    iw, ih = img.size
    targets = random.choice([["name"], ["date"], ["name", "date"]])

    for target in targets:
        if target == "name":
            x, y, bw, bh = _name_box(iw, ih, template_id)
            new_text = random_name()
        else:
            x, y, bw, bh = _date_box(iw, ih, template_id)
            new_text = random_date_str()

        # edited region background
        region = img.crop((x, y, x + bw, y + bh)).filter(
            ImageFilter.GaussianBlur(radius=random.uniform(2.0, 5.0))
        )
        img.paste(region, (x, y))

        # subtle paste box artifact
        if random.random() < 0.6:
            patch = Image.new("RGB", (bw, bh), (248, 247, 243))
            patch = ImageChops.blend(patch, region, alpha=0.35)
            img.paste(patch, (x, y))

        font = _load_overlay_font(max(12, int(bh * 0.55)))
        bb = draw.textbbox((0, 0), new_text, font=font)
        tw = bb[2] - bb[0]
        th = bb[3] - bb[1]

        tx = x + max(0, (bw - tw) // 2) + random.randint(-6, 6)
        ty = y + max(0, (bh - th) // 2) + random.randint(-3, 3)

        # wrong-color / slightly off-black text
        fill = (
            random.randint(10, 45),
            random.randint(10, 45),
            random.randint(10, 45),
        )
        draw.text((tx, ty), new_text, font=font, fill=fill)

    return img


def _blur_signature_region(img, template_id):
    iw, ih = img.size

    if template_id in {"a", "b", "d", "e", "k", "l"}:
        x, y = int(iw * 0.50), int(ih * 0.75)
        bw, bh = int(iw * 0.45), int(ih * 0.20)
    else:
        x, y = int(iw * 0.05), int(ih * 0.62)
        bw, bh = int(iw * 0.90), int(ih * 0.30)

    region = img.crop((x, y, x + bw, y + bh))
    mode = random.choice(["blur_all", "erase_one"])

    if mode == "blur_all":
        region = region.filter(ImageFilter.GaussianBlur(radius=random.uniform(3.0, 7.0)))
    else:
        slot_h = max(1, bh // 3)
        slot_y = random.randint(0, 2) * slot_h
        patch = _noise_patch(bw, slot_h)
        region = region.convert("RGBA")
        region.paste(patch, (0, slot_y))
        region = region.convert("RGB")

    img.paste(region, (x, y))
    return img


def apply_digital_noise(img):
    img = img.convert("RGB")
    ops = random.sample(["jpeg", "gaussian", "banding", "contrast"], k=random.randint(1, 3))

    for op in ops:
        if op == "jpeg":
            buf = io.BytesIO()
            img.save(buf, "JPEG", quality=random.randint(45, 75))
            buf.seek(0)
            img = Image.open(buf).convert("RGB")

        elif op == "gaussian":
            arr = np.array(img, dtype=np.float32)
            noise = np.random.normal(0, random.uniform(2, 8), arr.shape)
            img = Image.fromarray(np.clip(arr + noise, 0, 255).astype(np.uint8))

        elif op == "banding":
            arr = np.array(img, dtype=np.float32)
            h = arr.shape[0]
            freq = random.uniform(0.03, 0.12)
            bands = (np.sin(np.arange(h) * freq * 2 * np.pi) * random.uniform(3, 9))[:, np.newaxis, np.newaxis]
            img = Image.fromarray(np.clip(arr + bands, 0, 255).astype(np.uint8))

        elif op == "contrast":
            img = ImageEnhance.Contrast(img).enhance(random.uniform(0.75, 1.35))
            img = ImageEnhance.Brightness(img).enhance(random.uniform(0.85, 1.15))

    return img


# ══════════════════════════════════════════════════════════════════════════════
# MASTER TAMPER
# ══════════════════════════════════════════════════════════════════════════════
def image_level_tamper(real_img_path, template_id, tamper_type):
    img = Image.open(real_img_path).convert("RGB")
    assets = TEMPLATE_ASSETS.get(template_id, {})
    seal = assets.get("seal")
    logo = assets.get("logo")

    applied_ops = [tamper_type]

    if tamper_type == "name_date_swap":
        img = tamper_name_date_image(img, template_id)
        img = apply_digital_noise(img)

    elif tamper_type == "seal_tamper":
        img = tamper_seal_image(img, template_id, seal)
        img = apply_digital_noise(img)

    elif tamper_type == "font_tampering":
        img = tamper_name_date_image(img, template_id)
        if logo:
            img = tamper_logo_image(img, template_id, logo)
        img = apply_digital_noise(img)

    elif tamper_type == "signature_tamper":
        img = _blur_signature_region(img, template_id)
        img = apply_digital_noise(img)

    # optional secondary tamper
    if random.random() < 0.35:
        extra = random.choice(["digital_noise", "logo_shift"])
        applied_ops.append(extra)

        if extra == "digital_noise":
            img = apply_digital_noise(img)
        elif extra == "logo_shift" and logo:
            img = tamper_logo_image(img, template_id, logo)

    # always one geometric warp
    wt = random.choice(["perspective", "elastic", "skew"])
    applied_ops.append(wt)

    if wt == "perspective":
        img = apply_perspective_warp(img, max_shift_frac=random.uniform(0.01, 0.04))
    elif wt == "elastic":
        img = apply_elastic_distortion(img, alpha=random.uniform(8, 22), sigma=random.uniform(4, 8))
    else:
        img = apply_skew(img, max_angle_deg=random.uniform(0.5, 3.0))

    return img, applied_ops


# ══════════════════════════════════════════════════════════════════════════════
# GENERATION LOOP
# ══════════════════════════════════════════════════════════════════════════════
TAMPER_WEIGHTS = {
    "name_date_swap": 0.30,
    "font_tampering": 0.25,
    "seal_tamper": 0.25,
    "signature_tamper": 0.20,
}


def _weighted_split(total, weights_dict):
    keys = list(weights_dict.keys())
    ws = list(weights_dict.values())
    s = sum(ws)
    counts = [int(total * w / s) for w in ws]
    counts[-1] += total - sum(counts)
    return dict(zip(keys, counts))


def _find_real_images(real_dir: Path, tid: str):
    template_subdir = real_dir / f"template_{tid}"
    if template_subdir.is_dir():
        imgs = list(template_subdir.glob("*.png")) + list(template_subdir.glob("*.jpg"))
        if imgs:
            return imgs
    return []


def generate_fakes(real_dir, out_dir, templates, count_per_template):
    real_dir = Path(real_dir)
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    manifest_rows = []

    for tid in templates:
        real_imgs = _find_real_images(real_dir, tid)
        if not real_imgs:
            print(f"WARNING: No real images found for template '{tid}' in {real_dir / f'template_{tid}'} — skipping")
            continue

        type_counts = _weighted_split(count_per_template, TAMPER_WEIGHTS)
        print(f"\n[Template {tid.upper()}] total={count_per_template} breakdown={type_counts}")

        idx = 0
        for tamper_type, n in type_counts.items():
            for i in range(n):
                filename = f"fake_{tid}_{tamper_type}_{idx:05d}.png"

                # NEW: per-template directory
                template_out_dir = out_dir / f"template_{tid}"
                template_out_dir.mkdir(parents=True, exist_ok=True)

                out_path = template_out_dir / filename
                src = str(random.choice(real_imgs))

                try:
                    out_img, applied_ops = image_level_tamper(src, tid, tamper_type)
                    out_img.save(out_path)

                    manifest_rows.append({
                        "filename": f"template_{tid}/{filename}",  # UPDATED
                        "template": tid,
                        "tamper_type": tamper_type,
                        "label": 1,
                        "source_file": os.path.basename(src),
                        "ops": "|".join(applied_ops),
                    })

                    if (i + 1) % 50 == 0:
                        print(f"    [{tamper_type}] {i+1}/{n} done")

                except Exception as e:
                    print(f"ERROR {filename}: {e}")

                idx += 1

    manifest_path = out_dir / "manifest.csv"
    with open(manifest_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["filename", "template", "tamper_type", "label", "source_file", "ops"]
        )
        writer.writeheader()
        writer.writerows(manifest_rows)

    print(f"\n{'='*60}")
    print(f"{len(manifest_rows)} fake images -> {out_dir}")
    print(f"Manifest -> {manifest_path}")
    print(f"{'='*60}")


# ══════════════════════════════════════════════════════════════════════════════
# CLI
# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate fake/tampered certificate images for all templates"
    )
    parser.add_argument(
        "--real_dir",
        default=os.path.join(os.path.dirname(__file__), "dataset", "genuine"),
        help="Directory containing genuine certificate template folders"
    )
    parser.add_argument(
        "--out_dir",
        default=os.path.join(os.path.dirname(__file__), "dataset", "fake"),
        help="Output directory for fake images"
    )
    parser.add_argument(
        "--templates",
        nargs="+",
        default=["a", "b", "c", "d", "e", "f", "j", "k", "l", "m"],
        help="Template IDs"
    )
    parser.add_argument(
        "--count",
        type=int,
        default=500,
        help="Fake images per template"
    )
    args = parser.parse_args()

    generate_fakes(
        real_dir=args.real_dir,
        out_dir=args.out_dir,
        templates=args.templates,
        count_per_template=args.count,
    )