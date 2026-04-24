import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import { Category } from "../../../model/Category";
import { Product } from "../../../model/Product";
import slide1 from "../../../assets/images/slide_3_img.jpeg";
import slide4 from "../../../assets/images/slide_1_img.jpeg";
import authApi from "../../../api/Auth/Auth_Api";
import { useCart } from "../CartContext";
import { useNavigate } from "react-router-dom";
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const Home = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = t("home_title");
  }, [t]);

  const slides = [
    slide1,
    "https://theme.hstatic.net/200000796751/1001266995/14/slide_3_img.jpg?v=69",
    "https://theme.hstatic.net/200000796751/1001266995/14/slide_2_img.jpg?v=66",
    slide4
  ];

  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { addToCart } = useCart();
  const [openChat, setOpenChat] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [input, setInput] = useState("");
  const [recommendedFoods, setRecommendedFoods] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [productsSale, setProductsSale] = useState<Product[]>([]);
  const [productsSelling, setProductsSelling] = useState<Product[]>([]);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getSalePrice = (price: number = 0, discount: number = 0) => {
    return price - (price * discount) / 100;
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await authApi.getAll();
        setCategories(res.data);
      } catch (error) {
        console.error("Lỗi load category:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const res = await authApi.flashSale();
        setProductsSale(res.data);
      } catch (error) {
        console.error("Lỗi load flash sale:", error);
      }
    };
    fetchFlashSale();
  }, []);

  useEffect(() => {
    const fetchTopSelling = async () => {
      try {
        const res = await authApi.topselling();
        setProductsSelling(res.data);
      } catch (error) {
        console.error("Lỗi load top selling:", error);
      }
    };
    fetchTopSelling();
  }, []);
  // Gợi ý sp
  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const userId = storedUser.id;
        const res = await authApi.getRecommendedFoods(userId, 8);
        setRecommendedFoods(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecommended();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // chat bot
  const sendMessage = async () => {
    if (!input.trim() && !image && !selectedFile) return;

    const text = input;

    let newMessage: any = { type: "user" };

    if (text.trim()) {
      newMessage.text = text;
    }

    if (image) {
      newMessage.image = image;
    }

    setMessages(prev => [...prev, newMessage]);

    setInput("");

    const currentFile = selectedFile;

    setImage(null);
    setSelectedFile(null);

    try {
      if (currentFile) {
        const res = await authApi.searchImage(currentFile);

        console.log("API searchImage response:", res.data);

        const products = res.data || [];

        let botText = "";

        if (products.length > 0) {
          botText = "Mình tìm thấy được một số sản phẩm tương tự nè:";
        } else {
          botText = "Không tìm thấy sản phẩm phù hợp. Vui lòng thử ảnh khác.";
        }

        if (text.trim()) {
          botText = `"${text.trim()}"\n\n${botText}`;
        }

        setMessages(prev => [
          ...prev,
          {
            type: "bot",
            text: botText,
            products
          }
        ]);

        return;
      }

if (text.trim()) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const res = await authApi.chatbot(text, user.id || 0);

  const data = res.data;

  setMessages(prev => [
    ...prev,
    {
      type: "bot",
      text: data.reply || "Mình chưa hiểu rõ câu hỏi, bạn thử nói rõ hơn nhé 😊",
      product: data.product
    }
  ]);
}

    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        { type: "bot", text: "Có lỗi xảy ra. Vui lòng thử lại." }
      ]);
    }
  };


  useEffect(() => {
    if (openChat && messages.length === 0) {
      setMessages([
        {
          type: "bot",
          text: "Xin chào 👋 mình có thể giúp bạn tìm kiếm sản phẩm và kiểm tra đơn hàng !"
        }
      ]);
    }
  }, [openChat]);

  if (!show) return null;

  return (
    <>
      <div className="home">

        <div className="slider_wrapper">

          <div
            className="slides"
            style={{
              transform: `translateX(-${index * 100}%)`
            }}
          >
            {slides.map((img, i) => (
              <img key={i} src={img} className="slide" />
            ))}
          </div>

          <div
            className="close-slide"
            onClick={() => setShow(false)}
          >
            ✕
          </div>

        </div>

        {/* CATEGORY */}
        <div className="block_category">

          <div className="category_img left_bell">
            <img src="https://cdnv2.tgdd.vn/webmwg/2024/ContentMwg/images/noel/2024/dmx/icon-promo-l.png" />
          </div>

          {categories.map((item) => (
            <div
              key={item.id}
              className="category_item"
              onClick={() => navigate(`/all-product/${item.id}`)}
            >
              <img src={item.img || "https://via.placeholder.com/150"} />
              <p>{item.categoryName || t("no_name")}</p>
            </div>
          ))}

          <div className="category_img right_bell">
            <img src="https://cdnv2.tgdd.vn/webmwg/2024/ContentMwg/images/noel/2024/dmx/icon-promo-r.png" />
          </div>

        </div>

        {/* FLASH SALE */}
        <div className="block_sale">

          <div className="sale_title">
            <img
              src="https://cdn2.cellphones.com.vn/x/media/catalog/product/b/f/bf2024__title_flashsale.png"
              alt="flashsale"
            />
          </div>

          <div className="product_list">
            {productsSale.map((item) => {
              const salePrice = getSalePrice(item.price ?? 0, item.discount ?? 0);
              return (
                <div
                  key={item.id}
                  className="product_card"
                  onClick={() => navigate(`/product-detail/${item.id}`)}
                >
                  <div className="card_image">
                    <img src={item.img} alt="product" />
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

                    <div
                      className="card_add_cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: salePrice,
                          img: item.img || "https://via.placeholder.com/150",
                        });
                        toast.success(t("add_cart_success"));
                      }}
                    >
                      🛒
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommended - Chỉnh sửa lại title */}
          <div className="recommended_section">
            <div className="recommended_title">
              <div className="recommended_icon">
                <img
                  src="https://cdn2.cellphones.com.vn/x/media/wysiwyg/empty230625.png"
                  alt="best sale" />
              </div>
              <h2>{t("recommended_products")}</h2>
            </div>

            <div className="product_list">
              {recommendedFoods.map((item) => {
                const salePrice = getSalePrice(item.price ?? 0, item.discount ?? 0);
                return (
                  <div
                    key={item.id}
                    className="product_card"
                    onClick={() => navigate(`/product-detail/${item.id}`)}
                  >
                    <div className="card_image">
                      <img src={item.img} alt="product" />
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

                      <div
                        className="card_add_cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart({
                            id: item.id,
                            name: item.name,
                            price: salePrice,
                            img: item.img || "https://via.placeholder.com/150",
                          });
                          toast.success(t("add_cart_success"));
                        }}
                      >
                        🛒
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BEST SELLING */}
        <div className="block_best_sale">

          <div className="best_sale_title">

            <img
              src="https://cdni.dienthoaivui.com.vn/x,webp,q100/https://dashboard.dienthoaivui.com.vn/uploads/dashboard/ant_mascot/Bundle_Gift.png"
              alt="best sale"
            />

            <h2>{t("best_selling_titile")}</h2>

          </div>

          <div className="product_list">

            {productsSelling.map((item) => {
              const salePrice = getSalePrice(item.price ?? 0, item.discount ?? 0);
              return (
                <div
                  key={item.id}
                  className="product_card"
                  onClick={() => navigate(`/product-detail/${item.id}`)}
                >
                  <div className="card_image">
                    <img src={item.img} alt="product" />
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

                    <div
                      className="card_add_cart"
                      onClick={(e) => {
                        e.stopPropagation();

                        addToCart({
                          id: item.id,
                          name: item.name,
                          price: salePrice,
                          img: item.img || "https://via.placeholder.com/150",
                        });
                        toast.success(t("add_cart_success"));
                      }}
                    >
                      🛒
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* NEWS */}
        <div className="news_section">

          <div className="news_header">
            <img
              src="https://cdn-static.sforum.vn/sforum/_next/static/media/empty.f0464f7d.png"
              alt="new"
            />
            <h2>{t("news")}</h2>
          </div>

          <div className="news_cards">

            <a className="news_card">
              <div className="news_image">
                <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb" />
              </div>
              <p className="news_title">{t("news_1")}</p>
            </a>

            <a className="news_card">
              <div className="news_image">
                <img src="https://images.unsplash.com/photo-1492724441997-5dc865305da7" />
              </div>
              <p className="news_title">{t("news_2")}</p>
            </a>

            <a className="news_card" href="/news">
              <div className="news_image">
                <img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee" />
              </div>
              <p className="news_title">{t("news_3")}</p>
            </a>

          </div>

          <div className="view_more">
            <a href="/news">
              {t("view_more_news")} <span>›</span>
            </a>
          </div>

        </div>

        <div className="scroll_top" onClick={scrollToTop}>
          <ArrowUp size={22} />
        </div>
        {/* CHATBOT BUTTON */}
        <div
          className="chatbot_button"
          onClick={() => setOpenChat(!openChat)}
        >
          💬
        </div>

        {/* CHATBOX */}
        {openChat && (
          <div className={`chatbox ${darkMode ? "dark" : ""}`}>

            <div className="chatbox_header">
              <span>Chat Bot</span>
              <div className="actions">
                <button onClick={() => setDarkMode(!darkMode)}>
                  {darkMode ? "☀️" : "🌙"}
                </button>
                <button onClick={() => setOpenChat(false)}>✕</button>
              </div>
            </div>

            <div className="chatbox_body">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>

                  {/* TEXT */}
                  {msg.text && <div className="text">{msg.text}</div>}
                  {msg.image && (
                    <img src={msg.image} className="chat_image" />
                  )}

                  {/* PRODUCT CARD */}
                  {msg.product && (
                    <div
                      className="chat_product"
                      onClick={() => navigate(`/product-detail/${msg.product.id}`)}
                    >
                      <img src={msg.product.img} />
                      <div>
                        <p className="name">{msg.product.name}</p>
                        <p className="price">
                          {msg.product.price?.toLocaleString()} đ
                        </p>
                      </div>
                    </div>
                  )}
                  {/* MULTIPLE PRODUCTS FROM IMAGE */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="chat_products_list">
                      {msg.products.map((p: Product) => (
                        <div key={p.id} className="chat_product" onClick={() => navigate(`/product-detail/${p.id}`)}>
                          <img src={p.img} />
                          <div>
                            <p className="name">{p.name}</p>
                            <p className="price">{p.price?.toLocaleString()} đ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))}
            </div>
            <div className="chatbox_input">

              {/* PREVIEW IMAGE */}
              {image && (
                <div className="preview_image">
                  <img src={image} alt="preview" />

                  {/* NÚT XOÁ */}
                  <span
                    className="remove_image"
                    onClick={() => setImage(null)}
                  >
                    ✕
                  </span>
                </div>
              )}

              {/* INPUT FILE ẨN */}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file); 

                    const reader = new FileReader();
                    reader.onload = () => {
                      setImage(reader.result as string); 
                    };
                    reader.readAsDataURL(file);
                  }

                  e.target.value = ""; 
                }}
              />

              {/* Ô NHẬP TEXT */}
              <button
                className="btn_image"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon size={20} />
              </button>

              {/* INPUT */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Nhập tin nhắn..."
              />

              {/* NÚT GỬI */}
              <button className="btn_send" onClick={sendMessage}>
                ➤
              </button>

            </div>

          </div>
        )}

      </div>
    </>
  );
};

export default Home;