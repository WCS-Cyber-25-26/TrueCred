from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def load_font(path, size):
    try:
        return ImageFont.truetype(str(path), size)
    except Exception:
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
    crest_path=BASE_DIR.parent / "assets" / "seals" / "crest6.png",
    seal_path=BASE_DIR.parent / "assets" / "seals" / "seal8.png",
    sig1_path=BASE_DIR.parent / "assets" / "signatures" / "sig7.png",
    sig2_path=BASE_DIR.parent / "assets" / "signatures" / "sig2.png",
    sig3_path=BASE_DIR.parent / "assets" / "signatures" / "sig5.png",
    output_path="university_of_eastern_yukon_d.png",
    data=None,
):
    if data is None:
        data = {}

    student_name = data.get("student_name", "MARCUS ALEXANDER REID").upper()
    program = data.get("program", "BACHELOR OF MEDICAL SCIENCES").upper()
    sub_lines = data.get("sub_lines", [])
    faculty = data.get("faculty", "the Schulich School of Health & Medicine")
    faculty2 = data.get("faculty2", "and the Faculty of Science")
    date_line1 = data.get("date_line1", "Given at Whitehorse, Canada, on the fourteenth day of June,")
    date_line2 = data.get("date_line2", "two thousand and twenty-four,")
    date_line3 = data.get("date_line3", "in the one hundred and fifty-eighth year of the University")

    width, height = 2550, 3300
    img = Image.new("RGB", (width, height), (252, 251, 249))
    draw = ImageDraw.Draw(img)
    cx = width // 2

    PURPLE = (72, 48, 120)
    BLACK = (18, 14, 10)
    DARK = (38, 34, 30)
    GREY = (110, 105, 100)

    FONT_DIR = BASE_DIR / "fonts"
    ITALIC = FONT_DIR / "Book Antiqua Italic.ttf"
    BOLD = FONT_DIR / "Adobe Caslon Pro Semibold.ttf"
    BOLD_ITALIC = FONT_DIR / "Book Antiqua Bold Italic.ttf"

    f_ti = load_font(ITALIC, 130)
    f_tb = load_font(BOLD, 130)
    f_body = load_font(ITALIC, 58)
    f_name = load_font(BOLD, 70)
    f_degree = load_font(BOLD, 70)
    f_sub = load_font(BOLD_ITALIC, 68)
    f_rights = load_font(ITALIC, 68)
    f_lbl = load_font(ITALIC, 46)

    def tw(font, text):
        bb = draw.textbbox((0, 0), text, font=font)
        return bb[2] - bb[0]

    def th(font, text):
        bb = draw.textbbox((0, 0), text, font=font)
        return bb[3] - bb[1]

    def draw_center(y, text, font, fill=DARK):
        x = (width - tw(font, text)) // 2
        draw.text((x, y), text, font=font, fill=fill)
        return y + th(font, text)

    def draw_center_mixed(y, segments, fill=PURPLE):
        total_w = sum(tw(f, t) for f, t in segments)
        x = (width - total_w) // 2
        max_h = 0
        for f, t in segments:
            draw.text((x, y), t, font=f, fill=fill)
            x += tw(f, t)
            max_h = max(max_h, th(f, t))
        return y + max_h

    def paste_image(path, cx_img, top_y, max_w, max_h):
        try:
            asset = Image.open(str(path)).convert("RGBA")
            scale = min(max_w / asset.width, max_h / asset.height)
            nw = max(1, int(asset.width * scale))
            nh = max(1, int(asset.height * scale))
            asset = asset.resize((nw, nh), Image.LANCZOS)
            img.paste(asset, (cx_img - nw // 2, top_y), asset)
            return nh
        except Exception:
            draw.rectangle(
                [cx_img - max_w // 2, top_y, cx_img + max_w // 2, top_y + max_h],
                outline=GREY,
                width=3,
            )
            return max_h

    def paste_image_centre(path, cx_img, cy_img, max_w, max_h):
        try:
            asset = Image.open(str(path)).convert("RGBA")
            scale = min(max_w / asset.width, max_h / asset.height)
            nw = max(1, int(asset.width * scale))
            nh = max(1, int(asset.height * scale))
            asset = asset.resize((nw, nh), Image.LANCZOS)
            img.paste(asset, (cx_img - nw // 2, cy_img - nh // 2), asset)
        except Exception:
            r = min(max_w, max_h) // 2
            draw.ellipse([cx_img - r, cy_img - r, cx_img + r, cy_img + r], outline=GREY, width=3)

    def paste_sig(path, cx_img, baseline_y, max_w, max_h):
        try:
            asset = Image.open(str(path)).convert("RGBA")
            scale = min(max_w / asset.width, max_h / asset.height)
            nw = max(1, int(asset.width * scale))
            nh = max(1, int(asset.height * scale))
            asset = asset.resize((nw, nh), Image.LANCZOS)
            img.paste(asset, (cx_img - nw // 2, baseline_y - nh), asset)
        except Exception:
            pass

    crest_h = paste_image(crest_path, cx, top_y=120, max_w=700, max_h=620)
    curr_y = 120 + crest_h + 60

    curr_y = draw_center_mixed(curr_y, [
        (f_ti, "The "),
        (f_tb, "UNIVERSITY"),
        (f_ti, "of"),
    ], fill=PURPLE)
    curr_y += 8
    curr_y = draw_center(curr_y, "EASTERN YUKON", f_tb, PURPLE)
    curr_y += 100

    for line in [
        "The Senate on the recommendation of",
        faculty,
        faculty2,
        "has conferred upon",
    ]:
        if line.strip():
            curr_y = draw_center(curr_y, line, f_body, DARK)
            curr_y += 14
    curr_y += 100

    curr_y = draw_center(curr_y, student_name, f_name, BLACK)
    curr_y += 100

    curr_y = draw_center(curr_y, "the degree of", f_body, DARK)
    curr_y += 100

    degree_lines = wrap_text(draw, program, f_degree, width - 300)
    for line in degree_lines:
        curr_y = draw_center(curr_y, line, f_degree, BLACK)
        curr_y += 20

    curr_y += 20

    for line in sub_lines:
        if line.strip():
            curr_y = draw_center(curr_y, line.title(), f_body, DARK)
            curr_y += 30
    curr_y += 60

    curr_y = draw_center(curr_y, "with all its rights, privileges and obligations", f_rights, DARK)
    curr_y += 70

    for line in [date_line1, date_line2, date_line3]:
        if line.strip():
            curr_y = draw_center(curr_y, line, f_body, DARK)
            curr_y += 12

    seal_size = 480
    seal_cx = 200 + seal_size // 2
    seal_cy = height - 120 - seal_size // 2
    paste_image_centre(seal_path, seal_cx, seal_cy, seal_size, seal_size)

    MARGIN = 160
    SIG_LEFT = cx + 80
    SIG_RIGHT = width - MARGIN
    SIG_W = SIG_RIGHT - SIG_LEFT
    sig_cx = SIG_LEFT + SIG_W // 2

    sig_area_top = height - 650
    sig_gap = 250

    sigs = [
        (sig1_path, sig_area_top + sig_gap * 0, "President and Vice-Chancellor"),
        (sig2_path, sig_area_top + sig_gap * 1, "Registrar"),
        (sig3_path, sig_area_top + sig_gap * 2, "Dean"),
    ]

    for path, sig_y, label in sigs:
        paste_sig(path, sig_cx, sig_y + 50, SIG_W - 20, 160)
        draw.line([(SIG_LEFT, sig_y), (SIG_RIGHT, sig_y)], fill=(180, 175, 170), width=2)
        label_x = SIG_RIGHT - tw(f_lbl, label)
        draw.text((label_x, sig_y + 8), label, font=f_lbl, fill=GREY)

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    img.save(output_path, "PNG", dpi=(300, 300))
    print(f"Saved -> {output_path}")


def generate_template_d(output_path, student):
    honours = student.get("honours", "").strip()

    sub_lines = []
    if honours:
        sub_lines.append(honours.title())

    data = {
        "student_name": student["student_name"],
        "program": student["program"],
        "sub_lines": sub_lines,
        "faculty": student["faculty"],
        "faculty2": "",
        "date_line1": f"Given at Whitehorse, Canada, {student['date_line']},",
        "date_line2": "",
        "date_line3": "",
    }

    create_degree(
        output_path=output_path,
        data=data,
    )


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Kwaku Mensah",
        "program": "Bachelor of Laws (LLB)",
        "faculty": "the Faculty of Law",
        "honours": "with distinction",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    generate_template_d("test_template_d.png", sample_student)