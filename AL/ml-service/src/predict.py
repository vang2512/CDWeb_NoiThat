import joblib
import numpy as np

print("📊 Load model và test prediction...")

# 1. Load model
model_data = joblib.load('models/simple_model.joblib')
model = model_data['model']
matrix = model_data['matrix']
user_ids = model_data['user_ids']
product_ids = model_data['product_ids']

print(f"Model loaded: {len(user_ids)} users, {len(product_ids)} products")

# 2. Hàm dự đoán
def get_recommendations(user_index, n_recommendations=5):
    """Lấy gợi ý cho user"""
    # Tìm users tương tự
    distances, indices = model.kneighbors([matrix[user_index]], n_neighbors=3)
    
    # Lấy sản phẩm từ neighbors
    neighbor_indices = indices[0]
    recommended_products = set()
    
    for neighbor_idx in neighbor_indices:
        # Lấy sản phẩm neighbor đã tương tác
        neighbor_products = np.where(matrix[neighbor_idx] > 0)[0]
        recommended_products.update(neighbor_products)
    
    # Loại bỏ sản phẩm user đã xem
    user_products = np.where(matrix[user_index] > 0)[0]
    recommended_products = list(recommended_products - set(user_products))
    
    return recommended_products[:n_recommendations]

# 3. Test với user 0
print("\n🎯 Test với user 0:")
user_idx = 0
recommendations = get_recommendations(user_idx, 3)

print(f"User {user_idx} đã xem: {np.where(matrix[user_idx] > 0)[0]}")
print(f"Đề xuất: {recommendations}")

# 4. Test với user ngẫu nhiên
print("\n🎲 Test với user ngẫu nhiên:")
import random
random_user = random.randint(0, len(user_ids)-1)
recs = get_recommendations(random_user, 3)
print(f"User {random_user}: {recs}")