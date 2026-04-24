import sys
import os
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.food_database import FoodDatabase
from src.food_recommender import FoodRecommender

def main():
    print("=" * 60)
    print("FOOD RECOMMENDATION SYSTEM - TRAINING")
    print("=" * 60)
    
    # 1. Kết nối và load data
    print("\nLoading data from database...")
    db = FoodDatabase()
    if not db.connect():
        print(" Cannot connect to database")
        return
    
    data = db.load_all_data()
    db.close()
    
    print(f"\n Data Summary:")
    print(f"• Foods: {len(data['products'])} items")
    print(f"• Orders: {data['orders']['user_id'].nunique()} users, {len(data['orders'])} items")
    print(f"• Reviews: {len(data['reviews'])} ratings")
    print(f"• Users: {len(data['users'])} total users")
    
    # 2. Train model
    print("\n Training hybrid recommendation model...")
    recommender = FoodRecommender(
        foods_df=data['products'],
        orders_df=data['orders'],
        reviews_df=data['reviews']
    )
    
    recommender.train()
    
    # 3. Save model
    print("\n Saving model...")
    recommender.save('models/food_recommender_v1.joblib')
    
    # 4. Test với các users
    print("\n Testing recommendations...")
    test_users = data['users']['user_id'].unique()[:4]
    
    for user_id in test_users:
        print(f"\n User {user_id}:")
        try:
            recs = recommender.hybrid_recommend(user_id, top_n=5)
            if recs:
                print(f"   Recommendations (food_id, score):")
                for food_id, score in recs:
                    food_name = data['products'][data['products']['food_id'] == food_id]['food_name'].values
                    food_name = food_name[0] if len(food_name) > 0 else "Unknown"
                    price = data['products'][data['products']['food_id'] == food_id]['price'].values
                    price = price[0] if len(price) > 0 else 0
                    print(f"   • {food_id}: {food_name} (${price:,}) - score: {score:.3f}")
            else:
                print("   No recommendations (new user or insufficient data)")
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n" + "=" * 60)
    print(" TRAINING COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    main()