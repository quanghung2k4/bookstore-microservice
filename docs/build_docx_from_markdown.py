from __future__ import annotations

import re
from datetime import datetime, timezone
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile
from xml.sax.saxutils import escape


ROOT = Path(__file__).resolve().parent
SOURCE_FILE = ROOT / 'TECHNICAL_REPORT_FINAL_VI.md'
OUTPUT_FILE = ROOT / 'TECHNICAL_REPORT_FINAL_VI.docx'


def parse_markdown(markdown_text: str) -> tuple[str, list[tuple[str, str]]]:
    lines = markdown_text.splitlines()
    title = 'Technical Report'
    blocks: list[tuple[str, str]] = []
    paragraph_buffer: list[str] = []
    headings: list[str] = []

    def flush_paragraph() -> None:
        if paragraph_buffer:
            paragraph = ' '.join(part.strip() for part in paragraph_buffer if part.strip())
            if paragraph:
                blocks.append(('body', paragraph))
            paragraph_buffer.clear()

    for raw_line in lines:
        line = raw_line.rstrip()
        if not line.strip():
            flush_paragraph()
            continue

        if line.startswith('# '):
            flush_paragraph()
            title = line[2:].strip()
            continue

        if line.startswith('## '):
            flush_paragraph()
            heading = line[3:].strip()
            headings.append(heading)
            blocks.append(('heading1', heading))
            continue

        if line.startswith('### '):
            flush_paragraph()
            blocks.append(('heading2', line[4:].strip()))
            continue

        if line.startswith('- '):
            flush_paragraph()
            blocks.append(('bullet', line[2:].strip()))
            continue

        paragraph_buffer.append(line)

    flush_paragraph()

    expanded_blocks: list[tuple[str, str]] = [
        ('title', title),
        ('subtitle', 'Báo cáo kỹ thuật 8-12 trang'),
        ('center', 'Dựa trên tài liệu và trạng thái triển khai thực tế của dự án'),
        ('center', 'Môn học: [Điền tên môn học]'),
        ('center', 'Giảng viên hướng dẫn: [Điền tên giảng viên]'),
        ('center', 'Nhóm thực hiện: [Điền danh sách thành viên]'),
        ('center', 'Mã số sinh viên: [Điền MSSV]'),
        ('center', 'Ngày hoàn thành: 11/03/2026'),
        ('page_break', ''),
        ('heading1', 'Mục lục'),
    ]
    expanded_blocks.extend(('toc', heading) for heading in headings)
    expanded_blocks.append(('page_break', ''))
    expanded_blocks.extend(blocks)
    return title, expanded_blocks


def paragraph_xml(
    text: str,
    *,
    style: str = 'Normal',
    align: str | None = None,
    bold: bool = False,
    italic: bool = False,
    size: int | None = None,
    spacing_before: int | None = None,
    spacing_after: int | None = None,
    line: int | None = None,
    indent_left: int | None = None,
) -> str:
    ppr_parts: list[str] = []
    if style:
        ppr_parts.append(f'<w:pStyle w:val="{style}"/>')
    if align:
        ppr_parts.append(f'<w:jc w:val="{align}"/>')
    if indent_left is not None:
        ppr_parts.append(f'<w:ind w:left="{indent_left}"/>')
    spacing_attrs: list[str] = []
    if spacing_before is not None:
        spacing_attrs.append(f'w:before="{spacing_before}"')
    if spacing_after is not None:
        spacing_attrs.append(f'w:after="{spacing_after}"')
    if line is not None:
        spacing_attrs.append(f'w:line="{line}"')
        spacing_attrs.append('w:lineRule="auto"')
    if spacing_attrs:
        spacing_value = ' '.join(spacing_attrs)
        ppr_parts.append(f'<w:spacing {spacing_value}/>')
    ppr_xml = f'<w:pPr>{"".join(ppr_parts)}</w:pPr>' if ppr_parts else ''

    rpr_parts: list[str] = []
    if bold:
        rpr_parts.append('<w:b/>')
    if italic:
        rpr_parts.append('<w:i/>')
    if size is not None:
        rpr_parts.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')
    rpr_xml = f'<w:rPr>{"".join(rpr_parts)}</w:rPr>' if rpr_parts else ''
    text_xml = f'<w:t xml:space="preserve">{escape(text)}</w:t>'
    return f'<w:p>{ppr_xml}<w:r>{rpr_xml}{text_xml}</w:r></w:p>'


def page_break_xml() -> str:
    return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def build_document_xml(blocks: list[tuple[str, str]]) -> tuple[str, int]:
    parts: list[str] = []
    word_texts: list[str] = []

    for kind, text in blocks:
        if kind == 'title':
            parts.append(paragraph_xml(text, style='Title', align='center', bold=True, size=36, spacing_after=220, line=360))
        elif kind == 'subtitle':
            parts.append(paragraph_xml(text, style='Subtitle', align='center', italic=True, size=26, spacing_after=180, line=360))
        elif kind == 'center':
            parts.append(paragraph_xml(text, align='center', size=24, spacing_after=100, line=360))
        elif kind == 'heading1':
            parts.append(paragraph_xml(text, style='Heading1', bold=True, size=30, spacing_before=120, spacing_after=120, line=320))
        elif kind == 'heading2':
            parts.append(paragraph_xml(text, style='Heading2', bold=True, size=26, spacing_before=80, spacing_after=80, line=320))
        elif kind == 'bullet':
            parts.append(paragraph_xml(f'- {text}', align='both', size=24, spacing_after=80, line=360, indent_left=360))
        elif kind == 'toc':
            parts.append(paragraph_xml(text, size=24, spacing_after=80, line=320))
        elif kind == 'body':
            parts.append(paragraph_xml(text, align='both', size=24, spacing_after=110, line=360))
        elif kind == 'page_break':
            parts.append(page_break_xml())
            continue
        else:
            continue

        word_texts.append(text)

    section_properties = (
        '<w:sectPr>'
        '<w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
        'w:header="720" w:footer="720" w:gutter="0"/>'
        '</w:sectPr>'
    )
    document_xml = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">'
        f'<w:body>{"".join(parts)}{section_properties}</w:body>'
        '</w:document>'
    )
    word_count = len(re.findall(r'\w+', ' '.join(word_texts), flags=re.UNICODE))
    return document_xml, word_count


def build_styles_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/>
        <w:lang w:val="vi-VN"/>
        <w:sz w:val="24"/>
        <w:szCs w:val="24"/>
      </w:rPr>
    </w:rPrDefault>
    <w:pPrDefault>
      <w:pPr>
        <w:spacing w:after="110" w:line="360" w:lineRule="auto"/>
      </w:pPr>
    </w:pPrDefault>
  </w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:qFormat/>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="240" w:line="360" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle">
    <w:name w:val="Subtitle"/>
    <w:basedOn w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:jc w:val="center"/><w:spacing w:after="180" w:line="360" w:lineRule="auto"/></w:pPr>
    <w:rPr><w:i/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="120" w:after="120"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="30"/><w:szCs w:val="30"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading2">
    <w:name w:val="heading 2"/>
    <w:basedOn w:val="Normal"/>
    <w:next w:val="Normal"/>
    <w:qFormat/>
    <w:pPr><w:spacing w:before="80" w:after="80"/></w:pPr>
    <w:rPr><w:b/><w:sz w:val="26"/><w:szCs w:val="26"/></w:rPr>
  </w:style>
</w:styles>
'''


def build_content_types_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
'''


def build_root_rels_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
'''


def build_document_rels_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
'''


def build_core_xml(title: str) -> str:
    created = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>{escape(title)}</dc:title>
  <dc:subject>Technical Report</dc:subject>
  <dc:creator>GitHub Copilot</dc:creator>
  <cp:keywords>bookstore,microservice,django,react,technical report</cp:keywords>
  <dc:description>Báo cáo kỹ thuật tiếng Việt cho dự án Bookstore Microservice</dc:description>
  <cp:lastModifiedBy>GitHub Copilot</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{created}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{created}</dcterms:modified>
</cp:coreProperties>
'''


def build_app_xml() -> str:
    return '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Microsoft Office Word</Application>
</Properties>
'''


def build_docx() -> tuple[Path, int, int]:
    title, blocks = parse_markdown(SOURCE_FILE.read_text(encoding='utf-8'))
    document_xml, word_count = build_document_xml(blocks)

    with ZipFile(OUTPUT_FILE, 'w', ZIP_DEFLATED) as docx_file:
        docx_file.writestr('[Content_Types].xml', build_content_types_xml())
        docx_file.writestr('_rels/.rels', build_root_rels_xml())
        docx_file.writestr('docProps/core.xml', build_core_xml(title))
        docx_file.writestr('docProps/app.xml', build_app_xml())
        docx_file.writestr('word/document.xml', document_xml)
        docx_file.writestr('word/styles.xml', build_styles_xml())
        docx_file.writestr('word/_rels/document.xml.rels', build_document_rels_xml())

    return OUTPUT_FILE, word_count, OUTPUT_FILE.stat().st_size


if __name__ == '__main__':
    output_file, word_count, file_size = build_docx()
    print(f'Generated: {output_file}')
    print(f'Estimated words: {word_count}')
    print(f'File size: {file_size} bytes')