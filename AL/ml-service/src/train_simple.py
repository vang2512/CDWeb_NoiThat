import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
import joblib

print("🎯 Bắt đầu train model đơn giản...")

# 1. Tạo dữ liệu GIẢ (thay vì kết nối database ngay)
def create_sample_data():
    """Tạo dữ liệu mẫu 10 users, 20 products"""
    np.random.seed(42)
    
    # User-item interactions
    data = []
    for user in range(10):
        for product in range(20):
            if np.random.random() > 0.7:  # 30% có interaction
                rating = np.random.randint(1, 6)
                data.append([user, product, rating])
    
    df = pd.DataFrame(data, columns=['user_id', 'product_id', 'rating'])
    return df

# 2. Tạo user-item matrix
def create_matrix(df):
    """Chuyển đổi thành ma trận user x product"""
    matrix = df.pivot_table(
        index='user_id',
        columns='product_id',
        values='rating',
        fill_value=0
    )
    return matrix

# 3. Train model
def train_model(matrix):
    """Train collaborative filtering đơn giản"""
    # Sử dụng KNN để tìm user similar
    knn = NearestNeighbors(n_neighbors=3, metric='cosine')
    knn.fit(matrix)
    
    return knn

# 4. Main
print("1. Tạo dữ liệu mẫu...")
df = create_sample_data()
print(f"   → Có {len(df)} interactions từ {df['user_id'].nunique()} users")

print("2. Tạo ma trận...")
matrix = create_matrix(df)
print(f"   → Ma trận: {matrix.shape[0]} users x {matrix.shape[1]} products")

print("3. Training model...")
model = train_model(matrix)

print("4. Lưu model...")
import os
os.makedirs('models', exist_ok=True)
joblib.dump({
    'model': model,
    'user_ids': matrix.index.tolist(),
    'product_ids': matrix.columns.tolist(),
    'matrix': matrix.values
}, 'models/simple_model.joblib')

print("✅ Hoàn thành! Model đã lưu tại models/simple_model.joblib")