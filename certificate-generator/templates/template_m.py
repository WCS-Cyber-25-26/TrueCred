from PIL import Image, ImageDraw, ImageFont, Image
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except IOError:
        print(f"Could not load font: {path}")
        return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        test = f"{current} {word}".strip()
        bbox = draw.textbbox((0, 0), test, font=font)
        width = bbox[2] - bbox[0]

        if width <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def create_degree(
    output_path,
    data=None,
    crest_path=BASE_DIR.parent / "assets" / "seals" / "crest4.png",
    seal_path=BASE_DIR.parent / "assets" / "seals" / "seal4.png",
    sig1_path=BASE_DIR.parent / "assets" / "signatures" / "sig6.png",
    sig2_path=BASE_DIR.parent / "assets" / "signatures" / "sig7.png",
):
    if data is None:
        data = {}

    width, height = 3508, 2480
    background_color = (255, 255, 255)
    img = Image.new("RGB", (width, height), background_color)
    draw = ImageDraw.Draw(img)

    FONT_DIR = BASE_DIR / "fonts"
    header_font = load_font(FONT_DIR / "times.ttf", 190)
    name_font = load_font(FONT_DIR / "timesbd.ttf", 120)
    body_italic_font = load_font(FONT_DIR / "timesi.ttf", 70)
    degree_bold_font = load_font(FONT_DIR / "timesbd.ttf", 110)
    sub_body_bold = load_font(FONT_DIR / "timesbd.ttf", 80)
    sig_label_font = load_font(FONT_DIR / "timesi.ttf", 50)

    text_color = "#5F6762"
    center_x = width // 2

    def paste_image(path, pos, size):
        try:
            temp_img = Image.open(path).convert("RGBA")
            temp_img.thumbnail(size)
            img.paste(temp_img, pos, temp_img)
        except Exception as e:
            print(f"Could not load image at {path}: {e}")

    paste_image(crest_path, (200, 150), (550, 550))
    paste_image(seal_path, (2500, 1900), (550, 550))

    student_name = data.get("student_name", "Reagan Lee")
    degree_title = data.get("degree_title", "Bachelor of Science")
    honours_line = data.get("honours_line", "")
    date_line = data.get("date_line", "Given at Ottawa, Canada, this 9th day of June, 2026.")

    draw.text((center_x + 150, 380), "BANKS UNIVERSITY", fill=text_color, font=header_font, anchor="mm")

    curr_y = 700
    draw.text((center_x, curr_y), "The Senate of Banks University", fill=text_color, font=body_italic_font, anchor="mm")
    curr_y += 110
    draw.text((center_x, curr_y), "hereby admits", fill=text_color, font=body_italic_font, anchor="mm")

    curr_y += 130
    draw.text((center_x, curr_y), student_name, fill=text_color, font=name_font, anchor="mm")

    curr_y += 130
    draw.text((center_x, curr_y), "who has fulfilled all the requirements and completed the", fill=text_color, font=body_italic_font, anchor="mm")
    curr_y += 110
    draw.text((center_x, curr_y), "prescribed course of study to the degree of", fill=text_color, font=body_italic_font, anchor="mm")

    curr_y += 130
    degree_lines = wrap_text(draw, degree_title, degree_bold_font, 2500)
    for line in degree_lines:
        draw.text((center_x, curr_y), line, fill=text_color, font=degree_bold_font, anchor="mm")
        curr_y += 110

    if honours_line:
        honours_lines = wrap_text(draw, honours_line, sub_body_bold, 2400)
        for line in honours_lines:
            draw.text((center_x, curr_y), line, fill=text_color, font=sub_body_bold, anchor="mm")
            curr_y += 110

    curr_y += 20
    draw.text((center_x, curr_y), "with all its rights and privileges in witness whereof", fill=text_color, font=body_italic_font, anchor="mm")
    curr_y += 110
    draw.text((center_x, curr_y), "the Seal of the University is hereunto affixed.", fill=text_color, font=body_italic_font, anchor="mm")
    curr_y += 110
    draw.text((center_x, curr_y), date_line, fill=text_color, font=body_italic_font, anchor="mm")

    sig_y_base = 2100

    paste_image(sig1_path, (750, sig_y_base - 50), (500, 250))
    draw.text((1000, sig_y_base + 200), "Chancellor", fill=text_color, font=sig_label_font, anchor="mt")

    paste_image(sig2_path, (1650, sig_y_base - 50), (600, 250))
    draw.text((1950, sig_y_base + 200), "President and Vice-Chancellor", fill=text_color, font=sig_label_font, anchor="mt")
    draw.text((1950, sig_y_base + 280), "Chair of the Senate", fill=text_color, font=sig_label_font, anchor="mt")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, format="PNG")
    print(f"Degree layout created successfully: {output_path}")


def generate_template_m(output_path, student):
    honours = student.get("honours", "").strip()

    data = {
        "student_name": student["student_name"],
        "degree_title": student["program"],   # keep full program intact
        "honours_line": honours if honours else "",
        "date_line": f"Given at Ottawa, Canada, {student['date_line']}.",
    }

    create_degree(output_path=output_path, data=data)


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Bachelor of Laws (LLB)",
        "faculty": "the Faculty of Law",
        "honours": "with Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_m("test_banks_template.png", sample_student)