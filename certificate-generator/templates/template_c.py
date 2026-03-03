from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph
from reportlab.lib.enums import TA_JUSTIFY

LOGO_PATH = "cert_gen/assets/logo.png"
SEAL_PATH = "cert_gen/assets/seal.png"

def generate_template_c(output_path, data):
    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    width, height = landscape(A4)

    # Logo top center
    # c.drawImage(LOGO_PATH, width/2 - inch, height - 1.4*inch, 2*inch, 1.5*inch, mask='auto')

    # Title
    c.setFont("Times-Bold", 24)
    c.drawCentredString(width/2, height - 2.2*inch, "Academic Certification")

    styles = getSampleStyleSheet()
    style = styles["Normal"]
    style.alignment = TA_JUSTIFY
    style.fontName = "Times-Roman"
    style.fontSize = 14

    text = f"""
    This document certifies that <b>{data['student_name']}</b> has successfully completed
    all academic requirements prescribed by <b>{data['university']}</b> and has been
    conferred the degree of <b>{data['degree']}</b> in <b>{data['major']}</b>.
    <br/><br/>
    Awarded on {data['date']}.
    """

    p = Paragraph(text, style)
    p.wrapOn(c, width - 4*inch, height)
    p.drawOn(c, 2*inch, height - 5*inch)

    # Seal bottom-left
    # c.drawImage(SEAL_PATH, 1*inch, 1*inch, 1.5*inch, 1.5*inch, mask='auto')

    # Footer
    c.setFont("Times-Italic", 10)
    c.drawRightString(width - 1*inch, 0.8*inch, f"Certificate ID: {data['certificate_id']}")

    c.showPage()
    c.save()
