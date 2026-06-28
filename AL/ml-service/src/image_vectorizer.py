import clip
import torch
import faiss
import numpy as np
from PIL import Image
import requests
import io
import pickle

from src.food_database import FoodDatabase


class ImageVectorizer:

    def __init__(self):
        print("Loading CLIP model...")

        self.model, self.preprocess = clip.load("ViT-B/32")

        # Cosine Similarity
        self.index = faiss.IndexFlatIP(512)

        self.id_map = {}

    def image_to_vector(self, image_url):
        try:

            response = requests.get(image_url)

            image = Image.open(io.BytesIO(response.content)).convert("RGB")

            image_input = self.preprocess(image).unsqueeze(0)

            with torch.no_grad():

                features = self.model.encode_image(image_input)

                # normalize vector
                features = features / features.norm(dim=-1, keepdim=True)

            return features.numpy().astype("float32")

        except Exception as e:

            print(f"Error processing image {image_url}: {e}")

            return None

    def build_index(self):

        db = FoodDatabase()

        db.connect()

        foods = db.get_food_images()

        print(f"Start building index for " f"{len(foods)} images...")

        idx = 0

        for food in foods:

            vector = self.image_to_vector(food["image_url"])

            if vector is not None:

                self.index.add(vector)

                self.id_map[idx] = food["id"]

                print(f"Processed food ID: " f"{food['id']}")

                idx += 1

        db.close()

        print("DONE BUILD INDEX!")

    def save_index(self):

        faiss.write_index(self.index, "faiss_index.bin")

        with open("mapping.pkl", "wb") as f:

            pickle.dump(self.id_map, f)

        print("Saved FAISS index + mapping")

    def load_index(self):

        self.index = faiss.read_index("faiss_index.bin")

        with open("mapping.pkl", "rb") as f:

            self.id_map = pickle.load(f)

        print("Loaded FAISS index + mapping")
