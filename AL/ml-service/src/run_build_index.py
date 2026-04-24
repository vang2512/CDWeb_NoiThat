from src.image_vectorizer import ImageVectorizer

if __name__ == "__main__":
    vectorizer = ImageVectorizer()

    # Build vector từ DB
    vectorizer.build_index()

    # Lưu lại
    vectorizer.save_index()

    print("TEST DONE!")
    