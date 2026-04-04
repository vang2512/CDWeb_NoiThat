import clip
import torch
import faiss
import numpy as np
from PIL import Image
import requests
import io
import pickle

from food_database import FoodDatabase

class ImageVectorizer:
    def __init__(self):
        # Load model CLIP
        print("Loading CLIP model...")
        self.model, self.preprocess = clip.load("ViT-B/32")

        # Tạo FAISS index (512 chiều)
        self.index = faiss.IndexFlatL2(512)

        # Mapping: index → product_id
        self.id_map = {}

    # Convert 1 ảnh → vector
    def image_to_vector(self, image_url):
        try:
            # Load ảnh từ URL
            response = requests.get(image_url)
            image = Image.open(io.BytesIO(response.content)).convert("RGB")

            image_input = self.preprocess(image).unsqueeze(0)

            with torch.no_grad():
                features = self.model.encode_image(image_input)
                features = features / features.norm(dim=-1, keepdim=True)

            vector = features.numpy().astype("float32")

            return vector

        except Exception as e:
            print(f"Error processing image {image_url}: {e}")
            return None

    # Build toàn bộ vector DB
    def build_index(self):
        db = FoodDatabase()
        db.connect()

        foods = db.get_food_images()

        print(f"Start building index for {len(foods)} images...")

        i = 0

        for food in foods:
            vector = self.image_to_vector(food["image_url"])

            if vector is not None:
                self.index.add(vector)

                self.id_map[i] = food["id"]
                i += 1

                print(f"Processed food ID: {food['id']}")

        db.close()

        print("DONE BUILD INDEX!")

    # Save index
    def save_index(self):
        faiss.write_index(self.index, "faiss_index.bin")

        with open("mapping.pkl", "wb") as f:
            pickle.dump(self.id_map, f)

        print("Saved FAISS index + mapping")

    # Load lại index (khi chạy API)
    def load_index(self):
        self.index = faiss.read_index("faiss_index.bin")

        with open("mapping.pkl", "rb") as f:
            self.id_map = pickle.load(f)

        print("Loaded FAISS index + mapping")