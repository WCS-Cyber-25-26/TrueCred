from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
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


def create_landscape_degree(output_path, data=None):
    if data is None:
        data = {}

    width, height = 3300, 2550
    bg_color = (255, 255, 255)
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    FONT_DIR = BASE_DIR / "fonts"
    font_uni = load_font(FONT_DIR / "times.ttf", 150)
    font_name = load_font(FONT_DIR / "times.ttf", 120)
    font_degree = load_font(FONT_DIR / "times.ttf", 110)
    font_major = load_font(FONT_DIR / "times.ttf", 70)
    font_italic = load_font(FONT_DIR / "timesi.ttf", 65)
    font_sig_title = load_font(FONT_DIR / "timesi.ttf", 35)
    font_date = load_font(FONT_DIR / "timesi.ttf", 60)

    university = "LAKEFRONT METROPOLITAN UNIVERSITY"
    intro_text = (
        "The Chancellor and Senate of Lakefront Metropolitan University in Toronto, Ontario, confer on"
    )
    student_name = data.get("student_name", "Eleanor Jane Vance")
    fulfillment_text = data.get(
        "fulfillment_text",
        "who has fulfilled all the requirements of the program of study, the degree of",
    )
    degree_name = data.get("degree_name", "BACHELOR OF SCIENCE")
    major_name = data.get("major_name", "COMPUTER ENGINEERING")
    rights_text = "and grant all the rights and privileges attendant thereon."
    witness_text = (
        "In witness whereof we have hereto subscribed our names and affixed the Seal of the University."
    )
    date_text = data.get("date_text", "May 2026")
    text_color = (30, 30, 30)

    def draw_centered(text, y, font, fill=text_color):
        bbox = draw.textbbox((0, 0), text, font=font)
        w = bbox[2] - bbox[0]
        draw.text(((width - w) / 2, y), text, font=font, fill=fill)

    try:
        logo = Image.open(BASE_DIR.parent / "assets" / "seals" / "crest5.png").convert("RGBA")
        logo = logo.resize((300, 400), Image.LANCZOS)
        img.paste(logo, ((width - 350) // 2, 75), logo)
    except FileNotFoundError:
        pass

    draw_centered(university, 550, font_uni)
    draw_centered(intro_text, 780, font_italic)
    draw_centered(student_name, 880, font_name)

    fulfillment_lines = wrap_text(draw, fulfillment_text, font_italic, width - 300)
    y = 1100
    for line in fulfillment_lines:
        draw_centered(line, y, font_italic)
        y += 85

    draw_centered(degree_name, 1380, font_degree)
    draw_centered(major_name, 1530, font_major)

    draw_centered(rights_text, 1690, font_italic)
    draw_centered(witness_text, 1800, font_italic)

    line_y = 2200
    line_width = 500
    left_center_x = width // 3
    right_center_x = (width * 2) // 3

    draw.line(
        [left_center_x - line_width // 2, line_y, left_center_x + line_width // 2, line_y],
        fill=text_color,
        width=2,
    )
    t1_bbox = draw.textbbox((0, 0), "Chancellor", font=font_sig_title)
    draw.text(
        (left_center_x - (t1_bbox[2] - t1_bbox[0]) // 2, line_y + 15),
        "Chancellor",
        font=font_sig_title,
        fill=text_color,
    )

    try:
        sig1 = Image.open(BASE_DIR.parent / "assets" / "signatures" / "sig6.png").convert("RGBA")
        sig1.thumbnail((400, 150), Image.LANCZOS)
        s1_w, s1_h = sig1.size
        img.paste(sig1, (left_center_x - s1_w // 2, line_y - s1_h - 10), sig1)
    except FileNotFoundError:
        pass

    draw.line(
        [right_center_x - line_width // 2, line_y, right_center_x + line_width // 2, line_y],
        fill=text_color,
        width=2,
    )
    t2_bbox = draw.textbbox((0, 0), "President and Vice Chancellor", font=font_sig_title)
    draw.text(
        (right_center_x - (t2_bbox[2] - t2_bbox[0]) // 2, line_y + 15),
        "President and Vice Chancellor",
        font=font_sig_title,
        fill=text_color,
    )

    try:
        sig2 = Image.open(BASE_DIR.parent / "assets" / "signatures" / "sig5.png").convert("RGBA")
        sig2.thumbnail((400, 150), Image.LANCZOS)
        s2_w, s2_h = sig2.size
        img.paste(sig2, (right_center_x - s2_w // 2, line_y - s2_h - 10), sig2)
    except FileNotFoundError:
        pass

    draw_centered(date_text, 2300, font_date)

    try:
        seal = Image.open(BASE_DIR.parent / "assets" / "seals" / "seal7.png").convert("RGBA")
        seal = seal.resize((450, 450), Image.LANCZOS)
        img.paste(seal, (width - 600, height - 580), seal)
    except FileNotFoundError:
        pass

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path)
    print(f"Saved: {output_path}")


def generate_template_e(output_path, student):
    honours = student.get("honours", "").strip()

    fulfillment_text = "who has fulfilled all the requirements of the program of study"
    if honours:
        fulfillment_text += f", {honours.lower()}, the degree of"
    else:
        fulfillment_text += ", the degree of"

    date_text = student["date_line"].replace("the ", "")

    data = {
        "student_name": student["student_name"],
        "fulfillment_text": fulfillment_text,
        "degree_name": student["program"].upper(),
        "major_name": student["faculty"].replace("the ", "").upper(),
        "date_text": date_text,
    }

    create_landscape_degree(output_path, data)


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Bachelor of Science in Computer Science",
        "faculty": "the Faculty of Engineering and Applied Science",
        "honours": "with Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_e("test_template_e.png", sample_student)