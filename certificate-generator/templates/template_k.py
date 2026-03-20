from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except IOError:
        print(f"Warning: could not load font: {path}")
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


def create_degree(output_path, data=None):
    if data is None:
        data = {}

    width, height = 1600, 1100
    background_color = "#F7F5EE"
    img = Image.new("RGB", (width, height), color=background_color)
    draw = ImageDraw.Draw(img)

    FONT_DIR = BASE_DIR / "fonts"
    font_title = load_font(FONT_DIR / "times.ttf", 60)
    font_name = load_font(FONT_DIR / "times.ttf", 55)
    font_degree = load_font(FONT_DIR / "times.ttf", 55)
    font_small = load_font(FONT_DIR / "times.ttf", 16)
    font_date = load_font(FONT_DIR / "timesi.ttf", 18)
    font_sig = load_font(FONT_DIR / "times.ttf", 14)

    text_black = "#111111"
    text_crimson = "#990000"

    university_name = "FLAXTON UNIVERSITY"
    senate_text = data.get(
        "senate_text",
        "THE CHANCELLOR AND SENATE OF FLAXTON UNIVERSITY IN TORONTO, CANADA, CONFER ON",
    )
    recipient_name = data.get("recipient_name", "Mike Ross")
    completion_text = data.get(
        "completion_text",
        "WHO HAS COMPLETED TO THE SATISFACTION OF THE FACULTY OF GRADUATE STUDIES\n"
        "ALL THE REQUIREMENTS OF THE COURSE OF STUDY APPOINTED BY THE STATUTES\n"
        "OF THE UNIVERSITY, THE DEGREE OF",
    )
    degree_title = data.get("degree_title", "Doctor of Philosophy")
    honours_text = data.get(
        "honours_text",
        "AND GRANT ALL THE HONOURS, RIGHTS AND PRIVILEGES WHICH APPERTAIN\nTO THIS DEGREE.",
    )
    date_text = data.get("date_text", "May 2026")

    try:
        logo_path = BASE_DIR.parent / "assets" / "seals" / "crest2.png"
        logo_img = Image.open(logo_path).convert("RGBA")
        logo_img.thumbnail((275, 375), Image.Resampling.LANCZOS)
        img.paste(logo_img, (180, 80), logo_img)
    except FileNotFoundError:
        print("Warning: Crest image not found.")

    try:
        seal_path = BASE_DIR.parent / "assets" / "seals" / "seal2.png"
        seal_img = Image.open(seal_path).convert("RGBA")
        seal_img = seal_img.resize((300, 300), Image.Resampling.LANCZOS)
        img.paste(seal_img, (140, 700), seal_img)
    except FileNotFoundError:
        print("Warning: Red Seal image not found.")

    text_margin_left = 650

    draw.text((text_margin_left, 150), university_name, fill=text_black, font=font_title)
    draw.text((text_margin_left, 260), senate_text, fill=text_black, font=font_small)
    draw.text((text_margin_left, 350), recipient_name, fill=text_crimson, font=font_name)

    draw.multiline_text(
        (text_margin_left, 450),
        completion_text,
        fill=text_black,
        font=font_small,
        spacing=8,
    )

    degree_lines = wrap_text(draw, degree_title, font_degree, 850)
    degree_y = 560
    for line in degree_lines:
        draw.text((text_margin_left, degree_y), line, fill=text_crimson, font=font_degree)
        degree_y += 60

    draw.multiline_text(
        (text_margin_left, 670),
        honours_text,
        fill=text_black,
        font=font_small,
        spacing=8,
    )
    draw.text((text_margin_left, 780), date_text, fill=text_black, font=font_date)

    sig_y = 920
    president_x = text_margin_left + 400

    line_start_x = text_margin_left - 10
    line_end_x = (president_x + 350) + 120

    dash_length = 2
    dash_gap = 2
    for x in range(line_start_x, int(line_end_x), dash_length + dash_gap):
        draw.line([(x, sig_y), (x + dash_length, sig_y)], fill=text_black, width=1)

    try:
        chancellor_sig = Image.open(
            BASE_DIR.parent / "assets" / "signatures" / "sig4.png"
        ).convert("RGBA")
        chancellor_sig = chancellor_sig.resize((200, 60), Image.Resampling.LANCZOS)
        img.paste(chancellor_sig, (text_margin_left + 20, sig_y - 60), chancellor_sig)
    except FileNotFoundError:
        print("Warning: Chancellor signature not found.")

    draw.text((text_margin_left, sig_y + 10), "CHANCELLOR", fill=text_black, font=font_sig)

    try:
        president_sig = Image.open(
            BASE_DIR.parent / "assets" / "signatures" / "sig5.png"
        ).convert("RGBA")
        president_sig = president_sig.resize((350, 70), Image.Resampling.LANCZOS)
        img.paste(president_sig, (president_x + 50, sig_y - 60), president_sig)
    except FileNotFoundError:
        print("Warning: President signature not found.")

    draw.text(
        (president_x, sig_y + 10),
        "PRESIDENT AND VICE-CHANCELLOR",
        fill=text_black,
        font=font_sig,
    )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(output_path, format="PNG")
    print(f"Degree saved as {output_path}")


def generate_template_k(output_path, student):
    honours = student.get("honours", "").strip()
    faculty = student.get("faculty", "the Faculty of Graduate Studies")

    senate_text = (
        "THE CHANCELLOR AND SENATE OF FLAXTON UNIVERSITY IN TORONTO, CANADA, CONFER ON"
    )

    completion_lines = [
        f"WHO HAS COMPLETED TO THE SATISFACTION OF {faculty.upper()}",
        "ALL THE REQUIREMENTS OF THE COURSE OF STUDY APPOINTED BY THE STATUTES",
        "OF THE UNIVERSITY, THE DEGREE OF",
    ]

    honours_lines = ["AND GRANT ALL THE HONOURS, RIGHTS AND PRIVILEGES WHICH APPERTAIN"]
    if honours:
        honours_lines.append(f"TO THIS DEGREE, {honours.upper()}.")
    else:
        honours_lines.append("TO THIS DEGREE.")

    data = {
        "senate_text": senate_text,
        "recipient_name": student["student_name"],
        "completion_text": "\n".join(completion_lines),
        "degree_title": student["program"],
        "honours_text": "\n".join(honours_lines),
        "date_text": student["date_line"],
    }

    create_degree(output_path, data)


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Doctor of Philosophy in Biochemistry",
        "faculty": "the Faculty of Graduate Studies",
        "honours": "with Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_k("test_template_k.png", sample_student)