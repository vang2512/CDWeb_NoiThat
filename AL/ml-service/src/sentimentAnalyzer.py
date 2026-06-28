import torch
from transformers import RobertaForSequenceClassification, AutoTokenizer

class SentimentAnalyzer:
    def __init__(self, path):
        self.path = path
        self.model = None
        self.tokenizer = None
        self.device = ("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(path, use_fast=False)
        self.labels = ["NEG", "POS", "NEU"]
    def load_model(self):
        try:
            self.model = RobertaForSequenceClassification.from_pretrained(self.path).to(self.device)
            self.tokenizer = AutoTokenizer.from_pretrained(self.path, use_fast=False)
            print('-'*50)
            print("Đã khởi tạo mô hình thành công")
            print('-'*50)
        except Exception as e:
            print(f"Lỗi khi khởi tạo mô hình: {e}")
    def predict(self, text):
        try:
            inputs = self.tokenizer(text, return_tensors="pt").to(self.device)
            with torch.no_grad():
                out = self.model(**inputs)
                result = out.logits.softmax(dim=-1).tolist()[0]
                label = self.labels[result.index(max(result))]
                return {"label": label, "score": max(result)}
        except Exception as e:
            print(f"Lỗi khi dự đoán: {e}")
            return None