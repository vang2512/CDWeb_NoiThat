import React, { useEffect, useState } from "react";
import "./ProductReview.css";
import { Star, Ruler } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import authApi from "../../../api/Auth/Auth_Api";
import { ReviewModel } from "../../../model/Review";
import { ProductDetails } from "../../../model/ProductDetail";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";


const ProductReviewPage = () => {

  const { t } = useTranslation();

  const { id } = useParams();
  const productId = Number(id);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewModel[]>([]);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [filter, setFilter] = useState("all");
  const [selectedStar, setSelectedStar] = useState(0);
  const [content, setContent] = useState("");
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const starList = [5, 4, 3, 2, 1];

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const fetchReviews = async () => {
    try {
      const res = await authApi.getReviewsByProduct(productId);
      const mapped = ReviewModel.fromApiList(res.data);
      setReviews(mapped);
    } catch (err) {
      console.error("Lỗi load review:", err);
    }
  };

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await authApi.getDetail(id);
        const data: ProductDetails = res.data;
        setProduct(data);
      } catch (error) {
        console.error("Lỗi load detail:", error);
      }
    };

    if (id) fetchProductDetail();
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  const handleSubmit = async () => {
    if (selectedStar === 0 || content.trim() === "") {
      toast.error(t("fill_all"));
      return;
    }
    if (!storedUser || !storedUser.id) {
      toast.error(t("fill_all_user"));
      return;
    }

    try {
      await authApi.addReview({
        userId: storedUser.id,
        foodId: productId,
        rating: selectedStar,
        comment: content
      });

      toast.success(t("submit_success"));

      setSelectedStar(0);
      setContent("");

      fetchReviews();
    } catch (err) {
      console.error("Lỗi gửi review:", err);
    }
  };

  const filteredReviews =
    filter === "all"
      ? reviews
      : reviews.filter((r) => r.rating === Number(filter));

  return (
    <div className="review_page">
      <div className="container">

        {/* breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate("/")}>{t("home")}</span>
          <span className="slash">/</span>
          <span onClick={() => navigate(`/product-detail/${productId}`)}>{t("product_detail")}</span>
          <span className="slash">/</span>
          <span>{t("review_title")}</span>
        </div>

        {/* title */}
        <h1 className="product_title">{product?.name}</h1>

        <div className="product_rating">
          <p>{t("sold")}: {product?.quantitySold}</p>

          <div className="rating">
            <Star size={16} />
            {ReviewModel.calcAverage(reviews)}
          </div>

          <div className="spec_link">
            <Ruler size={16} />
            {t("spec")}
          </div>
        </div>

        <div className="review_box">

          {/* FILTER */}
          <h3>{t("filter_review")}</h3>

          <div className="filter_buttons">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              {t("all")}
            </button>

            {starList.map((star) => (
              <button
                key={star}
                className={filter === String(star) ? "active" : ""}
                onClick={() => setFilter(String(star))}
              >
                {star}
                <Star size={14} />
              </button>
            ))}
          </div>

          {/* LIST */}
          {filteredReviews.length === 0 ? (
            <p className="empty">{t("no_review")}</p>
          ) : (
            <div className="review_list">
              {filteredReviews.map((review) => (
                <div key={review.id} className="review_item">

                  <div className="review_header">
                    <div className="avatar">
                      {review.userName?.charAt(0)}
                    </div>

                    <div>
                      <p className="review_name">{review.userName}</p>

                      <div className="review_stars">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            className={review.rating >= s ? "active" : ""}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="review_content">{review.comment}</p>

                  <span className="review_date">{review.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* FORM */}
          <div className="review_form">
            <h4>{t("add_review")}</h4>

            <div className="input_group">
              <p>{t("your_rating")}</p>

              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={26}
                    className={selectedStar >= star ? "active" : ""}
                    onClick={() => setSelectedStar(star)}
                  />
                ))}
              </div>
            </div>

            <div className="input_group">
              <p>{t("review_content")}</p>

              <textarea
                placeholder={t("enter_content")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            <button className="btn_submit" onClick={handleSubmit}>
              ✈ {t("send")}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage;