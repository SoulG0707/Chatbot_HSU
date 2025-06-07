import os
from llama_index.core import (
    VectorStoreIndex,
    Document,
    StorageContext,
    load_index_from_storage,
    Settings
)
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding

FOLDER_MAP = {
    "Trí tuệ nhân tạo": ("storage_ai", "md/ctdt_ai.md"),
    "Công nghệ thông tin": ("storage_cntt", "md/ctdt_cntt.md"),
    "Kỹ thuật phần mềm": ("storage_ktpm", "md/ctdt_ktpm.md"),
}

def khoi_tao_index(nganh: str):
    Settings.llm = Ollama(model="llama3", request_timeout=60, temperature=0)
    Settings.embed_model = OllamaEmbedding(model_name="llama3")

    folder, file_path = FOLDER_MAP.get(nganh, (None, None))
    if not folder or not file_path:
        raise ValueError(f"Không hỗ trợ ngành: {nganh}")

    if os.path.exists(folder):
        sc = StorageContext.from_defaults(persist_dir=folder)
        return load_index_from_storage(sc)

    with open(file_path, encoding="utf-8") as f:
        full_text = f.read()

    doc = Document(text=full_text)
    index = VectorStoreIndex.from_documents([doc])
    index.storage_context.persist(folder)
    return index

def loc_theo_tu_khoa(cau_hoi: str, raw_texts: list[str]) -> str:
    tu_khoa = [
        "tín chỉ", "học phần", "tốt nghiệp", "thời gian", "năm", "điều kiện",
        "ngành", "mục tiêu", "chuẩn đầu ra", "nghề nghiệp", "bằng cấp", "thực tập"
    ]
    cau_hoi_lower = cau_hoi.lower()
    if any(k in cau_hoi_lower for k in tu_khoa):
        ket_qua = [t for t in raw_texts if any(k in t.lower() for k in tu_khoa)]
        if ket_qua:
            return "\n".join(ket_qua)
    return "\n".join(raw_texts)

def hoi_ai(index, cau_hoi: str, nganh: str = "") -> str:
    try:
        retriever = index.as_retriever(similarity_top_k=10)
        nodes = retriever.retrieve(cau_hoi)
        raw_texts = [node.text.strip() for node in nodes if node.text.strip()]
        noi_dung = loc_theo_tu_khoa(cau_hoi, raw_texts)

        prompt = f"""
Chỉ sử dụng thông tin trong phần TÀI LIỆU dưới đây để trả lời.

**YÊU CẦU NGHIÊM NGẶT**:
- **CHỈ TRẢ LỜI BẰNG TIẾNG VIỆT**
- **Dịch toàn bộ các thuật ngữ hoặc cụm từ tiếng Anh sang tiếng Việt nếu có**
- **Không được sử dụng bất kỳ từ tiếng Anh nào trong câu trả lời**
- **Trình bày ngắn gọn, rõ ràng, đúng nội dung tài liệu**
- **Không được tự bịa thêm nội dung**

Nếu không có thông tin trong tài liệu, hãy trả lời chính xác:
"Tôi không biết."

Cuối câu trả lời phải có dòng sau:
"Trích từ Chương trình đào tạo ngành {nganh}."

-------- TÀI LIỆU --------
{noi_dung}
---------------------------

Câu hỏi: {cau_hoi}
Trả lời:"""


        llm = Ollama(model="llama3", request_timeout=60, temperature=0)
        return llm.complete(prompt).text.strip()
    except Exception as e:
        return f"[LỖI]: {e}"

def main():
    print("=== Chat với AI HSU (gõ 'exit' để thoát) ===")
    try:
        nganh = input("Bạn học ngành gì (Trí tuệ nhân tạo / Công nghệ thông tin / Kỹ thuật phần mềm)? ").strip()
        index = khoi_tao_index(nganh)
    except Exception as e:
        print(f"[LỖI KHỞI TẠO]: {e}")
        return

    while True:
        try:
            user_input = input("\nBạn: ").strip()
            if user_input.lower() == "exit":
                print("Tạm biệt!")
                break
            if not user_input:
                continue

            tra_loi = hoi_ai(index, user_input, nganh)
            if tra_loi:
                print(f"AI: {tra_loi}")
        except KeyboardInterrupt:
            print("\nTạm biệt!")
            break
        except Exception as err:
            print(f"[LỖI]: {err}")

if __name__ == "__main__":
    main()
