from food_database import FoodDatabase
from food_recommender import FoodRecommender
from recommender_evaluator import RecommenderEvaluator

db = FoodDatabase()
db.connect()
data = db.load_all_data()
db.close()

recommender = FoodRecommender(
    data['foods'], data['orders'], data['reviews']
)
recommender.train()

evaluator = RecommenderEvaluator(recommender, data['orders'])

users = data['users']['user_id'].unique()


result = evaluator.evaluate(users, k=10)

print("\n FINAL EVALUATION RESULT")
for k, v in result.items():
    print(f"{k}: {v:.4f}")
