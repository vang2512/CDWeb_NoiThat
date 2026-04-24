import pandas as pd
import mysql.connector
from mysql.connector import Error
import numpy as np

class FoodDatabase:
    def __init__(self):
        self.config = {
            'host': '127.0.0.1',
            'database': 'noi_that',
            'user': 'root',
            'password': '',
            'port': 3306
        }
        self.connection = None

    # Kết nối DB
    def connect(self):
        try:
            self.connection = mysql.connector.connect(**self.config)
            if self.connection.is_connected():
                print("Kết nối MySQL thành công!")
                return True
        except Error as e:
            print(f"Lỗi kết nối: {e}")
            return False

    # Load toàn bộ data (recommender)
    def load_all_data(self):
        data = {}

        # 1. Foods
        foods_query = """
        SELECT 
            f.id as food_id,
            f.name as food_name,
            f.description,
            f.price,
            f.quantity,
            f.img,
            f.categoryid,
            fc.category_name,
            fc.img as category_img
        FROM products f
        LEFT JOIN food_category fc ON f.categoryid = fc.id
        """
        data['products'] = pd.read_sql(foods_query, self.connection)
        print(f"Loaded {len(data['products'])} products")

        # 2. Orders
        orders_query = """
        SELECT 
            o.id as order_id,
            o.user_id,
            o.date as order_date,
            o.status,
            od.food_id,
            od.quantity,
            od.unit_price,
            f.name as food_name
        FROM orders o
        JOIN orderdetails od ON o.id = od.order_id
        JOIN products f ON od.food_id = f.id
        WHERE o.status IN ('Đã giao', 'Đang giao', 'Đang xử lý')
        ORDER BY o.date
        """
        data['orders'] = pd.read_sql(orders_query, self.connection)
        print(f"Loaded {len(data['orders'])} order items")

        # 3. Reviews
        reviews_query = """
        SELECT 
            r.userid as user_id,
            r.foodid as food_id,
            r.rating,
            r.comment,
            r.createdat
        FROM reviews r
        ORDER BY r.createdat
        """
        data['reviews'] = pd.read_sql(reviews_query, self.connection)
        print(f"Loaded {len(data['reviews'])} reviews")

        # 4. Users
        users_query = """
        SELECT 
            userid as user_id,
            full_name,
            email
        FROM users
        """
        data['users'] = pd.read_sql(users_query, self.connection)
        print(f"Loaded {len(data['users'])} users")

        return data

    # Lấy ảnh sản phẩm cho AI
    def get_food_images(self):
        """Lấy danh sách ảnh sản phẩm cho AI search"""
        try:
            if not self.connection or not self.connection.is_connected():
                self.connect()

            cursor = self.connection.cursor(dictionary=True)

            query = """
            SELECT 
                id,
                img
            FROM products
            WHERE is_deleted = 0
            AND img IS NOT NULL
            """

            cursor.execute(query)

            results = cursor.fetchall()

            products = []

            for row in results:
                image_url = row["img"]

                products.append({
                    "id": row["id"],
                    "image_url": image_url
                })

            print(f"Loaded {len(products)} food images for AI")

            return products

        except Exception as e:
            print("Error loading food images:", e)
            return []

    # Đóng DB
    def close(self):
        if self.connection and self.connection.is_connected():
            self.connection.close()
            print("🔌 Đã đóng kết nối database")


# ============================
# TEST
# ============================
if __name__ == "__main__":
    db = FoodDatabase()

    if db.connect():
        data = db.load_all_data()

        print(f"\n• Products: {len(data['products'])} items in {data['products']['category_name'].nunique()} categories")
        print(f"• Orders: {data['orders']['user_id'].nunique()} users made {data['orders']['order_id'].nunique()} orders")
        print(f"• Reviews: {data['reviews']['user_id'].nunique()} users gave {len(data['reviews'])} ratings")

        print("\nTOP 5 PRODUCTS:")
        print(data['products'][['food_id', 'food_name', 'category_name', 'price']].head())

        print("\nRECENT ORDERS:")
        print(data['orders'][['user_id', 'food_name', 'quantity', 'order_date']].head())

        print("\nRECENT REVIEWS:")
        print(data['reviews'][['user_id', 'food_id', 'rating', 'comment']].head())

        # 👉 Test ảnh
        print("\nIMAGE DATA:")
        images = db.get_food_images()
        print(images[:5])

        db.close()