from io import BytesIO

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

F_DISPLAY = "Helvetica"
F_DISPLAY_BOLD = "Helvetica-Bold"
F_MONO = "Courier"
F_MONO_BOLD = "Courier-Bold"

# Dark Slate Theme matching AcademicFlow frontend design tokens
COLOR_BG = colors.HexColor("#0D0D10")
COLOR_CARD_BG = colors.HexColor("#14141A")
COLOR_BORDER = colors.HexColor("#22222E")
COLOR_TEXT = colors.HexColor("#E2E8F0")
COLOR_TEXT_MUTED = colors.HexColor("#64748B")
COLOR_TABLE_ROW_ALT = colors.HexColor("#181820")

COLOR_ACCENT_PURPLE = colors.HexColor("#A78BFA")
COLOR_ACCENT_BLUE = colors.HexColor("#4A7EFF")
COLOR_ACCENT_ORANGE = colors.HexColor("#F59E0B")
COLOR_ACCENT_RED = colors.HexColor("#EF4444")
COLOR_ACCENT_GREEN = colors.HexColor("#22C55E")

def _draw_background(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(COLOR_BG)
    canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], fill=True, stroke=False)
    canvas.restoreState()

def _tracked(text: str, spacing: str = "\u200a") -> str:
    return spacing.join(list(text))

def _build_styles():
    base = getSampleStyleSheet()

    base.add(ParagraphStyle(
        name="AF_AppName",
        fontName=F_MONO_BOLD,
        fontSize=9,
        textColor=COLOR_TEXT_MUTED,
        leading=11,
    ))

    base.add(ParagraphStyle(
        name="AF_Title",
        fontName=F_DISPLAY_BOLD,
        fontSize=20,
        textColor=COLOR_TEXT,
        leading=24,
        spaceAfter=2,
    ))

    base.add(ParagraphStyle(
        name="AF_Subtitle",
        fontName=F_MONO,
        fontSize=8.5,
        textColor=COLOR_TEXT_MUTED,
        leading=12,
    ))

    base.add(ParagraphStyle(
        name="AF_MetricLabel",
        fontName=F_MONO,
        fontSize=7,
        textColor=COLOR_TEXT_MUTED,
        leading=9,
    ))

    base.add(ParagraphStyle(
        name="AF_MetricValue",
        fontName=F_DISPLAY_BOLD,
        fontSize=17,
        textColor=COLOR_TEXT,
        leading=20,
        spaceBefore=2,
    ))

    base.add(ParagraphStyle(
        name="AF_MetricSub",
        fontName=F_MONO,
        fontSize=7,
        textColor=COLOR_TEXT_MUTED,
        leading=9,
    ))

    base.add(ParagraphStyle(
        name="AF_SectionHeader",
        fontName=F_DISPLAY_BOLD,
        fontSize=12,
        textColor=COLOR_TEXT,
        leading=15,
        spaceBefore=16,
        spaceAfter=4,
    ))

    base.add(ParagraphStyle(
        name="AF_TableHeader",
        fontName=F_MONO_BOLD,
        fontSize=7.5,
        textColor=COLOR_TEXT_MUTED,
        leading=10,
    ))

    base.add(ParagraphStyle(
        name="AF_TableCell",
        fontName=F_DISPLAY,
        fontSize=9,
        textColor=COLOR_TEXT,
        leading=12,
    ))

    return base

def _metric_card(label, value, sub, accent_color, styles, width):
    label_p = Paragraph(_tracked(label.upper()), styles["AF_MetricLabel"])
    value_p = Paragraph(f'<font color="{accent_color.hexval()}">{value}</font>', styles["AF_MetricValue"])
    sub_p = Paragraph(sub, styles["AF_MetricSub"])

    t = Table([[label_p], [value_p], [sub_p]], colWidths=[width])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_CARD_BG),
        ("BOX", (0, 0), (-1, -1), 0.75, COLOR_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (0, 0), 10),
        ("BOTTOMPADDING", (2, 0), (2, 0), 10),
        ("TOPPADDING", (1, 0), (1, 0), 2),
        ("BOTTOMPADDING", (1, 0), (1, 0), 0),
    ]))
    return t

def generate_plan_pdf(plan, schedule: list, subjects: list) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=32,
        rightMargin=32,
        topMargin=32,
        bottomMargin=32,
    )

    styles = _build_styles()
    story = []
    content_width = A4[0] - 64

    story.append(Paragraph(_tracked("ACADEMICFLOW"), styles["AF_AppName"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph(f"Plan Summary — {plan.name}", styles["AF_Title"]))
    story.append(Paragraph(
        f"Max Concurrent: {plan.max_concurrent} - Generated report",
        styles["AF_Subtitle"],
    ))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.75, color=COLOR_BORDER))
    story.append(Spacer(1, 16))

    total_subjects = len(subjects)
    total_ects = total_subjects * 3
    unlocked = sum(1 for s in subjects if getattr(s, "unlocked", False))
    locked = total_subjects - unlocked

    card_width = (content_width - 3 * 10) / 4

    cards = [
        _metric_card("Active Courses", str(total_subjects),
                     f"{unlocked} unlocked - {locked} locked",
                     COLOR_ACCENT_PURPLE, styles, card_width),
        _metric_card("Completion", "0%",
                     f"0 of {total_subjects} topics done",
                     COLOR_ACCENT_BLUE, styles, card_width),
        _metric_card("Credit Load", f"{total_ects} ECTS",
                     "Estimated Workload",
                     COLOR_ACCENT_ORANGE, styles, card_width),
        _metric_card("Max Concurrent", str(plan.max_concurrent),
                     "Per semester",
                     COLOR_ACCENT_RED, styles, card_width),
    ]

    cards_row = Table(
        [cards],
        colWidths=[card_width] * 4,
        spaceBefore=0,
        spaceAfter=0,
    )
    cards_row.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (-1, 0), (-1, 0), 0),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(cards_row)

    story.append(Paragraph("Subjects", styles["AF_SectionHeader"]))

    header_row = [
        Paragraph(_tracked("SUBJECT NAME"), styles["AF_TableHeader"]),
        Paragraph(_tracked("FIELD"), styles["AF_TableHeader"]),
        Paragraph(_tracked("DURATION"), styles["AF_TableHeader"]),
    ]
    table_data = [header_row]

    for sbj in subjects:
        table_data.append([
            Paragraph(sbj.name, styles["AF_TableCell"]),
            Paragraph(sbj.field or "General", styles["AF_TableCell"]),
            Paragraph(f"{sbj.duration}W", styles["AF_TableCell"]),
        ])

    subject_table = Table(
        table_data,
        colWidths=[content_width * 0.5, content_width * 0.3, content_width * 0.2],
    )

    table_style = [
        ("BACKGROUND", (0, 0), (-1, 0), COLOR_CARD_BG),
        ("LINEBELOW", (0, 0), (-1, 0), 1, COLOR_BORDER),
        ("LINEBELOW", (0, 1), (-1, -2), 0.5, COLOR_BORDER),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]
    for i in range(1, len(table_data)):
        if i % 2 == 0:
            table_style.append(("BACKGROUND", (0, i), (-1, i), COLOR_TABLE_ROW_ALT))

    subject_table.setStyle(TableStyle(table_style))
    story.append(subject_table)

    story.append(Spacer(1, 20))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
    story.append(Spacer(1, 6))
    story.append(Paragraph(_tracked("ACADEMICFLOW - AUTO-GENERATED REPORT"), styles["AF_MetricSub"]))

    doc.build(story, onFirstPage=_draw_background, onLaterPages=_draw_background)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes