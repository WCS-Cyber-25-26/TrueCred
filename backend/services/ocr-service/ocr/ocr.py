import os
import json
from google.cloud import vision
from google.oauth2 import service_account

KEY_PATH = "secrets/gcp-key.json"
INPUT_DIR = "input_images"
OUTPUT_DIR = "ocr_output"

os.makedirs(OUTPUT_DIR, exist_ok=True)

credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
client = vision.ImageAnnotatorClient(credentials=credentials)

def run_ocr(image_path):
    with open(image_path, "rb") as f:
        content = f.read()

    image = vision.Image(content=content)

    response = client.document_text_detection(image=image)

    if response.error.message:
        raise Exception(response.error.message)

    document = response.full_text_annotation

    ocr_result = {
        "full_text": document.text,
        "pages": []
    }

    # Extract layout details
    for page in document.pages:
        page_data = {"blocks": []}

        for block in page.blocks:
            block_data = {
                "block_confidence": block.confidence,
                "paragraphs": []
            }

            for paragraph in block.paragraphs:
                para_text = ""
                words_data = []

                for word in paragraph.words:
                    word_text = "".join(
                        symbol.text for symbol in word.symbols
                    )

                    bbox = [
                        {"x": v.x, "y": v.y}
                        for v in word.bounding_box.vertices
                    ]

                    words_data.append({
                        "text": word_text,
                        "confidence": word.confidence,
                        "bounding_box": bbox
                    })

                    para_text += word_text + " "

                block_data["paragraphs"].append({
                    "text": para_text.strip(),
                    "words": words_data
                })

            page_data["blocks"].append(block_data)

        ocr_result["pages"].append(page_data)

    return ocr_result


#process images
for file in os.listdir(INPUT_DIR):
    if not file.lower().endswith((".png", ".jpg", ".jpeg")):
        continue

    image_path = os.path.join(INPUT_DIR, file)
    print(f"[INFO] OCR processing: {file}")

    ocr_data = run_ocr(image_path)

    output_file = os.path.splitext(file)[0] + ".json"
    output_path = os.path.join(OUTPUT_DIR, output_file)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(ocr_data, f, indent=2)

    print(f"[DONE] Saved OCR output → {output_path}")
