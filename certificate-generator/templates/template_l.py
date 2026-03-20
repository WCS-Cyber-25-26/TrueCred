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
        text_width = bbox[2] - bbox[0]

        if text_width <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
            current = word

    if current:
        lines.append(current)

    return lines


def format_date_for_certificate(date_line: str) -> str:
    # Converts:
    # "the Twenty-Third Day of May, 2025"
    # to something still readable in this template
    return date_line[0].upper() + date_line[1:] if date_line else ""


def create_certificate(output_filename, data=None):
    if data is None:
        data = {}

    width, height = 3300, 2550
    img = Image.new("RGB", (width, height), color="white")
    draw = ImageDraw.Draw(img)

    FONT_DIR = BASE_DIR / "fonts"
    font_logo = load_font(FONT_DIR / "times.ttf", 100)
    font_small = load_font(FONT_DIR / "oldenglishtextmt.ttf", 60)
    font_name = load_font(FONT_DIR / "AlexBrush-Regular.ttf", 180)
    font_degree = load_font(FONT_DIR / "oldenglishtextmt.ttf", 160)
    font_date = load_font(FONT_DIR / "oldenglishtextmt.ttf", 70)
    font_sig_title = load_font(FONT_DIR / "oldenglishtextmt.ttf", 40)

    def draw_centered_text(y_pos, text, font, fill="black"):
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        x_pos = (width - text_width) / 2
        draw.text((x_pos, y_pos), text, font=font, fill=fill)

    navy_blue = "#052764"

    recipient_name = data.get("recipient_name", "Alex Morgan")
    degree_title = data.get("degree_title", "Honours Bachelor of Computer Science")
    honours_line = data.get("honours_line", "with High Distinction")
    date_text = data.get("date_text", "March 18, 2026")

    try:
        logo_path = BASE_DIR.parent / "assets" / "seals" / "crest3.png"
        logo_img = Image.open(logo_path).convert("RGBA")
        logo_img.thumbnail((275, 375), Image.Resampling.LANCZOS)
        img.paste(logo_img, ((width - logo_img.width) // 2, 80), logo_img)
    except FileNotFoundError:
        print("Warning: Crest image not found.")

    draw_centered_text(400, "UNIVERSITY OF", font_logo, fill=navy_blue)
    draw_centered_text(500, "TECHNOLOGY", font_logo, fill=navy_blue)
    draw_centered_text(700, "This is to certify that", font_small)
    draw_centered_text(850, recipient_name, font_name, fill=navy_blue)

    text_req = [
        "has fulfilled the requirements of the University of Technology and has been admitted",
        "under the authority of the Governing Council of the University to the degree of",
    ]
    draw_centered_text(1150, text_req[0], font_small)
    draw_centered_text(1230, text_req[1], font_small)

    degree_lines = wrap_text(draw, degree_title, font_degree, width - 400)
    degree_y = 1380
    for line in degree_lines:
        draw_centered_text(degree_y, line, font_degree, fill=navy_blue)
        degree_y += 120

    draw_centered_text(1550, honours_line, font_date)
    draw_centered_text(
        1675,
        "In witness whereof we have hereto subscribed our names and affixed the academic seal of the University",
        font_small,
    )
    draw_centered_text(1750, date_text, font_date, fill=navy_blue)

    try:
        seal_path = BASE_DIR.parent / "assets" / "seals" / "seal3.png"
        seal_img = Image.open(seal_path).convert("RGBA")
        seal_img = seal_img.resize((420, 420), Image.Resampling.LANCZOS)
        img.paste(seal_img, ((width - seal_img.width) // 2, 1880), seal_img)
    except FileNotFoundError:
        print("Warning: Red Seal image not found.")

    sig_y_line = 2400
    margin = 350
    available_width = width - (2 * margin)
    spacing = available_width / 3

    titles = ["President", "Secretary of the Council", "Dean of Faculty", "Principal of College"]
    sig_filenames = ["sig4.png", "sig7.png", "sig6.png", "sig5.png"]

    for i in range(4):
        center_x = margin + (spacing * i)

        line_half_width = 250
        draw.line(
            [center_x - line_half_width, sig_y_line, center_x + line_half_width, sig_y_line],
            fill="black",
            width=3,
        )

        try:
            sig_path = BASE_DIR.parent / "assets" / "signatures" / sig_filenames[i]
            sig_img = Image.open(sig_path).convert("RGBA")
            sig_img.thumbnail((400, 150), Image.Resampling.LANCZOS)

            sig_x = int(center_x - (sig_img.width / 2))
            sig_y = sig_y_line - sig_img.height - 10

            img.paste(sig_img, (sig_x, sig_y), sig_img)
        except FileNotFoundError:
            print(f"Warning: {sig_filenames[i]} not found. Skipping image.")

        t_bbox = draw.textbbox((0, 0), titles[i], font=font_sig_title)
        t_width = t_bbox[2] - t_bbox[0]
        draw.text((center_x - (t_width / 2), sig_y_line + 20), titles[i], font=font_sig_title, fill="black")

    Path(output_filename).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_filename, format="PNG")
    print(f"Final certificate saved as '{output_filename}'")


def generate_template_l(output_path, student):
    honours = student.get("honours", "").strip()
    honours_line = honours if honours else "Granted by the University"

    data = {
        "recipient_name": student["student_name"],
        "degree_title": student["program"],
        "honours_line": honours_line,
        "date_text": format_date_for_certificate(student["date_line"]),
    }

    create_certificate(output_path, data)


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Honours Bachelor of Computer Science",
        "faculty": "the Faculty of Computing and Information Studies",
        "honours": "with High Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_l("test_template_l.png", sample_student)