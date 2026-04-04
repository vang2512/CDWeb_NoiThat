from fastapi import FastAPI, HTTPException
import joblib
import numpy as np
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Recommendation API", version="1.0")

# Load model khi khởi động
print("Loading model...")
try:
    model_data = joblib.load('models/simple_model.joblib')
    model = model_data['model']
    matrix = model_data['matrix']
    user_ids = model_data['user_ids']
    product_ids = model_data['product_ids']
    print(f"✅ Model loaded: {len(user_ids)} users")
except:
    print("❌ Không tìm thấy model. Chạy train_simple.py trước.")
    model_data = None

# Models
class RecommendationRequest(BaseModel):
    user_id: int
    limit: int = 5

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[int]
    message: str

# Routes
@app.get("/")
def home():
    return {"message": "Recommendation API", "status": "running"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/recommend", response_model=RecommendationResponse)
def get_recommendations(request: RecommendationRequest):
    """Lấy gợi ý cho user"""
    if model_data is None:
        raise HTTPException(status_code=500, detail="Model not trained yet")
    
    # Tìm user index
    try:
        user_index = user_ids.index(request.user_id)
    except ValueError:
        # Nếu user mới, trả về sản phẩm phổ biến
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=list(range(min(request.limit, 10))),
            message="New user: Popular products"
        )
    
    # Lấy recommendation
    recommendations = []
    if user_index < len(matrix):
        # Tìm users tương tự
        distances, indices = model.kneighbors(
            [matrix[user_index]], 
            n_neighbors=3
        )
        
        # Thu thập sản phẩm từ neighbors
        neighbor_indices = indices[0]
        recommended_products = set()
        
        for neighbor_idx in neighbor_indices:
            neighbor_products = np.where(matrix[neighbor_idx] > 0)[0]
            recommended_products.update(neighbor_products)
        
        # Loại bỏ sản phẩm đã xem
        user_products = np.where(matrix[user_index] > 0)[0]
        recommended_products = list(recommended_products - set(user_products))
        
        recommendations = recommended_products[:request.limit]
    
    return RecommendationResponse(
        user_id=request.user_id,
        recommendations=recommendations,
        message=f"Found {len(recommendations)} recommendations"
    )

@app.get("/users")
def get_users():
    """Lấy danh sách users trong model"""
    return {"users": user_ids, "count": len(user_ids)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)