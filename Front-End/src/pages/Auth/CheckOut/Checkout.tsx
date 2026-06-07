import React, { useState, useEffect } from "react";
import "./Checkout.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import GoogleMapPicker from "../GoogleMapPicker";
import authApi from "../../../api/Auth/Auth_Api";
import { Truck, Percent, Tag, ChevronDown, ChevronUp, X, MapPin, Phone, User, FileText, ShoppingBag, CreditCard, ShieldCheck } from "lucide-react";
import { CartProduct } from "../../../model/CartProduct";
import { Voucher } from "../../../model/Voucher";
import toast from "react-hot-toast";

const Checkout = () => {

  const { t } = useTranslation();
  // Set tiêu đề trang
  useEffect(() => {
    document.title = "Thông tin đơn hàng";
  }, [t]);
  
  const navigate = useNavigate();

  // Lấy sản phẩm đã chọn từ Cart
  const storedCart: CartProduct[] = JSON.parse(
    localStorage.getItem("checkoutCart") || "[]"
  );
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [cart] = useState<CartProduct[]>(storedCart);
  const [userData, setUserData] = useState<any>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  const [formData, setFormData] = useState<any>({
    note: "",
  });
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedShippingVoucher, setSelectedShippingVoucher] = useState<Voucher | null>(null);
  const [selectedOrderVoucher, setSelectedOrderVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState("");
  const [isVoucherOpen, setIsVoucherOpen] = useState(false);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 30000;

  // Fetch thông tin user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await authApi.getUser(storedUser.id);
        if (res.data) {
          setUserData(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, []);

  // Hàm load voucher 
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await authApi.getAvailable();
        setVouchers(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const checkUser = async () => {
      try {
        const res = await authApi.checkNewUser(storedUser.id);
        setIsNewUser(res.data.isNewUser);
      } catch (err) {
        console.error(err);
      }
    };

    fetchVouchers();
    checkUser();
  }, []);

  const shippingVouchers = vouchers.filter((v) => {
    const isFreeShipCode = v.code?.toUpperCase().includes("FREESHIP");
    if (v.discountType === "FREE") {
      return isNewUser;
    }
    if (isFreeShipCode && (v.discountType === "FIXED" || v.discountType === "PERCENT")) {
      return true;
    }
    return false;
  });

  const orderVouchers = vouchers.filter((v) => {
    const isFreeShipCode = v.code?.trim().toUpperCase().includes("FREESHIP");
    return !isFreeShipCode;
  });

  // Handle input form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (["fullName", "phone", "address"].includes(name)) {
      setUserData((prev: any) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Áp dụng voucher
  const applyVoucher = (voucher: Voucher) => {
    const isFreeShipCode = voucher.code?.trim().toUpperCase().includes("FREESHIP");

    if (isFreeShipCode) {
      setSelectedShippingVoucher(voucher);
      setVoucherError("");
      setIsVoucherOpen(false);
      return;
    }

    if (voucher.minOrderValue && subtotal < voucher.minOrderValue) {
      setVoucherError(
        `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`
      );
      return;
    }

    setSelectedOrderVoucher(voucher);
    setVoucherError("");
    setIsVoucherOpen(false);
  };
  
  const calculateDiscount = (): number => {
    let totalDiscount = 0;

    // 🚚 SHIPPING
    if (selectedShippingVoucher) {
      if (selectedShippingVoucher.discountType === "FREE") {
        totalDiscount += shippingFee;
      }

      if (selectedShippingVoucher.discountType === "FIXED") {
        totalDiscount += Number(selectedShippingVoucher.discountValue || 0);
      }

      if (selectedShippingVoucher.discountType === "PERCENT") {
        let percent =
          (shippingFee * Number(selectedShippingVoucher.discountValue || 0)) / 100;

        totalDiscount += percent;
      }
    }

    // ORDER
    if (selectedOrderVoucher) {
      if (selectedOrderVoucher.discountType === "FIXED") {
        totalDiscount += Number(selectedOrderVoucher.discountValue || 0);
      }

      if (selectedOrderVoucher.discountType === "PERCENT") {
        let percent =
          (subtotal * Number(selectedOrderVoucher.discountValue || 0)) / 100;

        percent = Math.min(percent, 50000);

        totalDiscount += percent;
      }
    }

    return totalDiscount;
  };

  const discount: number = calculateDiscount(); 
  const total = subtotal + shippingFee - discount;

  // Xóa voucher đã chọn
  const removeShippingVoucher = () => {
    setSelectedShippingVoucher(null);
  };

  const removeOrderVoucher = () => {
    setSelectedOrderVoucher(null);
  };

  const removeAllVoucher = () => {
    setSelectedShippingVoucher(null);
    setSelectedOrderVoucher(null);
    setVoucherError("");
  };

  // Handle submit
  const handleSubmit = () => {
    if (!userData.fullName?.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!userData.phone?.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }
    if (!userData.address?.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return;
    }

    const orderData = {
      userData: {
        fullName: userData.fullName,
        phone: userData.phone,
        address: userData.address,
      },
      formData: {
        note: formData.note,
      },
      cart: cart,
      subtotal: subtotal,
      shippingFee: shippingFee,
      discount: discount,
      total: total,
      shippingVoucher: selectedShippingVoucher,
      orderVoucher: selectedOrderVoucher,
    };

    localStorage.setItem("pendingOrder", JSON.stringify(orderData));
    navigate("/payment");
  };

  return (
    <div className="checkout_page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <span onClick={() => navigate("/")}>Trang chủ</span>
        <span className="slash">/</span>
        <span onClick={() => navigate("/cart")}>Giỏ hàng</span>
        <span className="slash">/</span>
        <span>Thông tin đơn hàng</span>
      </div>

      <div className="checkout_container">
        {/* LEFT - Thông tin nhận hàng */}
        <div className="checkout_left">
          <div className="section_header">
            <User size={22} />
            <h2>Thông tin nhận hàng</h2>
          </div>
          
          <form className="info_form">
            <div className="form_group">
              <label>
                Họ và tên <span className="required">*</span>
              </label>
              <div className="input_wrapper">
                <User size={18} className="input_icon" />
                <input
                  type="text"
                  name="fullName"
                  value={userData.fullName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ và tên"
                />
              </div>
            </div>

            <div className="form_group">
              <label>
                Số điện thoại <span className="required">*</span>
              </label>
              <div className="input_wrapper">
                <Phone size={18} className="input_icon" />
                <input
                  type="tel"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                />
              </div>
            </div>

            <div className="form_group">
              <label>
                Địa chỉ <span className="required">*</span>
              </label>
              <div className="input_wrapper">
                <MapPin size={18} className="input_icon" />
                <input
                  type="text"
                  name="address"
                  value={userData.address}
                  onChange={handleInputChange}
                  placeholder="Nhập địa chỉ"
                />
              </div>
            </div>

            <div className="map_container">
              <label>Chọn vị trí trên bản đồ</label>
              <div className="google_map">
                <GoogleMapPicker/>
              </div>
              <p className="map_note">
                Vui lòng chọn vị trí chính xác để giao hàng nhanh hơn
              </p>
            </div>

            <div className="form_group">
              <label>Ghi chú đơn hàng</label>
              <div className="input_wrapper textarea_wrapper">
                <FileText size={18} className="input_icon" />
                <textarea
                  name="note"
                  rows={3}
                  value={formData.note}
                  onChange={handleInputChange}
                  placeholder="Nhập ghi chú (nếu có)"
                />
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT - Đơn hàng của bạn */}
        <div className="checkout_right">
          <div className="section_header">
            <ShoppingBag size={22} />
            <h2>Đơn hàng của bạn</h2>
          </div>

          <div className="order_items">
            {cart.map((item) => (
              <div key={item.id} className="order_item">
                <img src={item.img} alt={item.name} className="item_img" />
                <div className="item_info">
                  <p className="item_name">{item.name}</p>
                  <p className="item_quantity">Số lượng: {item.quantity}</p>
                </div>
                <p className="item_price">
                  {(item.price * item.quantity).toLocaleString()} đ
                </p>
              </div>
            ))}
          </div>

          {/* VOUCHER SECTION */}
          <div className="voucher_section">
            <div className="voucher_header">
              <div className="voucher_title_wrapper">
                <Tag size={18} />
                <h3>Mã giảm giá</h3>
              </div>

              {(selectedShippingVoucher || selectedOrderVoucher) && (
                <button className="remove_voucher_btn" onClick={removeAllVoucher}>
                  Xóa tất cả
                </button>
              )}
            </div>

            {voucherError && <p className="voucher_error">{voucherError}</p>}

            {/* Hiển thị voucher đã chọn */}
            {selectedShippingVoucher && (() => {
              let shippingDiscount = 0;

              if (selectedShippingVoucher.discountType === "FREE") {
                shippingDiscount = shippingFee;
              }

              if (selectedShippingVoucher.discountType === "FIXED") {
                shippingDiscount = Number(selectedShippingVoucher.discountValue || 0);
              }

              if (selectedShippingVoucher.discountType === "PERCENT") {
                shippingDiscount =
                  (shippingFee * Number(selectedShippingVoucher.discountValue || 0)) / 100;
              }

              return (
                <div className="selected_voucher shipping_selected">
                  <div className="selected_voucher_icon">
                    <Truck size={16} />
                  </div>
                  <div className="selected_voucher_info">
                    <span className="selected_voucher_code">
                      {selectedShippingVoucher.code}
                    </span>
                    <span className="selected_voucher_name">
                      {selectedShippingVoucher.discountType === "FREE" &&
                        "Miễn phí vận chuyển"}

                      {selectedShippingVoucher.discountType === "FIXED" &&
                        `Giảm ${selectedShippingVoucher.discountValue.toLocaleString()}đ phí vận chuyển`}

                      {selectedShippingVoucher.discountType === "PERCENT" &&
                        `Giảm ${selectedShippingVoucher.discountValue}% phí vận chuyển`}
                    </span>
                  </div>
                  <span className="selected_voucher_discount">
                    - {shippingDiscount.toLocaleString()}đ
                  </span>
                  <button className="remove_btn" onClick={removeShippingVoucher}>✕</button>
                </div>
              );
            })()}

            {selectedOrderVoucher && (() => {
              let orderDiscount = 0;

              if (selectedOrderVoucher.discountType === "FIXED") {
                orderDiscount = Number(selectedOrderVoucher.discountValue || 0);
              }

              if (selectedOrderVoucher.discountType === "PERCENT") {
                let percent =
                  (subtotal * Number(selectedOrderVoucher.discountValue || 0)) / 100;
                percent = Math.min(percent, 50000);
                orderDiscount = percent;
              }

              return (
                <div className="selected_voucher order_selected">
                  <div className="selected_voucher_icon">
                    <Percent size={16} />
                  </div>
                  <div className="selected_voucher_info">
                    <span className="selected_voucher_code">
                      {selectedOrderVoucher.code}
                    </span>
                    <span className="selected_voucher_name">
                      {selectedOrderVoucher.discountType === "FIXED" &&
                        `Giảm ${selectedOrderVoucher.discountValue.toLocaleString()}đ`}

                      {selectedOrderVoucher.discountType === "PERCENT" &&
                        `Giảm ${selectedOrderVoucher.discountValue}%`}
                    </span>
                  </div>
                  <span className="selected_voucher_discount">
                    - {orderDiscount.toLocaleString()}đ
                  </span>
                  <button className="remove_btn" onClick={removeOrderVoucher}>✕</button>
                </div>
              );
            })()}

            {/* Dropdown chọn voucher */}
            <div className="voucher_dropdown">
              <button
                className="voucher_dropdown_btn"
                onClick={() => setIsVoucherOpen(!isVoucherOpen)}
              >
                <span>Chọn mã giảm giá</span>
                {isVoucherOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {isVoucherOpen && (
                <div className="voucher_dropdown_content">
                  {/* SHIPPING VOUCHERS */}
                  {shippingVouchers.length > 0 && (
                    <div className="voucher_group">
                      <div className="voucher_group_title shipping_title">
                        <Truck size={14} />
                        <span>Miễn phí vận chuyển</span>
                      </div>

                      <div className="voucher_list">
                        {shippingVouchers.map((voucher) => {
                          const isActive = selectedShippingVoucher?.id === voucher.id;
                          return (
                            <div
                              key={voucher.id}
                              className={`voucher_card shipping_card ${isActive ? "active" : ""}`}
                              onClick={() => applyVoucher(voucher)}
                            >
                              <div className="voucher_card_content">
                                <div className="voucher_icon">
                                  <Truck size={24} color="#10b981" />
                                </div>
                                <div className="voucher_card_info">
                                  <div className="voucher_code shipping_code">
                                    {voucher.code}
                                  </div>
                                  <div className="voucher_name">
                                    {voucher.discountType === "FREE" && "Miễn phí vận chuyển"}
                                    {voucher.discountType === "FIXED" && `Giảm ${voucher.discountValue?.toLocaleString()}đ phí ship`}
                                    {voucher.discountType === "PERCENT" && `Giảm ${voucher.discountValue}% phí ship`}
                                  </div>
                                  <div className="voucher_desc">
                                    {voucher.minOrderValue
                                      ? `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString()}đ`
                                      : "Áp dụng cho mọi đơn hàng"}
                                  </div>
                                </div>
                                <div className="voucher_card_action">
                                  <button
                                    className={`apply_btn ${isActive ? "applied" : ""}`}
                                    disabled={isActive}
                                  >
                                    {isActive ? "Đã chọn" : "Chọn"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ORDER VOUCHERS */}
                  {orderVouchers.length > 0 && (
                    <div className="voucher_group">
                      <div className="voucher_group_title order_title">
                        <Percent size={14} />
                        <span>Giảm theo đơn hàng</span>
                      </div>

                      <div className="voucher_list">
                        {orderVouchers.map((voucher) => {
                          const isValid = !voucher.minOrderValue || subtotal >= voucher.minOrderValue;
                          const isActive = selectedOrderVoucher?.id === voucher.id;

                          return (
                            <div
                              key={voucher.id}
                              className={`voucher_card order_card ${isActive ? "active" : ""} ${!isValid ? "disabled" : ""}`}
                              onClick={() => isValid && applyVoucher(voucher)}
                            >
                              <div className="voucher_card_content">
                                <div className="voucher_icon">
                                  <Percent size={24} color={isValid ? "#ef4444" : "#9ca3af"} />
                                </div>
                                <div className="voucher_card_info">
                                  <div className={`voucher_code ${isValid ? "order_code" : "order_code_disabled"}`}>
                                    {voucher.code}
                                  </div>
                                  <div className="voucher_desc">
                                    {voucher.discountType === "FIXED" && `Giảm ${voucher.discountValue?.toLocaleString()}đ`}
                                    {voucher.discountType === "PERCENT" && `Giảm ${voucher.discountValue}% (tối đa 50.000đ)`}
                                    {voucher.minOrderValue && (
                                      <span className="min_order">
                                        Đơn tối thiểu {voucher.minOrderValue.toLocaleString()}đ
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="voucher_card_action">
                                  <button
                                    className={`apply_btn ${isActive ? "applied" : ""} ${!isValid ? "disabled_btn" : ""}`}
                                    disabled={isActive || !isValid}
                                  >
                                    {isActive ? "Đã chọn" : !isValid ? "Chưa đủ" : "Chọn"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TOTALS */}
            <div className="totals">
              <div className="total_row">
                <span>Tạm tính</span>
                <span>{subtotal.toLocaleString()} đ</span>
              </div>

              <div className="total_row">
                <span>Phí vận chuyển</span>
                <span>{shippingFee.toLocaleString()} đ</span>
              </div>

              {discount > 0 && (
                <div className="total_row discount">
                  <span>Giảm giá</span>
                  <span>- {discount.toLocaleString()} đ</span>
                </div>
              )}

              <div className="total_row grand_total">
                <span>Tổng tiền</span>
                <span className="price">{total.toLocaleString()} đ</span>
              </div>
            </div>

            <button
              className="confirm_btn"
              onClick={handleSubmit}
              disabled={cart.length === 0}
            >
              <CreditCard size={18} />
              <span>Xác nhận đặt hàng</span>
            </button>

            <div className="policy_note">
              <ShieldCheck size={14} />
              <span>Đơn hàng của bạn được bảo vệ an toàn</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;