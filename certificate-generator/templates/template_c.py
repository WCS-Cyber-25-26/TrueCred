from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
from typing import Optional, Tuple

BASE_DIR = Path(__file__).resolve().parent


# ------------------ helpers ------------------

def load_font(font_path: str | Path | None, size: int) -> ImageFont.ImageFont:
    if font_path and Path(font_path).exists():
        return ImageFont.truetype(str(font_path), size=size)
    return ImageFont.load_default()


def draw_centered_text(draw: ImageDraw.ImageDraw, text: str, y: int,
                       font: ImageFont.ImageFont, page_w: int, fill=(0, 0, 0)):
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    draw.text(((page_w - text_w) // 2, y), text, font=font, fill=fill)


def draw_multiline_centered(draw: ImageDraw.ImageDraw, lines: list[str], start_y: int,
                            font: ImageFont.ImageFont, page_w: int,
                            line_gap: int = 10, fill=(0, 0, 0)) -> int:
    y = start_y
    for line in lines:
        draw_centered_text(draw, line, y, font, page_w, fill=fill)
        bbox = draw.textbbox((0, 0), line, font=font)
        y += (bbox[3] - bbox[1]) + line_gap
    return y


def paste_png(
    base_img: Image.Image,
    png_path: Optional[str | Path],
    box: Tuple[int, int, int, int],
    opacity: float = 1.0,
    contain: bool = True,
    align: str = "left",
):
    if not png_path:
        return
    p = Path(png_path)
    if not p.exists():
        raise FileNotFoundError(f"PNG not found: {png_path}")

    src = Image.open(p).convert("RGBA")
    x, y, w, h = box

    if contain:
        src.thumbnail((w, h), resample=Image.Resampling.LANCZOS)
        px = x + (w - src.size[0]) // 2 if align == "center" else x
        py = y + (h - src.size[1]) // 2
    else:
        src = src.resize((w, h), resample=Image.Resampling.LANCZOS)
        px, py = x, y

    if opacity < 1.0:
        a = src.getchannel("A")
        a = a.point(lambda v: int(v * opacity))
        src.putalpha(a)

    base_img.paste(src, (px, py), src)


# ------------------ core renderer ------------------

def render_template_c(
    out_path: str = "synthetic_diploma.png",
    dpi: int = 300,
    page_inches: tuple[float, float] = (15.5, 10.5),
    background=(245, 245, 243),
    text_color=(25, 25, 25),
    accent=(120, 80, 60),
    font_title_path: str | Path | None = None,
    font_body_path: str | Path | None = None,
    placeholders: dict | None = None,
    left_signature_png: str | Path | None = None,
    right_signature_png: str | Path | None = None,
    dean_signature_png: str | Path | None = None,
    seal_png: str | Path | None = None,
    signature_opacity: float = 1.0,
    seal_opacity: float = 1.0,
):
    if placeholders is None:
        placeholders = {
            "INSTITUTION": "SYNTHETIC UNIVERSITY NAME",
            "CONFIRMATION": "The Senate confirms that",
            "STUDENT_NAME": "[FULL NAME]",
            "ADMITTED": "is admitted to the degree",
            "DEGREE": "[DEGREE TITLE]",
            "PROGRAM": "[PROGRAM / OPTION]",
            "HONOURS": "[HONOURS / DISTINCTION]",
            "RIGHTS": "with all associated rights, privileges, and obligations.",
            "SIGN_LEFT_TITLE": "[TITLE]",
            "SIGN_RIGHT_TITLE": "[TITLE]",
            "SIGN_DEAN_TITLE": "Dean, Faculty of Engineering",
            "DATE_LINE": "[DATE OF ISSUE]",
        }

    W = int(page_inches[0] * dpi)
    H = int(page_inches[1] * dpi)

    img = Image.new("RGB", (W, H), background).convert("RGBA")
    draw = ImageDraw.Draw(img)

    margin_top = int(H * 0.07)
    base = min(W / 2400.0, H / 1700.0)

    title_font = load_font(font_title_path, int(130 * base))
    name_font = load_font(font_title_path, int(115 * base))
    degree_font = load_font(font_title_path, int(115 * base))
    body_font = load_font(font_body_path, int(52 * base))
    tiny_font = load_font(font_body_path, int(36 * base))

    y = margin_top
    draw_centered_text(draw, placeholders["INSTITUTION"], y, title_font, W, fill=text_color)
    y += int(175 * base)

    draw_centered_text(draw, placeholders["CONFIRMATION"], y, body_font, W, fill=text_color)
    y += int(100 * base)

    draw_centered_text(draw, placeholders["STUDENT_NAME"], y, name_font, W, fill=text_color)
    y += int(135 * base)

    draw_centered_text(draw, placeholders["ADMITTED"], y, body_font, W, fill=text_color)
    y += int(85 * base)

    draw_centered_text(draw, placeholders["DEGREE"], y, degree_font, W, fill=text_color)
    y += int(160 * base)

    lines = [placeholders["PROGRAM"]]
    if placeholders["HONOURS"]:
        lines.append(placeholders["HONOURS"])
    lines.append(placeholders["RIGHTS"])

    y = draw_multiline_centered(
        draw,
        lines,
        y,
        body_font,
        W,
        line_gap=int(22 * base),
        fill=text_color,
    )

    left_cx = int(W * 0.20)
    seal_cx = W // 2
    right_cx = int(W * 0.80)

    sig_col_w = int(W * 0.22)
    sig_box_h = int(160 * base)
    title_gap = int(20 * base)
    between_gap = int(45 * base)
    seal_size = int(900 * base)

    sig_row_y = int(H * 0.64)

    left_col_x = left_cx - sig_col_w // 2
    right_col_x = right_cx - sig_col_w // 2

    paste_png(
        img,
        left_signature_png,
        box=(left_col_x, sig_row_y, sig_col_w, sig_box_h),
        opacity=signature_opacity,
        align="left",
    )

    sig1_title_y = sig_row_y + sig_box_h + title_gap
    draw.text((left_col_x, sig1_title_y),
              placeholders["SIGN_LEFT_TITLE"], font=tiny_font, fill=text_color)

    title1_h = draw.textbbox((0, 0), placeholders["SIGN_LEFT_TITLE"], font=tiny_font)
    title1_h = title1_h[3] - title1_h[1]

    sig2_row_y = sig1_title_y + title1_h + between_gap

    paste_png(
        img,
        right_signature_png,
        box=(left_col_x, sig2_row_y, sig_col_w, sig_box_h),
        opacity=signature_opacity,
        align="left",
    )

    sig2_title_y = sig2_row_y + sig_box_h + title_gap
    draw.text((left_col_x, sig2_title_y),
              placeholders["SIGN_RIGHT_TITLE"], font=tiny_font, fill=text_color)

    sig2_title_h = draw.textbbox((0, 0), placeholders["SIGN_RIGHT_TITLE"], font=tiny_font)
    sig2_title_h = sig2_title_h[3] - sig2_title_h[1]
    sig_block_bottom = sig2_title_y + sig2_title_h
    sig_block_h = sig_block_bottom - sig_row_y

    seal_x = seal_cx - seal_size // 2
    seal_y = sig_row_y + (sig_block_h - seal_size) // 2

    if seal_png and Path(seal_png).exists():
        paste_png(
            img,
            seal_png,
            box=(seal_x, seal_y, seal_size, seal_size),
            opacity=seal_opacity,
            contain=True,
            align="center",
        )
    else:
        seal_r = seal_size // 2
        cx, cy = seal_cx, seal_y + seal_r
        draw.ellipse((cx - seal_r, cy - seal_r, cx + seal_r, cy + seal_r),
                     outline=accent, width=max(4, seal_r // 18))
        fb = ImageFont.load_default()
        lbl = "[SEAL]"
        bb = draw.textbbox((0, 0), lbl, font=fb)
        draw.text((cx - (bb[2] - bb[0]) // 2, cy - (bb[3] - bb[1]) // 2),
                  lbl, fill=text_color, font=fb)

    paste_png(
        img,
        dean_signature_png,
        box=(right_col_x, sig_row_y, sig_col_w, sig_box_h),
        opacity=signature_opacity,
        align="left",
    )

    dean_title_y = sig_row_y + sig_box_h + title_gap
    draw.text((right_col_x, dean_title_y),
              placeholders["SIGN_DEAN_TITLE"], font=tiny_font, fill=text_color)

    dean_title_h = draw.textbbox((0, 0), placeholders["SIGN_DEAN_TITLE"], font=tiny_font)
    dean_title_h = dean_title_h[3] - dean_title_h[1]

    date_y = dean_title_y + dean_title_h + int(60 * base)
    date_str = placeholders["DATE_LINE"]

    if "," in date_str:
        line1, line2 = date_str.split(",", 1)
        draw.text((right_col_x, date_y), line1.strip(), font=tiny_font, fill=text_color)
        l1_h = draw.textbbox((0, 0), line1.strip(), font=tiny_font)
        l1_h = l1_h[3] - l1_h[1]
        draw.text((right_col_x, date_y + l1_h + int(8 * base)),
                  line2.strip(), font=tiny_font, fill=text_color)
    else:
        draw.text((right_col_x, date_y), date_str, font=tiny_font, fill=text_color)

    img.convert("RGB").save(out_path, dpi=(dpi, dpi))
    return out_path


# ------------------ generator wrapper ------------------

def generate_template_c(output_path, student):
    placeholders = {
        "INSTITUTION": "University of MapleWood",
        "CONFIRMATION": "The Senate confirms that",
        "STUDENT_NAME": student["student_name"],
        "ADMITTED": "is admitted to the degree",
        "DEGREE": student["program"],
        "PROGRAM": student["faculty"],
        "HONOURS": student["honours"] if student["honours"] else "",
        "RIGHTS": "with all associated rights, privileges, and obligations.",
        "SIGN_LEFT_TITLE": "President and Vice-Chancellor",
        "SIGN_RIGHT_TITLE": "Registrar",
        "SIGN_DEAN_TITLE": "Dean, Faculty of Engineering",
        "DATE_LINE": student["date_line"].upper(),
    }

    return render_template_c(
        out_path=output_path,
        dpi=300,
        page_inches=(15.5, 10.5),
        font_title_path=BASE_DIR / "fonts" / "CloisterBlack.ttf",
        font_body_path=BASE_DIR / "fonts" / "Book Antiqua Italic.ttf",
        left_signature_png=BASE_DIR.parent / "assets" / "signatures" / "sig5.png",
        right_signature_png=BASE_DIR.parent / "assets" / "signatures" / "sig6.png",
        dean_signature_png=BASE_DIR.parent / "assets" / "signatures" / "sig2.png",
        seal_png=BASE_DIR.parent / "assets" / "seals" / "sealmw.png",
        signature_opacity=1.0,
        seal_opacity=1.0,
        placeholders=placeholders,
    )


if __name__ == "__main__":
    sample_student = {
        "certificate_id": "LU-2025-00001",
        "student_name": "Tiana Williams",
        "program": "Bachelor of Applied Science",
        "faculty": "Honours Computer Engineering / Management Sciences Option",
        "honours": "Co-operative Program",
        "date_line": "the Twenty-Third Day of May, 2025",
        "dean_name": "Dr. Priya N. Sharma",
        "principal_name": "Dr. Susan E. Blackwell",
        "senate_sec_name": "Dr. Oliver J. Marsh",
    }

    out = generate_template_c("test_template_c.png", sample_student)
    print("Saved:", out)