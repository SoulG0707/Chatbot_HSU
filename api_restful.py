# Bổ sung import và khai báo lớp mới
from fastapi import FastAPI, HTTPException, status, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from pathlib import Path
from chat import khoi_tao_index, hoi_ai
import json
import os

app = FastAPI(
    title="RESTful API hỏi đáp AI HSU",
    description="API hỗ trợ chọn ngành học và trả lời theo đúng ngành",
    version="1.0.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ======================== MODELS ============================


class Question(BaseModel):
    question: str
    major: str
    username: str
    chat_id: int


class LoginRequest(BaseModel):
    username: str
    password: str

# ======================== UTILS ============================


def load_users():
    with open("users.json", encoding="utf-8") as f:
        return json.load(f)


def is_admin(username: str) -> bool:
    users = load_users()
    return users.get(username, {}).get("role") == "admin"


def save_history(username: str, question: str, answer: str, chat_id: int):
    os.makedirs(f"history/{username}", exist_ok=True)
    path = f"history/{username}/chat_{chat_id}.json"
    history = []
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            history = json.load(f)
    history.append({"question": question, "answer": answer})
    with open(path, "w", encoding="utf-8") as f:
        json.dump(history, f, ensure_ascii=False, indent=2)

# ======================== ROUTES ============================


@app.post("/login")
def login(req: LoginRequest):
    print("Received login:", req.username, req.password)
    users = load_users()
    user = users.get(req.username)
    if user and user["password"] == req.password:
        return {"username": req.username, "role": user["role"]}
    raise HTTPException(status_code=401, detail="Sai thông tin đăng nhập")


@app.post("/ask")
def post_question(q: Question):
    try:
        index = khoi_tao_index(q.major)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    answer = hoi_ai(index, q.question, q.major)
    save_history(q.username, q.question, answer, q.chat_id)
    return {"question": q.question, "answer": answer}


@app.get("/history/{username}/{chat_id}")
def get_chat_history(username: str, chat_id: int):
    path = f"history/{username}/chat_{chat_id}.json"
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Không tìm thấy đoạn chat")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@app.get("/history_list/{username}")
def get_chat_ids(username: str):
    folder = f"history/{username}"
    if not os.path.exists(folder):
        return []
    return sorted([f.split('.')[0] for f in os.listdir(folder) if f.startswith("chat_")])


@app.post("/admin/upload_major")
def upload_major(
    username: str = Form(...),
    major: str = Form(...),
    file: UploadFile = Form(...)
):
    if not is_admin(username):
        raise HTTPException(status_code=403, detail="Không có quyền")

    os.makedirs("data", exist_ok=True)
    ext = Path(file.filename).suffix.lower()
    save_path = f"data/CTDT_{major.replace(' ', '_')}{ext}"
    with open(save_path, "wb") as f_out:
        f_out.write(file.file.read())

    md_path = f"md/ctdt_{major.replace(' ', '_').lower()}.md"
    if ext == ".pdf":
        from load_pdf_text import export_pdf_to_md
        export_pdf_to_md(save_path, md_path)
    elif ext in [".docx"]:
        from load_pdf_text import export_docx_to_md
        export_docx_to_md(save_path, md_path)
    else:
        raise HTTPException(status_code=400, detail="Định dạng không hỗ trợ")

    folder = f"storage_{major.replace(' ', '_').lower()}"
    from llama_index.core import Document, VectorStoreIndex
    from llama_index.llms.ollama import Ollama
    from llama_index.embeddings.ollama import OllamaEmbedding
    from llama_index.core import Settings

    Settings.llm = Ollama(model="llama3")
    Settings.embed_model = OllamaEmbedding(model_name="llama3")

    with open(md_path, encoding="utf-8") as f:
        doc = Document(text=f.read())
    index = VectorStoreIndex.from_documents([doc])
    index.storage_context.persist(folder)

    return {"message": f"Đã tải và xử lý ngành '{major}' thành công."}


# ======================== RUN SERVER ============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_restful:app", host="0.0.0.0", port=8000, reload=True)
