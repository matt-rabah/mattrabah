"""Generate the resume download from the same data as /resume (requires ReportLab)."""
import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'src/data/resume.json').read_text())
output = ROOT / 'public/downloads/Matthew-Rabah-Resume.pdf'
output.parent.mkdir(parents=True, exist_ok=True)
styles = {
    'name': ParagraphStyle('name', fontName='Helvetica-Bold', fontSize=23, leading=27, spaceAfter=4),
    'headline': ParagraphStyle('headline', fontName='Helvetica', fontSize=10, leading=14, spaceAfter=4),
    'body': ParagraphStyle('body', fontName='Helvetica', fontSize=9.5, leading=13, spaceAfter=5),
    'contact': ParagraphStyle('contact', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#444444'), spaceAfter=10),
    'section': ParagraphStyle('section', fontName='Helvetica-Bold', fontSize=11, leading=15, spaceBefore=6, spaceAfter=4),
    'job': ParagraphStyle('job', fontName='Helvetica-Bold', fontSize=10, leading=14, spaceAfter=2),
    'date': ParagraphStyle('date', fontName='Helvetica', fontSize=9, leading=12, textColor=colors.HexColor('#555555'), spaceAfter=4),
    'bullet': ParagraphStyle('bullet', fontName='Helvetica', fontSize=9.5, leading=12.5, leftIndent=10, firstLineIndent=-7, spaceAfter=3),
}
def p(text, style='body'):
    return Paragraph(escape(text), styles[style])
story = [p(data['name'], 'name'), p(data['headline'], 'headline')]
story.append(Paragraph(f"{escape(data['location'])} | <link href='mailto:{data['email']}'>{data['email']}</link> | <link href='{data['website']}'>mattrabah.com</link> | <link href='{data['linkedin']}'>LinkedIn</link>", styles['contact']))
story.append(p(data['summary']))
story.append(p('EXPERIENCE', 'section'))
for job in data['experience']:
    group = [p(job['company'] + ' | ' + job['title'], 'job'), p(job['dates'], 'date')]
    group += [p('- ' + bullet, 'bullet') for bullet in job['bullets']]
    group.append(Spacer(1, 3))
    story.append(KeepTogether(group))
story += [p('SKILLS', 'section'), p(data['skills']), p('EDUCATION', 'section')]
for item in data['education']:
    story.append(p(item['degree'] + ' | ' + item['date'], 'job'))
    story.append(p(item['institution']))
story += [p('CERTIFICATIONS', 'section')]
for item in data['certifications']:
    story.append(p(item))
SimpleDocTemplate(str(output), pagesize=letter, rightMargin=42, leftMargin=42, topMargin=32, bottomMargin=28, title='Matthew Rabah - Resume', author='Matthew Rabah').build(story)
print(output)
