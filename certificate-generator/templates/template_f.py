from PIL import Image, ImageDraw, ImageFont
import math
from pathlib import Path
from typing import Optional, Tuple

# ------------------ helpers ------------------

def load_font(font_path: str | None, size: int) -> ImageFont.ImageFont:
    if font_path and Path(font_path).exists():
        return ImageFont.truetype(font_path, size=size)
    return ImageFont.load_default()

def draw_centered_text(draw: ImageDraw.ImageDraw, text: str, y: int,
                       font: ImageFont.ImageFont, page_w: int, fill=(0, 0, 0)):
    bbox   = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    draw.text(((page_w - text_w) // 2, y), text, font=font, fill=fill)
    return bbox[3] - bbox[1]   # return line height

def draw_multiline_centered(draw: ImageDraw.ImageDraw, lines: list[str], start_y: int,
                            font: ImageFont.ImageFont, page_w: int,
                            line_gap: int = 10, fill=(0, 0, 0)) -> int:
    y = start_y
    for line in lines:
        h = draw_centered_text(draw, line, y, font, page_w, fill=fill)
        y += h + line_gap
    return y

def paste_png(
    base_img: Image.Image,
    png_path: Optional[str],
    box: Tuple[int, int, int, int],   # (x, y, w, h)
    opacity: float = 1.0,
    contain: bool  = True,
    align: str     = "left",          # "left" | "center"
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

def draw_line(draw: ImageDraw.ImageDraw, y: int, page_w: int,
              margin_pct: float = 0.08, fill=(180, 180, 180), width: int = 2):
    mx = int(page_w * margin_pct)
    draw.line([(mx, y), (page_w - mx, y)], fill=fill, width=width)


def draw_arced_text(img: Image.Image, text: str, font: ImageFont.ImageFont,
                    center_x: int, center_y: int, radius: int,
                    fill=(0, 0, 0), letter_spacing: float = 1.05):
    """
    Draw text curved along the top of an arc (left-to-right, reading normally).
    center_x, center_y: centre of the imaginary circle (below the text)
    radius: distance from centre to baseline of text
    """
    draw_tmp = ImageDraw.Draw(img)

    # Measure each character width
    chars = list(text)
    widths = []
    for ch in chars:
        bb = draw_tmp.textbbox((0, 0), ch, font=font)
        widths.append((bb[2] - bb[0]) * letter_spacing)

    total_w = sum(widths)

    # Total arc angle spanned by the text
    total_angle = total_w / radius  # radians

    # We place characters along the TOP of the circle.
    # Angle 90° (pi/2) = 12 o'clock.
    # Left-to-right means we go from (90 + half) down to (90 - half),
    # i.e. angles decrease as we move left→right.
    start_angle = math.pi / 2 + total_angle / 2

    current_angle = start_angle
    for ch, w in zip(chars, widths):
        char_angle = current_angle - (w / 2) / radius

        # θ measured from top of circle (12-o-clock), positive = rightward
        theta = math.pi / 2 - char_angle
        x = center_x + radius * math.sin(theta)
        y = center_y - radius * math.cos(theta)

        rot_deg = -math.degrees(theta)

        bb = draw_tmp.textbbox((0, 0), ch, font=font)
        pad = 12
        tile_w = bb[2] - bb[0] + pad * 2
        tile_h = bb[3] - bb[1] + pad * 2

        # Render at 2× for anti-aliasing then downscale
        scale = 2
        tile = Image.new("RGBA", (tile_w * scale, tile_h * scale), (0, 0, 0, 0))
        td   = ImageDraw.Draw(tile)
        rgba_fill = fill if len(fill) == 4 else fill + (255,)
        td.text(((pad - bb[0]) * scale, (pad - bb[1]) * scale),
                ch, font=font, fill=rgba_fill)
        tile = tile.resize((tile_w, tile_h), resample=Image.Resampling.LANCZOS)
        tile = tile.rotate(rot_deg, expand=True, resample=Image.Resampling.BICUBIC)

        px = int(x - tile.size[0] / 2)
        py = int(y - tile.size[1] / 2)
        img.paste(tile, (px, py), tile)

        current_angle -= w / radius

BASE_DIR = Path(__file__).resolve().parent

# ------------------ main generator ------------------

def generate_silverlake_diploma(
    out_path: str = "silverlake_diploma.png",
    dpi: int = 300,
    page_inches: tuple[float, float] = (12.0, 15.0),   # portrait, 12x15
    background=(250, 249, 247),
    text_color=(20, 20, 20),
    accent=(120, 40, 60),
    font_title_path: str | None = None,    # blackletter  e.g. CloisterBlack.ttf
    font_body_path: str | None = None,     # italic serif e.g. Book Antiqua Italic.ttf
    placeholders: dict | None = None,
    # Assets
    crest_png: str | None = None,          # coat-of-arms / crest above city line
    seal_png: str | None = None,           # wax-style seal bottom-left
    # Signatures – left column, then right column (stacked)
    sig_chancellor_png: str | None = None,        # bottom-left  (Chancellor)
    sig_president_png: str | None = None,         # bottom-right top (President & V-C)
    sig_registrar_png: str | None = None,         # bottom-right bottom (Registrar)
    signature_opacity: float = 1.0,
    seal_opacity: float = 1.0,
    crest_opacity: float = 1.0,
):
    """
    Portrait diploma matching McMaster University style:

    ┌───────────────────────────────────────────────┐
    │      University of Silverlake   (blackletter) │  ← large arched title
    │          [CREST image]                        │
    │       City name      Country                  │
    │                                               │
    │   By the Authority of the Senate              │
    │   the Chancellor has conferred upon           │
    │                                               │
    │        Student Name   (large italic)          │
    │           the Degree of                       │
    │                                               │
    │              Honours   (blackletter small)    │
    │       Bachelor of Commerce   (blackletter lg) │
    │                                               │
    │   with all the Rights and Privileges…         │
    │   in Witness whereof…                         │
    │   We have hereunto set our hand and seal.     │
    │                                               │
    │   Dated this [DATE]                           │
    │        Summa Cum Laude  (or distinction)      │
    │                                               │
    │  _______________    _______________           │
    │  Chancellor         President & V-C           │
    │                                               │
    │  [SEAL]             _______________           │
    │                     University Registrar      │
    └───────────────────────────────────────────────┘
    """
    if placeholders is None:
        placeholders = {
            "INSTITUTION":   "University of Silverlake",
            "CITY":          "Silverlake",
            "COUNTRY":       "Canada",
            "AUTHORITY":     "By the Authority of the Senate",
            "CONFERRED":     "the Chancellor has conferred upon",
            "STUDENT_NAME":  "[FULL NAME]",
            "DEGREE_OF":     "the Degree of",
            "HONOURS_LABEL": "Honours",
            "DEGREE":        "[DEGREE TITLE]",
            "RIGHTS_1":      "with all the Rights and Privileges pertaining thereto",
            "RIGHTS_2":      "in Witness whereof and by the Authority vested in Us,",
            "RIGHTS_3":      "We have hereunto set our hand and seal.",
            "DATE_LINE":     "Dated this [DAY] day of [MONTH], [YEAR] at Silverlake, Ontario.",
            "DISTINCTION":   "Summa Cum Laude",
            "SIG_CHANCELLOR":  "Chancellor",
            "SIG_PRESIDENT":   "President and Vice-Chancellor",
            "SIG_REGISTRAR":   "University Registrar",
        }

    W = int(page_inches[0] * dpi)
    H = int(page_inches[1] * dpi)

    img  = Image.new("RGB", (W, H), background).convert("RGBA")
    draw = ImageDraw.Draw(img)

    base = min(W / 1200.0, H / 1500.0)   # reference: 1200×1500 px at 100 dpi

    # ── fonts ────────────────────────────────────────────────────────────
    title_font      = load_font(font_title_path, int(90  * base))
    honours_lbl_font= load_font(font_title_path, int(38  * base))
    degree_font     = load_font(font_title_path, int(70  * base))
    name_font       = load_font(font_body_path,  int(68  * base))
    body_font       = load_font(font_body_path,  int(30  * base))
    small_font      = load_font(font_title_path,  int(32  * base))
    tiny_font       = load_font(font_body_path,  int(28  * base))

    margin_top = int(H * 0.02)
    y = margin_top

    # ── Institution title (straight) ─────────────────────────────────────
    draw_centered_text(draw, placeholders["INSTITUTION"], y, title_font, W, fill=text_color)
    y += int(60 * base)

    # ── Crest + flanking city/country (all drawn at same y) ─────────────
    crest_size  = int(360 * base)
    crest_top_y = y   # save crest top before advancing y

    paste_png(img, crest_png,
              box=(W // 2 - crest_size // 2, crest_top_y, crest_size, crest_size),
              opacity=crest_opacity, contain=True, align="center")

    # City / Country flanking — vertically centred on the crest
    city    = placeholders["CITY"]
    country = placeholders["COUNTRY"]
    city_bb    = draw.textbbox((0, 0), city,    font=honours_lbl_font)
    country_bb = draw.textbbox((0, 0), country, font=honours_lbl_font)
    city_w  = city_bb[2]  - city_bb[0]
    city_h  = city_bb[3]  - city_bb[1]

    crest_left  = W // 2 - crest_size // 2
    crest_right = W // 2 + crest_size // 2
    padding     = int(-20 * base)

    # Vertically centre text on crest
    text_y = crest_top_y + crest_size // 2 - city_h // 2

    city_x    = crest_left  - padding - city_w
    country_x = crest_right + padding

    draw.text((city_x,    text_y), city,    font=honours_lbl_font, fill=text_color)
    draw.text((country_x, text_y), country, font=honours_lbl_font, fill=text_color)

    # Advance y past the crest with a small gap
    y = crest_top_y + crest_size - int(20 * base)

    # ── Authority lines ───────────────────────────────────────────────────
    draw_centered_text(draw, placeholders["AUTHORITY"], y, body_font, W, fill=text_color)
    y += int(44 * base)
    draw_centered_text(draw, placeholders["CONFERRED"], y, body_font, W, fill=text_color)
    y += int(50 * base)

    # ── Student name ──────────────────────────────────────────────────────
    draw_centered_text(draw, placeholders["STUDENT_NAME"], y, name_font, W, fill=text_color)
    y += int(90 * base)

    draw_centered_text(draw, placeholders["DEGREE_OF"], y, body_font, W, fill=text_color)
    y += int(85 * base)

    # ── Honours label + Degree ────────────────────────────────────────────
    draw_centered_text(draw, placeholders["HONOURS_LABEL"], y, honours_lbl_font, W, fill=text_color)
    y += int(30 * base)
    draw_centered_text(draw, placeholders["DEGREE"], y, degree_font, W, fill=text_color)
    y += int(115 * base)

    # ── Rights paragraph ─────────────────────────────────────────────────
    for line in [placeholders["RIGHTS_1"], placeholders["RIGHTS_2"], placeholders["RIGHTS_3"]]:
        draw_centered_text(draw, line, y, body_font, W, fill=text_color)
        y += int(38 * base)
    y += int(15 * base)

    # ── Date + Distinction ────────────────────────────────────────────────
    draw_centered_text(draw, placeholders["DATE_LINE"],   y, body_font, W, fill=text_color)
    y += int(40 * base)
    draw_centered_text(draw, placeholders["DISTINCTION"], y, small_font, W, fill=text_color)
    y += int(100 * base)

    # ── Bottom signature section ──────────────────────────────────────────
    #
    # Layout (portrait):
    #   LEFT  column  x ≈ 10 % W  →  Chancellor sig + label
    #   RIGHT column  x ≈ 55 % W  →  President sig (top) + Registrar sig (below)
    #   Seal sits bottom-left, below the Chancellor sig+label
    #
    sig_w       = int(W * 0.32)
    sig_h       = int(100 * base)
    title_gap   = int(15  * base)
    between_gap = int(30  * base)
    sig_label_h = int(36  * base)

    left_col_x  = int(W * 0.08)
    right_col_x = int(W * 0.55)

    sig_top_y   = y   # top of signature row

    # Thin rule above signatures
   

    # --- Chancellor (left) ---
    paste_png(img, sig_chancellor_png,
              box=(left_col_x, sig_top_y, sig_w, sig_h),
              opacity=signature_opacity, align="left")

    # Rule under Chancellor sig
    rule_y = sig_top_y + sig_h + int(8 * base)
    draw.line([(left_col_x, rule_y), (left_col_x + sig_w, rule_y)],
              fill=text_color, width=max(1, int(1 * base)))

    draw.text((left_col_x, rule_y + int(8 * base)),
              placeholders["SIG_CHANCELLOR"], font=tiny_font, fill=text_color)

    chancellor_bottom = rule_y + sig_label_h + int(30 * base)

    # --- President / V-C (right, top) ---
    paste_png(img, sig_president_png,
              box=(right_col_x, sig_top_y, sig_w, sig_h),
              opacity=signature_opacity, align="left")

    rule_y2 = sig_top_y + sig_h + int(8 * base)
    draw.line([(right_col_x, rule_y2), (right_col_x + sig_w, rule_y2)],
              fill=text_color, width=max(1, int(1 * base)))
    draw.text((right_col_x, rule_y2 + int(8 * base)),
              placeholders["SIG_PRESIDENT"], font=tiny_font, fill=text_color)

    # --- Registrar (right, stacked below President) ---
    reg_top_y = rule_y2 + sig_label_h + between_gap

    paste_png(img, sig_registrar_png,
              box=(right_col_x, reg_top_y, sig_w, sig_h),
              opacity=signature_opacity, align="left")

    rule_y3 = reg_top_y + sig_h + int(8 * base)
    draw.line([(right_col_x, rule_y3), (right_col_x + sig_w, rule_y3)],
              fill=text_color, width=max(1, int(1 * base)))
    draw.text((right_col_x, rule_y3 + int(8 * base)),
              placeholders["SIG_REGISTRAR"], font=tiny_font, fill=text_color)

    # --- Seal (bottom-left, below Chancellor label) ---
    seal_size = int(180 * base)
    seal_x    = left_col_x
    seal_y    = chancellor_bottom + int(20 * base)

    if seal_png and Path(seal_png).exists():
        paste_png(img, seal_png,
                  box=(seal_x, seal_y, seal_size, seal_size),
                  opacity=seal_opacity, contain=True, align="center")
    else:
        # Drawn fallback circle
        seal_r = seal_size // 2
        cx, cy = seal_x + seal_r, seal_y + seal_r
        draw.ellipse((cx - seal_r, cy - seal_r, cx + seal_r, cy + seal_r),
                     outline=accent, width=max(3, seal_r // 15))
        fb  = ImageFont.load_default()
        lbl = "[SEAL]"
        bb  = draw.textbbox((0, 0), lbl, font=fb)
        draw.text((cx - (bb[2]-bb[0])//2, cy - (bb[3]-bb[1])//2),
                  lbl, fill=text_color, font=fb)

    # ── save ─────────────────────────────────────────────────────────────
    img.convert("RGB").save(out_path, dpi=(dpi, dpi))
    return out_path


# ------------------ run ------------------

if __name__ == "__main__":
    out = generate_silverlake_diploma(
        out_path="silverlake_diploma_12x15.png",
        dpi=300,
        page_inches=(12.0, 15.0),
        font_title_path="CloisterBlack.ttf",
        font_body_path="Book Antiqua Italic.ttf",

        crest_png=str(BASE_DIR.parent / "assets" /"seals" / "crest.png"),
        seal_png=str(BASE_DIR.parent / "assets" / "seals" / "waxSeal.png"),

        sig_chancellor_png=str(BASE_DIR.parent / "assets" / "signatures" / "sig1.png"),
        sig_president_png=str(BASE_DIR.parent / "assets" / "signatures" / "sig2.png"),
        sig_registrar_png=str(BASE_DIR.parent / "assets" / "signatures" / "sig3.png"),
        signature_opacity=1.0,
        seal_opacity=1.0,
        crest_opacity=1.0,

        placeholders={
            "INSTITUTION":   "University of Silverlake",
            "CITY":          "Silverlake",
            "COUNTRY":       "Canada",
            "AUTHORITY":     "By the Authority of the Senate",
            "CONFERRED":     "the Chancellor has conferred upon",
            "STUDENT_NAME":  "Alexander Gatsby Laister",
            "DEGREE_OF":     "the Degree of",
            "HONOURS_LABEL": "Honours",
            "DEGREE":        "Bachelor of Commerce",
            "RIGHTS_1":      "with all the Rights and Privileges pertaining thereto",
            "RIGHTS_2":      "in Witness whereof and by the Authority vested in Us,",
            "RIGHTS_3":      "We have hereunto set our hand and seal.",
            "DATE_LINE":     "Dated this 3rd day of June, 2020 at Silverlake, Ontario.",
            "DISTINCTION":   "Summa Cum Laude",
            "SIG_CHANCELLOR":  "Chancellor",
            "SIG_PRESIDENT":   "President and Vice-Chancellor",
            "SIG_REGISTRAR":   "University Registrar",
        },
    )
    print("Saved:", out)