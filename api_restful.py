from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict
from chat import khoi_tao_index, hoi_ai

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

# Kiểu dữ liệu nhận từ client
class Question(BaseModel):
    question: str
    major: str

fake_db: Dict[int, Dict[str, str]] = {}
current_id = 0

@app.post("/ask")
def post_question(q: Question):
    global current_id
    try:
        index = khoi_tao_index(q.major)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    answer = hoi_ai(index, q.question)
    fake_db[current_id] = {"question": q.question, "answer": answer, "major": q.major}
    response = {"id": current_id, "question": q.question, "answer": answer}
    current_id += 1
    return response

@app.get("/ask/{qid}")
def get_question(qid: int):
    if qid not in fake_db:
        raise HTTPException(status_code=404, detail="Không tìm thấy câu hỏi")
    return fake_db[qid]

@app.delete("/ask/{qid}")
def delete_question(qid: int):
    if qid not in fake_db:
        raise HTTPException(status_code=404, detail="Không tìm thấy để xoá")
    del fake_db[qid]
    return {"message": f"Đã xoá câu hỏi ID {qid}"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api_restful:app", host="0.0.0.0", port=8000, reload=True)
