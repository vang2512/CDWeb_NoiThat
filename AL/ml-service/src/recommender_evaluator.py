import random
import numpy as np

class RecommenderEvaluator:
    def __init__(self, recommender, orders_df):
        self.recommender = recommender
        self.orders_df = orders_df

    
    def precision_at_k(self, recommended, relevant, k):
        return len(set(recommended[:k]) & set(relevant)) / k

    def recall_at_k(self, recommended, relevant, k):
        return len(set(recommended[:k]) & set(relevant)) / len(relevant)

    def hit_rate(self, recommended, relevant, k):
        return 1 if set(recommended[:k]) & set(relevant) else 0

    # ================= EVALUATION =================
    def evaluate(self, users, k=5):
        precisions, recalls, hits = [], [], []

        print(f"\n===== START EVALUATION (K={k}) =====")

        for user_id in users:
            user_items = self.orders_df[
                self.orders_df['user_id'] == user_id
            ]['food_id'].unique().tolist()

            if len(user_items) < 3:
                print(f" User {user_id} skipped (not enough data)")
                continue

            
            test_item = random.choice(user_items)
            relevant = [test_item]

            
            original_orders = self.recommender.orders_df

            
            temp_orders = original_orders[
                ~((original_orders['user_id'] == user_id) &
                  (original_orders['food_id'] == test_item))
            ]

            self.recommender.orders_df = temp_orders

            
            recs = self.recommender.hybrid_recommend(
                user_id,
                top_n=k,
                allow_repeat=True
            )

            
            self.recommender.orders_df = original_orders

            recommended_items = [food_id for food_id, _ in recs]

            
            hit = test_item in recommended_items
            precision = self.precision_at_k(recommended_items, relevant, k)
            recall = self.recall_at_k(recommended_items, relevant, k)
            hitrate = self.hit_rate(recommended_items, relevant, k)

            repeat_ratio = sum(
                1 for f in recommended_items if f in user_items
            ) / k

            
            print(f"\n User {user_id}")
            print(f" Test item: {test_item}")
            print(f" Recommended: {recommended_items}")
            print(f" HIT: {'YES' if hit else 'NO'}")
            print(f" Precision@{k}: {precision:.3f}")
            print(f" Recall@{k}:    {recall:.3f}")
            print(f" HitRate:       {hitrate}")
            print(f" Repeat ratio:  {repeat_ratio:.2f}")

            precisions.append(precision)
            recalls.append(recall)
            hits.append(hitrate)

        print("\n===== EVALUATION DONE =====")

        return {
            "Precision@K": np.mean(precisions) if precisions else 0,
            "Recall@K": np.mean(recalls) if recalls else 0,
            "HitRate": np.mean(hits) if hits else 0
        }
