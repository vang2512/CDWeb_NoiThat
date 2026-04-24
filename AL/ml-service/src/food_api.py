from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Optional
import joblib
import pandas as pd
import numpy as np
import sys
import os
import uvicorn

from PIL import Image
import io
import torch

from src.image_vectorizer import ImageVectorizer
# Import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.food_recommender import FoodRecommender

app = FastAPI(
    title="Food Recommendation API",
    version="1.0",
    description="API cung cấp gợi ý sản phẩm"
)
def safe_float(x):
    return float(x) if x is not None and not pd.isna(x) else 0.0

def safe_str(x):
    return str(x) if x is not None and not pd.isna(x) else ""

# Load model
MODEL_PATH = "models/food_recommender_v1.joblib"
try:
    model = FoodRecommender.load(MODEL_PATH)
    print(f" Model loaded from {MODEL_PATH}")
    if hasattr(model, 'trained_at'):
        print(f"   Trained at: {model.trained_at}")
    else:
        print("   Training time information not available.")
except Exception as e:
    print(f" Failed to load model: {e}")
    model = None

# Load Image Vectorizer (CLIP + FAISS)
try:
    vectorizer = ImageVectorizer()
    vectorizer.load_index()
    print(" Image search model loaded")
except Exception as e:
    print(f" Failed to load image search: {e}")
    vectorizer = None

# Helper function để lấy ảnh mặc định
def get_default_category_image(category_name: str) -> str:
    """Trả về ảnh mặc định cho category"""
    defaults = {
        "Bánh Miền Bắc": "https://vietnam-amazing.com/wp-content/uploads/2023/11/banh-com-pho-co-ngon.webp",
        "Bánh Miền Trung": "https://i.pinimg.com/1200x/6c/65/29/6c65291d5a0884bf49028913c59889f0.jpg",
        "Bánh Miền Nam": "https://i.pinimg.com/1200x/03/d3/1b/03d31ba36e399f2618f103e640825194.jpg",
    }
    
    # Tìm category phù hợp
    for key, url in defaults.items():
        if key.lower() in category_name.lower():
            return url

    return "https://i.pinimg.com/1200x/00/9a/0d/009a0de80c263d23d7d97b2a6ec801b6.jpg"

# Request/Response models
class RecommendationRequest(BaseModel):
    user_id: int
    limit: int = 10
    include_food_info: bool = True

# THÊM MODEL CategoryInfo
class CategoryInfo(BaseModel):
    id: int
    categoryName: str
    img: str

# SỬA FoodRecommendation - đổi category từ str thành CategoryInfo
class FoodRecommendation(BaseModel):
    food_id: int
    name: str
    price: float
    category: CategoryInfo  
    image_url: str
    score: float
    description: Optional[str] = None

class RecommendationResponse(BaseModel):
    user_id: int
    recommendations: List[FoodRecommendation]
    message: str
    total: int

# API Endpoints
@app.get("/")
def root():
    return {
        "service": "Food Recommendation API",
        "version": "1.0",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/recommend", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        raw_recs = model.hybrid_recommend(request.user_id, top_n=request.limit)
        
        recommendations = []
        for food_id, score in raw_recs:
            food_info = model.foods_df[model.foods_df['food_id'] == food_id]
            
            if not food_info.empty:
                food = food_info.iloc[0]
                
                # TẠO OBJECT CATEGORY TỪ foods_df
                category_id = int(food['categoryid']) if 'categoryid' in food and not pd.isna(food['categoryid']) else 0
                category_name = str(food['category_name']) if 'category_name' in food else "Unknown"
                
                # Lấy category_img nếu có, không thì dùng default
                category_img = ""
                if 'category_img' in food and not pd.isna(food['category_img']):
                    category_img = str(food['category_img'])
                else:
                    category_img = get_default_category_image(category_name)
                
                # Tạo CategoryInfo object
                category_info = CategoryInfo(
                    id=category_id,
                    categoryName=category_name,
                    img=category_img
                )
                
                rec = FoodRecommendation(
                    food_id=int(food_id),
                    name=str(food['food_name']),
                    price=float(food['price']),
                    category=category_info, 
                    image_url=str(food['img']),
                    score=float(score),
                    description=str(food['description']) if 'description' in food else None
                )
                recommendations.append(rec)
        
        return RecommendationResponse(
            user_id=request.user_id,
            recommendations=recommendations,
            message=f"Found {len(recommendations)} recommendations",
            total=len(recommendations)
        )
        
    except Exception as e:
        print(f"Error in get_recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/user/{user_id}/stats")
def get_user_stats(user_id: int):
    """Thống kê user"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        user_orders = model.orders_df[model.orders_df['user_id'] == user_id]
        user_reviews = model.reviews_df[model.reviews_df['user_id'] == user_id]
        
        # Favorite category
        if len(user_orders) > 0:
            user_foods = user_orders['food_id'].unique()
            fav_category = model.foods_df[
                model.foods_df['food_id'].isin(user_foods)
            ]['category_name'].mode()
            fav_category = fav_category.iloc[0] if not fav_category.empty else None
        else:
            fav_category = None
        
        return {
            "user_id": user_id,
            "total_orders": len(user_orders),
            "total_items": int(user_orders['quantity'].sum()) if len(user_orders) > 0 else 0,
            "total_spent": float((user_orders['quantity'] * user_orders['unit_price']).sum()) if len(user_orders) > 0 else 0,
            "total_reviews": len(user_reviews),
            "avg_rating": float(user_reviews['rating'].mean()) if len(user_reviews) > 0 else 0,
            "favorite_category": fav_category
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/foods/popular")
def get_popular_foods(limit: int = 10):
    """Lấy danh sách món ăn phổ biến"""
    if model is None or model.popularity_scores is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Sort by popularity score
        popular_foods = sorted(
            model.popularity_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]
        
        result = []
        for food_id, score in popular_foods:
            food_info = model.foods_df[model.foods_df['food_id'] == food_id]
            if not food_info.empty:
                food = food_info.iloc[0]
                
                # Cũng trả về object Category cho popular foods
                category_id = int(food['categoryid']) if 'categoryid' in food and not pd.isna(food['categoryid']) else 0
                category_name = str(food['category_name']) if 'category_name' in food else "Unknown"
                category_img = ""
                if 'category_img' in food and not pd.isna(food['category_img']):
                    category_img = str(food['category_img'])
                else:
                    category_img = get_default_category_image(category_name)
                
                category_info = CategoryInfo(
                    id=category_id,
                    categoryName=category_name,
                    img=category_img
                )
                
                result.append({
                    "food_id": int(food_id),
                    "name": str(food['food_name']),
                    "price": float(food['price']),
                    "category": category_info,  
                    "score": float(score)
                })
        
        return {"popular_foods": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Thêm endpoint debug để kiểm tra
@app.get("/debug/food/{food_id}")
def debug_food(food_id: int):
    """Debug thông tin food"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        food_info = model.foods_df[model.foods_df['food_id'] == food_id]
        if food_info.empty:
            return {"error": f"Food {food_id} not found"}
        
        food = food_info.iloc[0]
        return {
            "food_id": food_id,
            "columns": list(food_info.columns),
            "data": {
                "categoryid": int(food['categoryid']) if 'categoryid' in food else None,
                "category_name": str(food['category_name']) if 'category_name' in food else None,
                "category_img": str(food['category_img']) if 'category_img' in food and not pd.isna(food['category_img']) else "NOT FOUND",
                "has_category_img": 'category_img' in food
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
#  Search image product recommand   
@app.post("/search-image")
async def search_image(file: UploadFile = File(...)):
    if vectorizer is None:
        raise HTTPException(status_code=500, detail="Image model not loaded")

    try:
        contents = await file.read()

        image = Image.open(io.BytesIO(contents)).convert("RGB")
        image_input = vectorizer.preprocess(image).unsqueeze(0)

        with torch.no_grad():
            features = vectorizer.model.encode_image(image_input)
            features = features / features.norm(dim=-1, keepdim=True)

        query_vector = features.numpy().astype("float32")

        # search FAISS
        k = 5
        distances, indices = vectorizer.index.search(query_vector, k)

        results = []

        for i in range(len(indices[0])):
            idx = indices[0][i]

            if idx in vectorizer.id_map:
                food_id = vectorizer.id_map[idx]

                # LẤY FULL INFO từ foods_df
                food_info = model.foods_df[model.foods_df['food_id'] == food_id]

                if not food_info.empty:
                    food = food_info.iloc[0]

                    results.append({
                        "food_id": int(food_id),
                        "name": str(food['food_name']),
                        "price": float(food['price']),
                        "image_url": str(food['img']),
                        "score": float(distances[0][i])
                    })

        return {
            "success": True,
            "total": len(results),
            "foods": results
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
     uvicorn.run("src.food_api:app", host="0.0.0.0", port=8000, reload=True)