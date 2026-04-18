// Payment.jsx - Cập nhật import và thêm icon cho tất cả các phần
import React, { useState, useEffect } from "react";
import "./Payment.css";
import { useTranslation } from "react-i18next";
import authApi from "../../../api/Auth/Auth_Api";
import { useNavigate } from "react-router-dom";

import {
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle,
  ArrowLeft,
  Building2,
  Landmark,
  User,
  Phone,
  MapPin,
  FileText,
  Package,
  ShoppingBag,
  Wallet,
  Banknote,
  Zap
} from "lucide-react";

const Payment = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Thanh toán đơn hàng";
  }, [t]);

  // Lấy dữ liệu từ localStorage (được truyền từ Checkout)
  const [orderData, setOrderData] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");


  useEffect(() => {
    const storedOrder = localStorage.getItem("pendingOrder");
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    } else {
      window.location.href = "/checkout";
    }
  }, []);

  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      icon: <Truck size={24} />,
      description: "Thanh toán bằng tiền mặt khi nhận hàng",
      color: "#10b981",
      bgColor: "#d1fae5"
    },
    {
      id: "vnpay",
      name: "Thanh toán qua VNPAY",
      icon: <Building2 size={24} />,
      description: "Thanh toán qua thẻ ATM, Visa, Mastercard",
      color: "#005ba1",
      bgColor: "#dbeafe"
    },
    {
      id: "momo",
      name: "Thanh toán qua MoMo",
      icon: <Smartphone size={24} />,
      description: "Thanh toán qua ví điện tử MoMo",
      color: "#af2c8c",
      bgColor: "#fce7f3"
    }
  ];

  const handlePayment = async () => {
    try {
      setIsProcessing(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      //chặn lỗi luôn tại frontend
      if (!user?.id) {
        alert("Bạn chưa đăng nhập!");
        return;
      }

      // =============================
      // CREATE ORDER
      // =============================
      const orderPayload = {
        userId: user.id,
        note: orderData.formData?.note || "",
        paymentMethod: selectedPayment.toUpperCase(),
        totalAmount: orderData.total,
        items: orderData.cart.map((item: any) => ({
          foodId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      console.log("ORDER PAYLOAD:", orderPayload);

      const orderRes = await authApi.createOrder(orderPayload);
      const orderId = orderRes.data.orderId;

      // =============================
      // PAYMENT HANDLE
      // =============================

      // COD
      if (selectedPayment === "cod") {
        setPaymentSuccess(true);
        setTimeout(() => {
          window.location.href = `/order-success?orderId=${orderId}&method=COD`;
        }, 1000);

        return;
      }

      // VNPAY
      if (selectedPayment === "vnpay") {
        const res = await authApi.createVNPay(orderId, orderData.total);
        // Chuyển sang trang thanh toán VNPAY
        window.location.href = res.data.paymentUrl;
        return;
      }

      // MOMO
      if (selectedPayment === "momo") {
        const res = await authApi.createMomo(orderId, orderData.total);
        // Chuyển sang trang thanh toán MoMo
        window.location.href = res.data.paymentUrl;
        return;
      }

    } catch (err) {
      console.error("PAYMENT ERROR:", err);
      alert("Thanh toán thất bại!");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    window.location.href = "/checkout";
  };

  if (!orderData) {
    return (
      <div className="payment_loading">
        <div className="loading_spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }


  // Payment.jsx - Phần return với đầy đủ icon
  return (
    <div className="payment_page">
      {/* Breadcrumb */}
      <div className="payment_breadcrumb">
        <span onClick={() => navigate("/")}>Trang chủ</span>
        <span className="slash">/</span>
        <span onClick={() => navigate("/cart")}>Giỏ hàng</span>
        <span className="slash">/</span>
        <span onClick={() => navigate("/check-out")}>Thông tin đơn hàng</span>
        <span className="slash">/</span>
        <span>Thanh toán</span>
      </div>

      <div className="payment_container">
        {/* LEFT - Thông tin nhận hàng & Sản phẩm */}
        <div className="payment_left">
          {/* Recipient Info */}
          <div className="info_card">
            <h3>
              <User size={20} className="card_header_icon" />
              Thông tin nhận hàng
            </h3>
            <div className="recipient_info">
              <div className="info_row">
                <span className="info_label">Họ tên:</span>
                <span className="info_value">{orderData.userData?.fullName}</span>
              </div>
              <div className="info_row">
                <span className="info_label">Số điện thoại:</span>
                <span className="info_value">{orderData.userData?.phone}</span>
              </div>
              <div className="info_row">
                <span className="info_label">Địa chỉ:</span>
                <span className="info_value">{orderData.userData?.address}</span>
              </div>
              {orderData.formData?.note && (
                <div className="info_row">
                  <span className="info_label">Ghi chú:</span>
                  <span className="info_value note">{orderData.formData.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items - Đã thêm icon */}
          <div className="info_card">
            <h3>
              <Package size={20} className="card_header_icon" />
              Sản phẩm đã chọn ({orderData.cart?.length})
            </h3>
            <div className="order_items_list">
              {orderData.cart?.map((item: any) => (
                <div key={item.id} className="payment_order_item">
                  <img src={item.img} alt={item.name} className="item_img" />
                  <div className="item_details">
                    <p className="item_name">{item.name}</p>
                    <p className="item_quantity">
                      Số lượng: {item.quantity}
                    </p>
                  </div>
                  <div className="item_price">
                    {(item.price * item.quantity).toLocaleString()} đ
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT - Order Summary & Payment Methods */}
        <div className="payment_right">
          {/* Order Summary - Đã thêm icon */}
          <div className="summary_card">
            <h3>
              <Wallet size={20} className="card_header_icon" />
              Tổng kết đơn hàng
            </h3>

            <div className="summary_details">
              <div className="summary_row">
                <span>
                  Tạm tính
                </span>
                <span>{orderData.subtotal?.toLocaleString()} đ</span>
              </div>
              <div className="summary_row">
                <span>
                  Phí vận chuyển
                </span>
                <span>{orderData.shippingFee?.toLocaleString()} đ</span>
              </div>
              {orderData.discount > 0 && (
                <div className="summary_row discount">
                  <span>
                    Giảm giá
                  </span>
                  <span>- {orderData.discount.toLocaleString()} đ</span>
                </div>
              )}
              <div className="summary_divider"></div>
              <div className="summary_row total">
                <span>
                  <Banknote size={16} className="summary_icon_total" />
                  Tổng thanh toán
                </span>
                <span className="total_price">{orderData.total?.toLocaleString()} đ</span>
              </div>
            </div>

            {/* Applied Vouchers */}
            {(orderData.shippingVoucher || orderData.orderVoucher) && (
              <div className="applied_vouchers">
                <div className="vouchers_title">
                  <Zap size={14} />
                  Mã giảm giá đã áp dụng:
                </div>
                {orderData.shippingVoucher && (
                  <div className="voucher_badge shipping_badge">
                    <Truck size={12} />
                    <span>{orderData.shippingVoucher.code}</span>
                  </div>
                )}
                {orderData.orderVoucher && (
                  <div className="voucher_badge order_badge">
                    <Landmark size={12} />
                    <span>{orderData.orderVoucher.code}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Methods - Đã thêm icon */}
          <div className="payment_methods_card">
            <h3>
              <CreditCard size={20} className="card_header_icon" />
              Phương thức thanh toán
            </h3>
            <div className="payment_methods_list">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`payment_method_item ${selectedPayment === method.id ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  />
                  <div className="method_icon">{method.icon}</div>
                  <div className="method_info">
                    <div className="method_name">{method.name}</div>
                    <div className="method_description">{method.description}</div>
                  </div>
                  {selectedPayment === method.id && (
                    <div className="check_icon">
                      <CheckCircle size={18} />
                    </div>
                  )}
                </label>
              ))}
            </div>

            <button
              className="payment_btn"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="btn_spinner"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CreditCard size={18} />
                  Xác nhận thanh toán
                </>
              )}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;