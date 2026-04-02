import React, { useEffect, useState } from "react";
import "./ProductDetail.css";
import { useNavigate, useParams } from "react-router-dom";
import authApi from "../../../api/Auth/Auth_Api";
import { ProductDetails, ProductSpecification, SubImage } from "../../../model/ProductDetail";
import { useCart } from "../CartContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
    Star,
    Ruler,
    ChevronLeft,
    ChevronRight,
    ShoppingCart,
    Phone,
    Store
} from "lucide-react";

const ProductDetail = () => {


    const { t } = useTranslation();

    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<ProductDetails | null>(null);
    const [images, setImages] = useState<string[]>([]);
    const [spec, setSpec] = useState<ProductSpecification | null>(null);

    const [imgIndex, setImgIndex] = useState(0);
    const [tab, setTab] = useState("spec");
    useEffect(() => {
        document.title = t("product_detail");
    }, [t]);
    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                const res = await authApi.getDetail(id);

                const data: ProductDetails = res.data;

                setProduct(data);

                if (data.subImages && data.subImages.length > 0) {
                    setImages([
                        data.img,
                        ...data.subImages.map((i: SubImage) => i.image)
                    ]);
                } else {
                    setImages([data.img]);
                }

                setSpec(data.specification || null);

            } catch (error) {
                console.error("Lỗi load detail:", error);
            }
        };

        if (id) fetchProductDetail();
    }, [id]);

    useEffect(() => {
        setImgIndex(0);
    }, [images]);

    if (!product) return <p>{t("loading")}</p>;

    const salePrice =
        product.price - (product.price * product.discount) / 100;

    const nextImg = () => {
        setImgIndex((imgIndex + 1) % images.length);
    };

    const prevImg = () => {
        setImgIndex((imgIndex - 1 + images.length) % images.length);
    };


    return (
        <div className="product_page">

            <div className="container">

                {/* breadcrumb */}
                <div className="breadcrumb">
                    <span onClick={() => navigate("/")}>{t("home")}</span>
                    <span className="slash">/</span>
                    <span>{t("product_detail")}</span>
                </div>

                {/* title */}
                <h1 className="product_title">{product.name}</h1>

                <div className="product_rating">
                    <p>{t("sold")}: {product.quantitySold}</p>

                    <div className="rating">
                        <Star size={16} />4.5
                    </div>

                    <div className="spec_link">
                        <Ruler size={16} />
                        {t("spec")}
                    </div>
                </div>

                <div className="product_main">

                    {/* LEFT */}
                    <div className="product_left">

                        <div className="gallery">

                            <div className="gallery_main">

                                <button className="arrow left" onClick={prevImg}>
                                    <ChevronLeft />
                                </button>

                                <img src={images[imgIndex]} alt="" />

                                <button className="arrow right" onClick={nextImg}>
                                    <ChevronRight />
                                </button>

                            </div>

                            <div className="gallery_list">

                                {images.map((img, i) => (
                                    <img
                                        key={i}
                                        src={img}
                                        className={imgIndex === i ? "active" : ""}
                                        onClick={() => setImgIndex(i)}
                                    />
                                ))}

                            </div>

                        </div>

                        {/* policy */}
                        <div className="policy">
                            <h3>{t("commit")}</h3>

                            <div className="policy_item">
                                <p>✔ {t("policy_1")}</p>
                            </div>

                            <div className="policy_item">
                                <p>✔ {t("policy_2")}</p>
                            </div>

                            <div className="policy_item">
                                <p>✔ {t("policy_3")}</p>
                            </div>
                        </div>

                        {/* tabs */}
                        <div className="product_tabs">

                            <div className="tab_header">

                                <button
                                    className={tab === "spec" ? "active" : ""}
                                    onClick={() => setTab("spec")}
                                >
                                    {t("spec_detail")}
                                </button>

                                <button
                                    onClick={() => navigate(`/product-review/${product.id}`)}
                                >
                                    {t("review")}
                                </button>

                            </div>

                            <div className="tab_content">

                                {tab === "spec" && spec && (

                                    <ul className="spec_list">

                                        <li>
                                            <span>{t("dimension")}</span>
                                            <p>{spec.dimensions}</p>
                                        </li>

                                        <li>
                                            <span>{t("material")}</span>
                                            <p>{spec.material}</p>
                                        </li>

                                        <li>
                                            <span>{t("origin")}</span>
                                            <p>{spec.origin}</p>
                                        </li>

                                        <li>
                                            <span>{t("standard")}</span>
                                            <p>{spec.standard}</p>
                                        </li>

                                    </ul>

                                )}

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}
                    <div className="product_right">

                        <a
                            className="banner_sale"
                            href="https://zalo.me/0327237467"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <img src="https://cdnv2.tgdd.vn/mwg-static/dmx/Banner/79/61/796197adf9f0c2d5cadb6a2c2679358a.png" />
                        </a>

                        <div className="price_block">

                            <p className="price_new">
                                {salePrice.toLocaleString()} đ
                            </p>

                            <p className="price_old">
                                {product.price.toLocaleString()} đ
                            </p>

                            <p className="price_discount">
                                -{product.discount}%
                            </p>

                        </div>

                        <div className="promotion">
                            <h4>{t("promotion")}</h4>
                            <ul>
                                <li>{t("promo_1")}</li>
                                <li>{t("promo_2")}</li>
                            </ul>
                        </div>

                        <div className="buy_block">

                            <button className="add_cart" onClick={(e) => {
                                e.stopPropagation();

                                addToCart({
                                    id: product.id,
                                    name: product.name,
                                    price: salePrice,
                                    img: product.img || "https://via.placeholder.com/150",
                                });
                                toast.success(t("add_cart_success"));
                            }}>
                                <ShoppingCart size={18} />
                                {t("add_to_cart")}
                            </button>

                            <button className="buy_now">
                                {t("buy_now")}
                            </button>

                        </div>

                        <div className="contact">
                            <Phone size={16} />
                            <a href="tel:0869380448">0869 380 448</a>
                        </div>

                        <div className="store">
                            <Store size={16} />
                            <a href="#">{t("view_store")}</a>
                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default ProductDetail;