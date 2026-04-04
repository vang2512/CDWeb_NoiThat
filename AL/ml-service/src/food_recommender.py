import pandas as pd
import numpy as np
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler
import joblib
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class FoodRecommender:
    def __init__(self, foods_df, orders_df, reviews_df):
        self.foods_df = foods_df
        self.orders_df = orders_df
        self.reviews_df = reviews_df
        
        # Models
        self.cf_model = None
        self.cb_model = None
        self.popularity_scores = None
        
    # ========== 1. PREPARE INTERACTION MATRIX ==========
    def create_interaction_matrix(self):
        """Tạo user-food interaction matrix từ orders và reviews"""
        
        # Tạo từ orders (weight = quantity * price weight)
        orders_matrix = self.orders_df.groupby(['user_id', 'food_id']).agg({
            'quantity': 'sum',
            'unit_price': 'mean'
        }).reset_index()
        
        # Tính score từ orders
        orders_matrix['order_score'] = orders_matrix['quantity'] * 2  
        
        # Thêm reviews (nếu có)
        if len(self.reviews_df) > 0:
            reviews_matrix = self.reviews_df.groupby(['user_id', 'food_id']).agg({
                'rating': 'mean'
            }).reset_index()
            reviews_matrix['review_score'] = reviews_matrix['rating']
        else:
            reviews_matrix = pd.DataFrame(columns=['user_id', 'food_id', 'review_score'])
        
        # Kết hợp orders và reviews
        interactions = pd.merge(
            orders_matrix[['user_id', 'food_id', 'order_score']],
            reviews_matrix[['user_id', 'food_id', 'review_score']],
            on=['user_id', 'food_id'],
            how='outer'
        )
        
        # Fill NaN và tính tổng score
        interactions['order_score'] = interactions['order_score'].fillna(0)
        interactions['review_score'] = interactions['review_score'].fillna(0)
        interactions['total_score'] = (
            interactions['order_score'] * 0.7 +  # Order quan trọng hơn
            interactions['review_score'] * 0.3
        )
        
        # Tạo matrix
        interaction_matrix = interactions.pivot_table(
            index='user_id',
            columns='food_id',
            values='total_score',
            fill_value=0
        )
        
        # Scale về 0-5
        scaler = MinMaxScaler(feature_range=(0, 5))
        scaled_matrix = pd.DataFrame(
            scaler.fit_transform(interaction_matrix),
            index=interaction_matrix.index,
            columns=interaction_matrix.columns
        )
        
        print(f" Interaction matrix: {scaled_matrix.shape[0]} users x {scaled_matrix.shape[1]} foods")
        return scaled_matrix
    
    # ========== 2. COLLABORATIVE FILTERING ==========
    def train_collaborative_filtering(self, matrix):
        """Train CF model với KNN"""
        if matrix.shape[0] < 2:
            print("Không đủ users cho CF, sử dụng fallback")
            return None
        
        # Tính similarity giữa users
        n_neighbors = min(3, matrix.shape[0] - 1)
        knn = NearestNeighbors(
            n_neighbors=n_neighbors,
            metric='cosine',
            algorithm='brute'
        )
        knn.fit(matrix)
        
        self.cf_model = {
            'knn': knn,
            'user_ids': matrix.index.tolist(),
            'user_matrix': matrix.values,
            'food_ids': matrix.columns.tolist(),
            'matrix': matrix
        }
        
        print(f"CF trained with {n_neighbors} neighbors")
        return self.cf_model
    
    # ========== 3. CONTENT-BASED FILTERING ==========
    def train_content_based(self):
        """Train model dựa trên nội dung món ăn"""
        # Kết hợp các features text
        self.foods_df['content'] = (
            self.foods_df['food_name'].fillna('') + ' ' +
            self.foods_df['category_name'].fillna('') + ' ' +
            self.foods_df['description'].fillna('')
        )
        
        # TF-IDF
        tfidf = TfidfVectorizer(
            max_features=500,
            stop_words=None,  
            ngram_range=(1, 2)
        )
        
        tfidf_matrix = tfidf.fit_transform(self.foods_df['content'])
        cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
        
        # Lưu mapping
        food_to_idx = pd.Series(
            self.foods_df.index,
            index=self.foods_df['food_id']
        ).to_dict()
        
        self.cb_model = {
            'tfidf': tfidf,
            'cosine_sim': cosine_sim,
            'food_to_idx': food_to_idx,
            'idx_to_food': self.foods_df['food_id'].tolist()
        }
        
        print(f"Content-based trained for {len(self.foods_df)} foods")
        return self.cb_model
    
    # ========== 4. POPULARITY CALCULATION ==========
    def calculate_popularity(self):
        """Tính độ phổ biến của món ăn"""
        
        # 1. Popularity từ orders
        order_popularity = self.orders_df.groupby('food_id').agg({
            'quantity': 'sum',
            'order_id': 'nunique'
        }).reset_index()
        order_popularity['order_pop_score'] = (
            order_popularity['quantity'] * 0.6 +
            order_popularity['order_id'] * 0.4
        )
        
        # 2. Popularity từ reviews
        if len(self.reviews_df) > 0:
            review_popularity = self.reviews_df.groupby('food_id').agg({
                'rating': ['mean', 'count']
            }).reset_index()
            review_popularity.columns = ['food_id', 'avg_rating', 'rating_count']
            review_popularity['review_pop_score'] = (
                review_popularity['avg_rating'] * 0.7 +
                review_popularity['rating_count'] * 0.3
            )
        else:
            review_popularity = pd.DataFrame(columns=['food_id', 'review_pop_score'])
        
        # 3. Kết hợp
        popularity = pd.DataFrame({'food_id': self.foods_df['food_id'].unique()})
        
        popularity = pd.merge(
            popularity,
            order_popularity[['food_id', 'order_pop_score']],
            on='food_id',
            how='left'
        )
        
        if 'review_pop_score' in review_popularity.columns:
            popularity = pd.merge(
                popularity,
                review_popularity[['food_id', 'review_pop_score']],
                on='food_id',
                how='left'
            )
        
        # Fill NaN và tính tổng
        popularity['order_pop_score'] = popularity['order_pop_score'].fillna(0)
        if 'review_pop_score' in popularity.columns:
            popularity['review_pop_score'] = popularity['review_pop_score'].fillna(0)
            popularity['total_pop_score'] = (
                popularity['order_pop_score'] * 0.8 +
                popularity['review_pop_score'] * 0.2
            )
        else:
            popularity['total_pop_score'] = popularity['order_pop_score']
        
        # Chuẩn hóa 0-1
        if popularity['total_pop_score'].max() > 0:
            popularity['total_pop_score'] = (
                popularity['total_pop_score'] / popularity['total_pop_score'].max()
            )
        
        self.popularity_scores = popularity.set_index('food_id')['total_pop_score'].to_dict()
        return self.popularity_scores
    
    # ========== 5. HYBRID RECOMMENDATION ==========
    def hybrid_recommend(self, user_id, top_n=10, weights=None, allow_repeat=True):
        """
        Kết hợp các phương pháp:
        - CF: Collaborative Filtering
        - CB: Content-Based
        - POP: Popularity
        - CAT: Category preference
        """
        
        if weights is None:
            weights = {'cf': 0.4, 'cb': 0.3, 'pop': 0.2, 'cat': 0.1}
        
        all_scores = {}
        
        # A. COLLABORATIVE FILTERING
        cf_scores = self._get_cf_scores(user_id)
        if cf_scores:
            for food_id, score in cf_scores.items():
                all_scores[food_id] = score * weights['cf']
        
        # B. CONTENT-BASED
        cb_scores = self._get_cb_scores(user_id)
        if cb_scores:
            for food_id, score in cb_scores.items():
                if food_id in all_scores:
                    all_scores[food_id] += score * weights['cb']
                else:
                    all_scores[food_id] = score * weights['cb']
        
        # C. POPULARITY
        if self.popularity_scores:
            for food_id in self.foods_df['food_id'].unique():
                pop_score = self.popularity_scores.get(food_id, 0)
                if food_id in all_scores:
                    all_scores[food_id] += pop_score * weights['pop']
                else:
                    all_scores[food_id] = pop_score * weights['pop']
        
        # D. CATEGORY PREFERENCE (user thích category nào)
        cat_scores = self._get_category_scores(user_id)
        if cat_scores:
            for idx, row in self.foods_df.iterrows():
                food_id = row['food_id']
                category = row['categoryid']
                cat_score = cat_scores.get(category, 0)
                
                if food_id in all_scores:
                    all_scores[food_id] += cat_score * weights['cat']
                else:
                    all_scores[food_id] = cat_score * weights['cat']
        
        # Loại bỏ món đã mua/xem
        user_interactions = self._get_user_interactions(user_id)
        
        # Sắp xếp và lọc
        recommendations = []
        for food_id, score in sorted(all_scores.items(), key=lambda x: x[1], reverse=True):
            if food_id in user_interactions:
                if not allow_repeat:
                    continue
                score = score * 0.3
            recommendations.append((food_id, score))
            if len(recommendations) >= top_n * 2:  # Lấy dư để filter price sau
                    break
        
        # Lọc theo price range của user (nếu có data)
        filtered_recs = self._filter_by_user_preference(user_id, recommendations, top_n)
        
        return filtered_recs[:top_n]
    
    def _get_cf_scores(self, user_id):
        """Lấy CF scores cho user"""
        if self.cf_model is None or user_id not in self.cf_model['user_ids']:
            return None
        
        user_idx = self.cf_model['user_ids'].index(user_id)
        user_vector = self.cf_model['user_matrix'][user_idx]
        
        # Tìm similar users
        distances, indices = self.cf_model['knn'].kneighbors(
            [user_vector],
            n_neighbors=len(self.cf_model['user_ids'])
        )
        
        scores = {}
        for neighbor_idx in indices[0]:
            if neighbor_idx == user_idx:
                continue
                
            neighbor_vector = self.cf_model['user_matrix'][neighbor_idx]
            similarity = 1 - distances[0][list(indices[0]).index(neighbor_idx)]
            
            for food_idx, rating in enumerate(neighbor_vector):
                if rating > 2 and user_vector[food_idx] == 0:  # Neighbor thích mà user chưa dùng
                    food_id = self.cf_model['food_ids'][food_idx]
                    if food_id not in scores:
                        scores[food_id] = 0
                    scores[food_id] += rating * similarity
        
        # Chuẩn hóa
        if scores:
            max_score = max(scores.values())
            scores = {k: v/max_score for k, v in scores.items()}
        
        return scores
    
    def _get_cb_scores(self, user_id):
        """Lấy Content-Based scores"""
        if self.cb_model is None:
            return None
        
        # Lấy món user đã tương tác
        user_foods = self._get_user_interactions(user_id)
        if not user_foods:
            return None
        
        scores = {}
        for food_id in user_foods:
            if food_id in self.cb_model['food_to_idx']:
                idx = self.cb_model['food_to_idx'][food_id]
                sim_scores = list(enumerate(self.cb_model['cosine_sim'][idx]))
                
                # Lấy top 5 món tương tự
                for food_idx, similarity in sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:6]:
                    similar_food_id = self.cb_model['idx_to_food'][food_idx]
                    if similar_food_id not in user_foods:
                        if similar_food_id not in scores:
                            scores[similar_food_id] = 0
                        scores[similar_food_id] += similarity
        
        # Chuẩn hóa
        if scores:
            max_score = max(scores.values())
            scores = {k: v/max_score for k, v in scores.items()}
        
        return scores
    
    def _get_category_scores(self, user_id):
        """Tính user preference cho từng category"""
        user_orders = self.orders_df[self.orders_df['user_id'] == user_id]
        if len(user_orders) == 0:
            return None
        
        # Lấy category của món đã mua
        user_foods = user_orders['food_id'].unique()
        user_categories = self.foods_df[
            self.foods_df['food_id'].isin(user_foods)
        ]['categoryid'].value_counts()
        
        # Tính score cho từng category
        total_orders = len(user_orders)
        category_scores = {}
        for category, count in user_categories.items():
            category_scores[category] = count / total_orders
        
        return category_scores
    
    def _get_user_interactions(self, user_id):
        """Lấy tất cả foods mà user đã tương tác"""
        user_orders = self.orders_df[self.orders_df['user_id'] == user_id]['food_id'].unique()
        user_reviews = self.reviews_df[self.reviews_df['user_id'] == user_id]['food_id'].unique()

        return set(list(user_orders) + list(user_reviews))
    
    def _filter_by_user_preference(self, user_id, recommendations, top_n):
        """Lọc recommendations theo preference của user"""
        if len(recommendations) == 0:
            return recommendations
        
        # Lấy price preference của user
        user_orders = self.orders_df[self.orders_df['user_id'] == user_id]
        if len(user_orders) > 0:
            avg_spent = user_orders['unit_price'].mean()
            price_range = (avg_spent * 0.5, avg_spent * 2)
        else:
            price_range = (0, 100000)  
        
        # Lọc và sắp xếp lại
        filtered = []
        for food_id, score in recommendations:
            food_info = self.foods_df[self.foods_df['food_id'] == food_id]
            if not food_info.empty:
                price = food_info.iloc[0]['price']
                if price_range[0] <= price <= price_range[1]:
                    # Điều chỉnh score dựa trên price (gần avg_price hơn = tốt hơn)
                    price_penalty = abs(price - (price_range[0] + price_range[1])/2) / 10000
                    adjusted_score = score * (1 - min(price_penalty * 0.1, 0.3))
                    filtered.append((food_id, adjusted_score))
        
        # Sắp xếp theo adjusted score
        filtered.sort(key=lambda x: x[1], reverse=True)
        return filtered[:top_n]
    
    # ========== 6. TRAIN & SAVE ==========
    def train(self):
        """Train tất cả models"""
        print("Training Food Recommender...")
        
        # 1. Tạo interaction matrix
        print("1. Creating interaction matrix...")
        interaction_matrix = self.create_interaction_matrix()
        
        # 2. Train Collaborative Filtering
        print("2. Training Collaborative Filtering...")
        self.train_collaborative_filtering(interaction_matrix)
        
        # 3. Train Content-Based
        print("3. Training Content-Based...")
        self.train_content_based()
        
        # 4. Tính popularity
        print("4. Calculating popularity...")
        self.calculate_popularity()
        
        print("All models trained successfully!")
        return self
    
    def save(self, path='models/food_recommender.joblib'):
        """Lưu model"""
        model_data = {
            'cf_model': self.cf_model,
            'cb_model': self.cb_model,
            'popularity_scores': self.popularity_scores,
            'foods_df': self.foods_df,
            'orders_df': self.orders_df,
            'reviews_df': self.reviews_df,
            'trained_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'version': '1.0'
        }
        
        import os
        os.makedirs('models', exist_ok=True)
        joblib.dump(model_data, path)
        print(f" Model saved to {path}")
    
    @classmethod
    def load(cls, path='models/food_recommender.joblib'):
        """Load model đã train"""
        model_data = joblib.load(path)
        
        # Tạo instance mới
        instance = cls(
            model_data['foods_df'],
            model_data['orders_df'],
            model_data['reviews_df']
        )
        instance.cf_model = model_data['cf_model']
        instance.cb_model = model_data['cb_model']
        instance.popularity_scores = model_data['popularity_scores']
        
        print(f" Model loaded from {path} (trained at {model_data['trained_at']})")
        return instance