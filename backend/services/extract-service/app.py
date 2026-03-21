import os
import base64
import json
from openai import OpenAI
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
ai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

EXTRACTION_PROMPT = """You are a certificate field extractor. Analyse the certificate image and return ONLY a valid JSON object with exactly these five fields:

{
  "university": "<institution name, typically large text near the top>",
  "studentName": "<full name of the recipient, typically after 'certifies that', 'awarded to', 'presented to', etc.>",
  "degree": "<full degree name, e.g. 'Bachelor of Science in Computer Science'>",
  "degreeAwardedDate": "<date in YYYY-MM-DD format, normalised from any format including ceremonial 'ninth day of June two thousand and twenty-four'>",
  "hiddenIdentifier": "<cert ID in format TC-XXXX-XXXX found after 'Cert ID:' label, or null if not present>"
}

Rules:
- Return ONLY the JSON object — no markdown fences, no explanation.
- If a field cannot be found, use null.
- degreeAwardedDate MUST be in YYYY-MM-DD format or null.
- hiddenIdentifier MUST match pattern TC-XXXX-XXXX (uppercase) or null.
"""


def extract_fields(image_bytes: bytes) -> dict:
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    response = ai_client.chat.completions.create(
        model="gpt-4o",
        max_tokens=512,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_b64}",
                        },
                    },
                    {
                        "type": "text",
                        "text": EXTRACTION_PROMPT,
                    },
                ],
            }
        ],
    )

    raw = response.choices[0].message.content.strip()
    print(f"[GPT-4o raw response]: {repr(raw)}")

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```", 2)[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
        # Remove closing fence if any
        if raw.endswith("```"):
            raw = raw[:-3].strip()

    fields = json.loads(raw)

    return {
        "university": fields.get("university"),
        "studentName": fields.get("studentName"),
        "degree": fields.get("degree"),
        "degreeAwardedDate": fields.get("degreeAwardedDate"),
        "hiddenIdentifier": fields.get("hiddenIdentifier"),
    }

@app.post("/extract")
def extract():
    if "image" not in request.files:
        return jsonify({"error": "image file is required"}), 400
    image_bytes = request.files["image"].read()
    try:
        fields = extract_fields(image_bytes)

        print("\n" + "=" * 50)
        print("  EXTRACTION RESULT")
        print("=" * 50)
        print(f"  University      : {fields['university'] or 'not found'}")
        print(f"  Student Name    : {fields['studentName'] or 'not found'}")
        print(f"  Degree          : {fields['degree'] or 'not found'}")
        print(f"  Awarded Date    : {fields['degreeAwardedDate'] or 'not found'}")
        print(f"  Cert ID         : {fields['hiddenIdentifier'] or 'not found'}")
        print("=" * 50 + "\n")

        return jsonify(fields)
    except Exception as e:
        app.logger.error("OCR error: %s", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3002))
    app.run(host="0.0.0.0", port=port)
