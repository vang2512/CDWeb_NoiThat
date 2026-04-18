import React, { useEffect, useState } from "react";
import "./Cart.css";
import { useCart } from "../CartContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Cart = () => {

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity } = useCart();

  const [checkedItems, setCheckedItems] = useState<number[]>([]);

  const toggleCheck = (id: number) => {
    setCheckedItems((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (checkedItems.length === cart.length) {
      setCheckedItems([]);
    } else {
      setCheckedItems(cart.map((item) => item.id));
    }
  };

  const total = cart
    .filter((item) => checkedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    document.title = t("cart");
  }, [t]);

  // Chuyển trang thông tin đơn hàng
  const handleCheckout = () => {
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  if (!storedUser || !storedUser.id) {
    toast.error("Vui lòng đăng nhập trước khi đặt hàng!");
    navigate("/login"); 
    return;
  }

  // Lấy các sản phẩm đã chọn
  const selectedProducts = cart.filter(item => checkedItems.includes(item.id));

  if (selectedProducts.length === 0) {
    alert("Vui lòng chọn ít nhất một sản phẩm để đặt hàng!");
    return;
  }

  // Lưu tạm vào localStorage để chuyển qua trang Checkout
  localStorage.setItem("pendingOrder", JSON.stringify(selectedProducts));
  navigate("/check-out");
};

  return (
    <div className="cart_page">

      <div className="breadcrumb">
        <span onClick={() => navigate("/")}>{t("home")}</span>
        <span className="slash">/</span>
        <span>{t("cart")}</span>
      </div>

      <div className="cart_container">

        {/* LEFT */}
        <div className="cart_left">

          <h2>{t("your_cart")}</h2>

          <p className="cart_count">
            {t("cart_count", { count: cart.length })}
          </p>

          {/* select all */}
          {cart.length > 0 && (
            <div className="select_all">
              <input
                type="checkbox"
                checked={checkedItems.length === cart.length}
                onChange={toggleSelectAll}
              />
              <label>{t("select_all")}</label>
            </div>
          )}

          {cart.map((item) => (
            <div key={item.id} className="cart_item">

              <input
                type="checkbox"
                checked={checkedItems.includes(item.id)}
                onChange={() => toggleCheck(item.id)}
              />

              <img src={item.img} alt={item.name} className="cart_img" />

              <div className="cart_info">
                <p className="cart_name">{item.name}</p>
                <p className="cart_price">
                  {(item.price * item.quantity).toLocaleString()} đ
                </p>
              </div>

              <div className="cart_quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>

              <p
                className="cart_delete"
                onClick={() => removeFromCart(item.id)}
              >
                {t("delete")}
              </p>

            </div>
          ))}

        </div>

        {/* RIGHT */}
        <div className="cart_right">

          <h2>{t("order_info")}</h2>

          <div className="order_total">
            <span>{t("total")}:</span>
            <span className="price">{total.toLocaleString()} đ</span>
          </div>

          <p className="note">
            {t("shipping_note")}
          </p>

          <button
            className="checkout_btn"
            style={{
              background: checkedItems.length > 0 ? "#eb6e07" : "#ccc",
              cursor: checkedItems.length > 0 ? "pointer" : "not-allowed",
            }}
            disabled={checkedItems.length === 0}
            onClick={handleCheckout}
          >
            {t("checkout")}
          </button>

        </div>

      </div>
    </div>
  );
};

export default Cart;