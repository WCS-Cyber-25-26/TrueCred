from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(font_name, size):
    try:
        return ImageFont.truetype(font_name, size)
    except IOError:
        print(f"Could not load font: {font_name}")
        return ImageFont.load_default()


def paste_element(img, draw, path, pos, size):
    try:
        icon = Image.open(path).convert("RGBA")
        icon.thumbnail(size)
        img.paste(icon, pos, icon)
    except FileNotFoundError:
        draw.rectangle([pos, (pos[0] + size[0], pos[1] + size[1])], outline="gray")


def generate_template_b(output_path, student):
    # 1. Canvas Setup
    width, height = 3508, 2480
    bg_color = (255, 255, 255)
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # 2. Font Loading
    header_font = load_font("times.ttf", 160)
    body_font = load_font("times.ttf", 75)
    name_font = load_font("timesbd.ttf", 110)
    degree_font = load_font("timesbd.ttf", 95)
    latin_font = load_font("timesbd.ttf", 85)
    label_font = load_font("times.ttf", 45)

    uottawa_red = (143, 0, 26)
    text_black = (0, 0, 0)
    center_x = width // 2

    # 3. Dynamic Content
    student_name = student["student_name"]
    degree_name = student["program"]
    honours = student["honours"] if student["honours"] else ""
    date_line = student["date_line"]

    # Optional faculty usage if you want it later
    # faculty = student["faculty"]

    # 4. Header Section
    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "seals" / "crest7.png",
        (center_x - 300, 50),
        (600, 600),
    )

    line_y_top = 500
    gap_top = 320
    draw.line([(200, line_y_top), (center_x - gap_top, line_y_top)], fill=uottawa_red, width=5)
    draw.line([(center_x + gap_top, line_y_top), (3308, line_y_top)], fill=uottawa_red, width=5)

    draw.text(
        (center_x - 550, 250),
        "Université\nd'Trillium",
        fill=uottawa_red,
        font=header_font,
        anchor="rm",
        align="right",
    )
    draw.text(
        (center_x + 550, 250),
        "University\nof Trillium",
        fill=uottawa_red,
        font=header_font,
        anchor="lm",
        align="left",
    )

    # 5. Body Text
    curr_y = 750
    draw.text(
        (center_x, curr_y),
        "The Senate of the University of Trillium has conferred on",
        font=body_font,
        fill=text_black,
        anchor="mm",
    )

    curr_y += 150
    draw.text((center_x, curr_y), student_name, font=name_font, fill=text_black, anchor="mm")

    curr_y += 180
    body_text = (
        "who has fulfilled all the requirements and\n"
        "passed the prescribed examinations, the degree of"
    )
    draw.text((center_x, curr_y), body_text, font=body_font, fill=text_black, anchor="mm", align="center")

    curr_y += 180
    draw.text((center_x, curr_y), degree_name, font=degree_font, fill=text_black, anchor="mm")

    if honours:
        curr_y += 120
        draw.text((center_x, curr_y), honours, font=latin_font, fill=text_black, anchor="mm")

    curr_y += 180
    closing_text = (
        "with all the rights, honours and privileges proper to it.\n"
        "In testimony whereof we have hereto subscribed our names and caused\n"
        "the seal of the University to be affixed to this document."
    )
    draw.text((center_x, curr_y), closing_text, font=body_font, fill=text_black, anchor="mm", align="center")

    curr_y += 250
    draw.text(
        (center_x, curr_y),
        f"Given at Ottawa, {date_line}.",
        font=body_font,
        fill=text_black,
        anchor="mm",
    )

    # 6. Bottom Section (Signatures and Seal)
    seal_y = 1910
    seal_size = 500
    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "seals" / "seal9.png",
        (center_x - (seal_size // 2), seal_y),
        (seal_size, seal_size),
    )

    line_y_bottom = 2385
    gap_bottom = 300
    draw.line([(880, line_y_bottom), (center_x - gap_bottom, line_y_bottom)], fill=uottawa_red, width=4)
    draw.line([(center_x + gap_bottom, line_y_bottom), (2628, line_y_bottom)], fill=uottawa_red, width=4)

    # Left signatures
    sig_left_x = 250
    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "signatures" / "sig4.png",
        (sig_left_x, 1850),
        (500, 200),
    )
    draw.text((sig_left_x, 2050), "Chancellor", font=label_font, fill=text_black, anchor="la")

    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "signatures" / "sig5.png",
        (sig_left_x, 2140),
        (500, 200),
    )
    draw.text((sig_left_x, 2300), "President and Vice-Chancellor", font=label_font, fill=text_black, anchor="la")

    # Right signatures
    sig_right_x = 3258
    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "signatures" / "sig6.png",
        (sig_right_x - 500, 1850),
        (500, 200),
    )
    draw.text((sig_right_x, 2050), "Dean", font=label_font, fill=text_black, anchor="ra")

    paste_element(
        img,
        draw,
        BASE_DIR.parent / "assets" / "signatures" / "sig7.png",
        (sig_right_x - 500, 2140),
        (500, 200),
    )
    draw.text((sig_right_x, 2300), "Secretary-General of the University", font=label_font, fill=text_black, anchor="ra")

    # 7. Save to the generator-provided path
    img.save(output_path)
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Master of Science in Data Analytics",
        "faculty": "the Faculty of Engineering and Applied Science",
        "honours": "with Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_b("test_template_b.png", sample_student)