from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import textwrap

BASE_DIR = Path(__file__).resolve().parent


def load_font(name, size):
    """Load a font from the template directory or fall back cleanly."""
    try:
        return ImageFont.truetype(str(BASE_DIR / name), size)
    except OSError:
        return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    """Wrap text so it fits within a given width."""
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


def generate_template_a(output_path, student):
    # 1. Setup Canvas
    width, height = 2480, 3508
    bg_color = (245, 245, 248)
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # 2. Font Configuration
    font_logo = load_font(BASE_DIR / "fonts" / "Cinzel-Medium.ttf", 180)
    font_small_italic = load_font(BASE_DIR / "fonts" / "Palatino Italic Regular.ttf", 85)
    font_name = load_font(BASE_DIR / "fonts" / "Cinzel-Medium.ttf", 80)
    font_body_italic = load_font( BASE_DIR / "fonts" / "Palatino Italic Regular.ttf", 65)
    font_program = load_font(BASE_DIR / "fonts" / "Cinzel-Medium.ttf", 65)
    font_sig_title = load_font(BASE_DIR / "fonts" / "Palatino Italic Regular.ttf", 45)

    # 3. Dynamic Content from student dict
    university = "LIONSGATE UNIVERSITY"
    location = "at Kingston"
    student_name = student["student_name"].upper()
    faculty = student["faculty"].upper()
    program = student["program"].upper()
    honours = student["honours"]
    date_line = student["date_line"]

    left_margin = 250
    max_text_width = width - 2 * left_margin

    # Optional split for long program names
    program_lines = wrap_text(draw, program, font_program, max_text_width)

    # 4. Header
    uni_bbox = draw.textbbox((0, 0), university, font=font_logo)
    uni_width = uni_bbox[2] - uni_bbox[0]
    uni_x = (width - uni_width) / 2
    uni_y = 350

    draw.text((uni_x + 150, 270), "The Senate of", font=font_small_italic, fill="#443F35")
    draw.text((uni_x, uni_y), university, font=font_logo, fill="#8B5347")

    loc_bbox = draw.textbbox((0, 0), location, font=font_small_italic)
    loc_width = loc_bbox[2] - loc_bbox[0]
    draw.text((uni_x + uni_width - loc_width - 160, uni_y + 230), location, font=font_small_italic, fill="#443F35")

    # 5. Body
    def draw_body_left(text, y, font, color="#443F35"):
        draw.text((left_margin, y), text, font=font, fill=color)

    draw_body_left("witnesses that", 850, font_body_italic)
    draw_body_left(student_name, 1000, font_name)

    draw_body_left("having completed the prescribed program", 1200, font_body_italic)
    draw_body_left("and having been recommended by", 1280, font_body_italic)

    faculty_lines = wrap_text(draw, faculty, font_program, max_text_width)
    current_y = 1450
    for line in faculty_lines:
        draw_body_left(line, current_y, font_program)
        current_y += 80

    current_y += 70
    draw_body_left("is hereby granted the Degree of", current_y, font_body_italic)
    current_y += 150

    for line in program_lines:
        draw_body_left(line, current_y, font_program)
        current_y += 85

    if honours:
        current_y += 40
        draw_body_left(honours, current_y, font_body_italic)
        current_y += 100

    draw_body_left("with all its rights, privileges and responsibilities.", current_y + 40, font_body_italic)
    draw_body_left("In testimony whereof by the authority of Senate", current_y + 120, font_body_italic)
    draw_body_left("we hereto sign our names and affix the seal of Senate.", current_y + 200, font_body_italic)

    # Convert "the Twenty-Third Day of May, 2025" into a certificate sentence
    draw_body_left(f"Given at Kingston, Canada, {date_line}.", current_y + 360, font_body_italic)

    # 6. Signatures
    line_y = 2850

    signatures = [
        (left_margin, left_margin + 500, "Principal", BASE_DIR.parent / "assets" / "signatures" / "sig5.png"),
        (1000, 1500, "Dean", BASE_DIR.parent / "assets" / "signatures" / "sig6.png"),
        (1600, 2100, "Secretary of Senate", BASE_DIR.parent / "assets" / "signatures" / "sig7.png"),
    ]

    for start_x, end_x, title, sig_path in signatures:
        draw.line([start_x, line_y, end_x, line_y], fill=(0, 0, 0), width=3)

        # signature title
        t_bbox = draw.textbbox((0, 0), title, font=font_sig_title)
        t_w = t_bbox[2] - t_bbox[0]
        draw.text((end_x - t_w, line_y + 20), title, font=font_sig_title, fill=(0, 0, 0))

        try:
            s_img = Image.open(sig_path).convert("RGBA")
            s_img.thumbnail((400, 150), Image.LANCZOS)
            s_w, s_h = s_img.size
            img.paste(s_img, (int(start_x + (end_x - start_x - s_w) / 2), line_y - s_h - 10), s_img)
        except FileNotFoundError:
            pass

    # 7. Seal
    try:
        seal = Image.open(BASE_DIR.parent / "assets" / "seals" / "seal6.png").convert("RGBA")
        seal = seal.resize((450, 450), Image.LANCZOS)
        img.paste(seal, ((width - 450) // 2, 3000), seal)
    except FileNotFoundError:
        pass

    # 8. Save to the path provided by generate.py
    img.save(output_path)
  
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

    output_path = "test_template_a.png"

    generate_template_a(output_path, sample_student)

    print(f"Test certificate generated at: {output_path}")