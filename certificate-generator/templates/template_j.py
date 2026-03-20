from PIL import Image, ImageDraw, ImageFont
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except OSError:
        print(f"Warning: could not load font: {path}")
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


def create_diploma(output_path, data=None):
    if data is None:
        data = {}

    canvas_width = 2550
    canvas_height = 3300
    bg_color = (245, 245, 248)

    image = Image.new("RGB", (canvas_width, canvas_height), bg_color)
    draw = ImageDraw.Draw(image)

    fill_colour = "#415C73"

    university_name = "GLEN UNIVERSITY"
    intro_text = data.get(
        "intro_text",
        "The Senate of the University on the recommendation\nof the Faculty of Engineering and Applied Sciences\nhas conferred upon",
    )
    recipient_name = data.get("recipient_name", "Marcus Vance")
    degree_label = "the degree of"
    degree_title = data.get("degree_title", "Bachelor of Software Engineering")
    program_type = data.get("program_type", "in the Advanced Program")
    rights_text = "with all its rights, privileges\nand obligations"
    date_text = data.get(
        "date_text",
        "Given at Peterborough, Ontario, Canada this 14th day of May, 2024",
    )

    FONT_DIR = BASE_DIR / "fonts"
    font_title = load_font(FONT_DIR / "times.ttf", 200)
    font_intro = load_font(FONT_DIR / "times.ttf", 65)
    font_name = load_font(FONT_DIR / "times.ttf", 140)
    font_sig = load_font(FONT_DIR / "timesi.ttf", 40)
    font_date = load_font(FONT_DIR / "timesi.ttf", 50)
    font_italic = load_font(FONT_DIR / "timesi.ttf", 65)
    font_degree = load_font(FONT_DIR / "times.ttf", 100)
    font_small = load_font(FONT_DIR / "times.ttf", 55)
    font_signature = load_font(FONT_DIR / "times.ttf", 45)

    def draw_centered_text(text, y_pos, font, fill_color=(40, 45, 50), spacing=20):
        bbox = draw.textbbox((0, 0), text, font=font, spacing=spacing)
        text_width = bbox[2] - bbox[0]
        x_pos = (canvas_width - text_width) / 2
        draw.multiline_text(
            (x_pos, y_pos),
            text,
            fill=fill_color,
            font=font,
            align="center",
            spacing=spacing,
        )

    draw_centered_text(university_name, 200, font_title, fill_color=fill_colour)
    draw_centered_text(intro_text, 650, font_intro, spacing=25, fill_color=fill_colour)
    draw_centered_text(recipient_name, 1050, font_name, fill_color=fill_colour)
    draw_centered_text(degree_label, 1300, font_italic, fill_color=fill_colour)

    degree_lines = wrap_text(draw, degree_title, font_degree, canvas_width - 300)
    degree_y = 1450
    for line in degree_lines:
        draw_centered_text(line, degree_y, font_degree, fill_color=fill_colour)
        degree_y += 110

    draw_centered_text(program_type, 1650, font_intro, fill_color=fill_colour)
    draw_centered_text(rights_text, 1950, font_intro, spacing=25, fill_color=fill_colour)
    draw_centered_text(date_text, 3100, font_sig)

    def paste_signature(img_path, line_x_start, line_y, max_width=500, max_height=180):
        full_img_path = Path(img_path)
        if os.path.exists(full_img_path):
            try:
                sig = Image.open(full_img_path).convert("RGBA")
                sig.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

                line_width = 600
                paste_x = line_x_start + int((line_width - sig.width) / 2)
                paste_y = line_y - sig.height - 10

                image.paste(sig, (paste_x, paste_y), sig)
            except Exception as e:
                print(f"Error loading {img_path}: {e}")
        else:
            print(f"Signature image {img_path} not found. Leaving blank above line.")

    text_color = (40, 45, 50)
    line_color = (60, 60, 60)

    sig_file_1 = BASE_DIR.parent / "assets" / "signatures" / "sig5.png"
    sig_file_2 = BASE_DIR.parent / "assets" / "signatures" / "sig6.png"
    sig_file_3 = BASE_DIR.parent / "assets" / "signatures" / "sig7.png"

    paste_signature(sig_file_1, 250, 2550)
    draw.line([(250, 2550), (850, 2550)], fill=line_color, width=3)
    draw.text((260, 2570), "President & Vice Chancellor", font=font_sig, fill=text_color)

    paste_signature(sig_file_2, 250, 2850)
    draw.line([(250, 2850), (850, 2850)], fill=line_color, width=3)
    draw.text((260, 2870), "Dean of Engineering", font=font_sig, fill=text_color)

    paste_signature(sig_file_3, 950, 2550)
    draw.line([(950, 2550), (1550, 2550)], fill=line_color, width=3)
    draw.text((960, 2570), "University Registrar", font=font_sig, fill=text_color)

    seal_path = BASE_DIR.parent / "assets" / "seals" / "seal5.png"
    seal_size = (600, 700)
    seal_position = (1750, 2300)

    if os.path.exists(seal_path):
        try:
            seal = Image.open(seal_path).convert("RGBA")
            seal = seal.resize(seal_size, Image.Resampling.LANCZOS)
            image.paste(seal, seal_position, seal)
        except Exception as e:
            print(f"Error loading seal: {e}")
    else:
        print("seal image not found. Drawing a placeholder.")
        draw.ellipse(
            [
                seal_position[0],
                seal_position[1],
                seal_position[0] + seal_size[0],
                seal_position[1] + seal_size[1],
            ],
            outline=(200, 170, 80),
            width=10,
        )
        draw.text(
            (seal_position[0] + 150, seal_position[1] + 280),
            "SEAL PLACEHOLDER",
            font=font_small,
            fill=(200, 170, 80),
        )

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, format="PNG")
    print(f"Degree successfully generated and saved as {output_path}")


def generate_template_j(output_path, student):
    honours = student.get("honours", "").strip()

    intro_lines = [
        "The Senate of the University on the recommendation",
        f"of {student['faculty']}",
        "has conferred upon",
    ]

    program_type = honours if honours else "in the Advanced Program"

    data = {
        "intro_text": "\n".join(intro_lines),
        "recipient_name": student["student_name"],
        "degree_title": student["program"],
        "program_type": program_type,
        "date_text": f"Given at Peterborough, Ontario, Canada, {student['date_line']}",
    }

    create_diploma(output_path, data)


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Bachelor of Software Engineering",
        "faculty": "the Faculty of Engineering and Applied Science",
        "honours": "with Distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_j("test_template_j.png", sample_student)