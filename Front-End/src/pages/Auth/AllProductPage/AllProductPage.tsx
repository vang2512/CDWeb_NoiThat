import React, { useEffect, useState } from "react";
import "./AllProductPage.css";
import { SlidersHorizontal } from "lucide-react";
import authApi from "../../../api/Auth/Auth_Api";
import { Product } from "../../../model/Product";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AllProductPage = () => {

    const { t } = useTranslation();

    const { id } = useParams();
    const navigate = useNavigate();

    const [sortType, setSortType] = useState<string>("featured");
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                if (!id) return;

                const res = await authApi.getByCategory(Number(id));
                setProducts(res.data as Product[]);
            } catch (error) {
                console.error("Lỗi load sản phẩm:", error);
            }
        };

        fetchProducts();
    }, [id]);

    const sortedProducts = [...products].sort((a, b) => {

        if (sortType === "best") return b.quantitySold - a.quantitySold;
        if (sortType === "sale") return b.discount - a.discount;
        if (sortType === "asc") return a.price - b.price;
        if (sortType === "desc") return b.price - a.price;

        return 0;
    });
      useEffect(() => {
        document.title = t("all_products");
      }, [t]);

    return (
        <div className="all_product_page">

            {/* BREADCRUMB */}
            <div className="breadcrumb">
                <span onClick={() => navigate("/")}>{t("home")}</span>
                <span className="slash">/</span>
                <span>{t("all_products")}</span>
            </div>

            <div className="container_all_product">

                {/* FILTER */}
                <div className="filter_box">

                    {/* CATEGORY */}
                    <button
                        className="category_btn modern"
                        onClick={() => navigate("/products/1")}
                    >
                        <SlidersHorizontal size={16} className="icon" />
                        {t("category")}: {products[0]?.category?.categoryName || t("loading")}
                    </button>

                    {/* SORT */}
                    <div className="sort_box">
                        <span>{t("sort_by")}:</span>

                        <button
                            className={sortType === "featured" ? "active" : ""}
                            onClick={() => setSortType("featured")}
                        >
                            {t("featured")}
                        </button>

                        <button
                            className={sortType === "best" ? "active" : ""}
                            onClick={() => setSortType("best")}
                        >
                            {t("best_selling")}
                        </button>

                        <button
                            className={sortType === "sale" ? "active" : ""}
                            onClick={() => setSortType("sale")}
                        >
                            {t("discount")}
                        </button>

                        <button
                            className={sortType === "desc" ? "active" : ""}
                            onClick={() => setSortType("desc")}
                        >
                            {t("price_high_low")}
                        </button>

                        <button
                            className={sortType === "asc" ? "active" : ""}
                            onClick={() => setSortType("asc")}
                        >
                            {t("price_low_high")}
                        </button>
                    </div>

                    {/* FILTER UI */}
                    <div className="filter_select">
                        <div>
                            <span>{t("price_range")}:</span>
                            <select>
                                <option>{t("select")}</option>
                                <option>{t("under_5m")}</option>
                                <option>{t("from_5_10m")}</option>
                            </select>
                        </div>

                        <div>
                            <span>{t("origin")}:</span>
                            <select>
                                <option>{t("select")}</option>
                                <option>{t("vietnam")}</option>
                                <option>{t("japan")}</option>
                            </select>
                        </div>
                    </div>

                </div>

                {/* PRODUCT LIST */}
                <div className="all_product">

                    {sortedProducts.map((item) => {

                        const salePrice =
                            item.salePrice ??
                            item.price - (item.price * item.discount) / 100;

                        return (
                            <div
                                key={item.id}
                                className="product_card"
                                onClick={() => navigate(`/product-detail/${item.id}`)}
                            >

                                <div className="card_image">
                                    <img src={item.img || "/no-image.png"} />
                                </div>

                                <div className="card_title">
                                    <h4>{item.name}</h4>
                                </div>

                                <p className="card_price_show">
                                    {salePrice.toLocaleString()} đ
                                </p>

                                <div className="card_price_discount">
                                    <p className="card_price_through">
                                        {item.price.toLocaleString()} đ
                                    </p>
                                    <p>-{item.discount}%</p>
                                </div>

                                <div className="card_bottom">
                                    <div className="card_vote">
                                        ⭐ ({item.quantitySold})
                                    </div>

                                    <div className="card_add_cart">
                                        🛒
                                    </div>
                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>
        </div>
    );
};

export default AllProductPage;