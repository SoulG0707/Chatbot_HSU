from pdfminer.high_level import extract_text
from docx import Document
import os

os.makedirs("data", exist_ok=True)
os.makedirs("md", exist_ok=True)

def export_pdf_to_md(pdf_path, out_md):
    print(f"Đang xử lý {pdf_path}...")
    text = extract_text(pdf_path)
    text = "# " + os.path.basename(pdf_path) + "\n\n" + text  # thêm tiêu đề Markdown
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(text)

def export_docx_to_md(docx_path, out_md):
    print(f"Đang xử lý {docx_path}...")
    doc = Document(docx_path)
    text = "# " + os.path.basename(docx_path) + "\n\n"
    text += "\n\n".join(p.text for p in doc.paragraphs)
    with open(out_md, "w", encoding="utf-8") as f:
        f.write(text)

# Xuất các file sang md
export_pdf_to_md("data/CTDT_AI.pdf", "md/ctdt_ai.md")
export_pdf_to_md("data/CTDT_KTPM.pdf", "md/ctdt_ktpm.md")
export_docx_to_md("data/CTDT_CNTT.docx", "md/ctdt_cntt.md")

print("Đã xuất tất cả dữ liệu CTDT sang Markdown thành công.")
