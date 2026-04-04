from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
import io
import torch
import numpy as np

from image_vectorizer import ImageVectorizer
app = FastAPI()

# 👉 Load sẵn model + index (chỉ load 1 lần khi start server)
vectorizer = ImageVectorizer()
vectorizer.load_index()



# =========================
@app.post("/search-image")
async def search_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGB")

        image_input = vectorizer.preprocess(image).unsqueeze(0)

        with torch.no_grad():
            features = vectorizer.model.encode_image(image_input)
            features = features / features.norm(dim=-1, keepdim=True)

        query_vector = features.numpy().astype("float32")

        # 🔥 TOP 3
        k = 3
        distances, indices = vectorizer.index.search(query_vector, k)

        results = []

        # 👉 giữ thứ tự FAISS trả về
        for i in range(len(indices[0])):
            idx = indices[0][i]

            if idx in vectorizer.id_map:
                results.append({
                    "productId": vectorizer.id_map[idx],
                    "score": float(distances[0][i])  
                })

        return {
            "success": True,
            "products": results
        }

    except Exception as e:
        return {"error": str(e)}