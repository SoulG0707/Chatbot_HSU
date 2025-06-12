# Hệ thống hỏi đáp AI theo ngành học (Đại học Hoa Sen)

## Mô tả dự án

Dự án xây dựng một hệ thống hỏi đáp AI sử dụng mô hình **LLaMA 3** để trả lời các câu hỏi liên quan đến **Chương trình đào tạo (CTĐT)** của các ngành:
- Trí tuệ nhân tạo
- Công nghệ thông tin
- Kỹ thuật phần mềm

Người dùng có thể chọn ngành học, đặt câu hỏi và nhận câu trả lời chỉ dựa trên nội dung trong tài liệu CTĐT tương ứng.

## Kiến trúc dự án

- **Frontend**: React (`App.js`, `App.css`)
- **Backend**: FastAPI (`api_restful.py`)
- **AI Engine**: llama-index + Ollama (`chat.py`)
- **Chuẩn hóa dữ liệu**: Chuyển đổi file PDF/DOCX sang Markdown (`load_pdf_text.py`)

## Cấu trúc thư mục

```
.
├── App.js                # Giao diện React
├── App.css               # Giao diện người dùng
├── api_restful.py        # REST API FastAPI
├── chat.py               # Gọi mô hình AI + xử lý truy vấn
├── load_pdf_text.py      # Chuyển đổi CTĐT sang Markdown
├── data/                 # Chứa file gốc CTĐT (PDF/DOCX)
├── md/                   # File CTĐT đã chuyển đổi (Markdown)
├── storage_ai/           # Vector index cho ngành AI
├── storage_cntt/         # Vector index cho ngành CNTT
├── storage_ktpm/         # Vector index cho ngành KTPM
```

## Hướng dẫn chạy dự án

### 1. Yêu cầu hệ thống
- Python 3.10+
- Node.js + npm
- Ollama đã cài mô hình `llama3` (`ollama run llama3`)

### 2. Cài đặt backend
```bash
pip install -r requirements.txt
# hoặc tự cài
pip install fastapi uvicorn python-docx pdfminer.six llama-index[llms] llama-index-llms-ollama llama-index-embeddings-ollama
```

Chạy tạo dữ liệu:
```bash
python load_pdf_text.py
```

Chạy API:
```bash
python api_restful.py
```

### 3. Chạy frontend
```bash
npm install
npm start
```

### 4. Giao diện
- Chọn ngành học → Nhập câu hỏi → Nhận câu trả lời từ tài liệu đúng ngành.
- Có hỗ trợ dark mode, nhiều đoạn chat, câu hỏi gợi ý theo ngành.

## Lưu ý
- Câu trả lời của AI **chỉ dựa trên nội dung CTĐT gốc**, không bịa hoặc suy diễn.
- Nếu không tìm thấy thông tin, hệ thống sẽ báo rõ.

## Giấy phép
MIT License.