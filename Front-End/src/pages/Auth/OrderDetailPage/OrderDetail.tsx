import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Truck, Package, CheckCircle, Clock, XCircle } from "lucide-react";
import authApi from "../../../api/Auth/Auth_Api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./OrderDetail.css";

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [order, setOrder] = useState<any>(null);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    useEffect(() => {
        document.title = t("order_detail");
        fetchOrderDetail();
    }, [id]);

const fetchOrderDetail = async () => {
    try {
        const res = await authApi.getDetailOrder(Number(id));
        // Vì API trả thẳng OrderDTO
        setOrder(res.data); // không cần res.data.data
    } catch (err) {
        console.error(err);
        toast.error(t("load_error"));
    }
};

    const getStatusIcon = (status: string) => {
        const s = status?.toLowerCase();
        if (s.includes("xử lý")) return <Clock size={20} />;
        if (s.includes("giao") && !s.includes("đã")) return <Truck size={20} />;
        if (s.includes("đã giao")) return <CheckCircle size={20} />;
        if (s.includes("hủy")) return <XCircle size={20} />;
        return <Package size={20} />;
    };

    const getStatusStep = (currentStatus: string) => {
        const steps = [
            { key: "processing", label: "Đang xử lý", value: "xử lý" },
            { key: "shipping", label: "Đang giao", value: "giao" },
            { key: "delivered", label: "Đã giao", value: "đã giao" }
        ];

        let currentStep = -1;
        if (currentStatus?.toLowerCase().includes("xử lý")) currentStep = 0;
        else if (currentStatus?.toLowerCase().includes("giao") && !currentStatus?.toLowerCase().includes("đã")) currentStep = 1;
        else if (currentStatus?.toLowerCase().includes("đã giao")) currentStep = 2;

        return { steps, currentStep };
    };

    if (!order) return <div className="loading">Loading...</div>;

    const { steps, currentStep } = getStatusStep(order.status);

    return (
        <div className="order_detail_page">
            <div className="breadcrumb">
                <span onClick={() => navigate("/")}>{t("home")}</span>
                <span className="slash">/</span>
                <span onClick={() => navigate("/profile")}>{t("account")}</span>
                <span className="slash">/</span>
                <span>{t("order_detail")}</span>
            </div>

            <div className="order_detail_container">
                {/* Status Timeline */}
                {!order.status?.toLowerCase().includes("hủy") && (
                    <div className="status_timeline">
                        {steps.map((step, index) => (
                            <div key={step.key} className={`timeline_step ${index <= currentStep ? "active" : ""}`}>
                                <div className="step_icon">
                                    {index === 0 && <Clock size={24} />}
                                    {index === 1 && <Truck size={24} />}
                                    {index === 2 && <CheckCircle size={24} />}
                                </div>
                                <div className="step_label">{step.label}</div>
                                {index < steps.length - 1 && <div className="step_line" />}
                            </div>
                        ))}
                    </div>
                )}

                {order.status?.toLowerCase().includes("hủy") && (
                    <div className="canceled_status">
                        <XCircle size={48} />
                        <h3>Đơn hàng đã bị hủy</h3>
                    </div>
                )}

                {/* Order Info */}
                <div className="order_info_section">
                    <h3>Thông tin đơn hàng</h3>
                    <div className="info_grid">
                        <div className="info_item">
                            <span>Mã đơn hàng:</span>
                            <strong>#{order.id}</strong>
                        </div>
                        <div className="info_item">
                            <span>Ngày đặt:</span>
                            <strong>{new Date(order.date).toLocaleString()}</strong>
                        </div>
                        <div className="info_item">
                            <span>Phương thức thanh toán:</span>
                            <strong>{order.paymentMethod}</strong>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="shipping_section">
                    <h3>Thông tin giao hàng</h3>
                    <div className="shipping_info">
                        <p><strong>Người nhận:</strong> {order.fullName || order.customerName}</p>
                        <p><strong>Số điện thoại:</strong> {order.phone}</p>
                        <p><strong>Địa chỉ:</strong> {order.address}</p>
                    </div>
                </div>

                {/* Products List */}
                <div className="products_section">
                    <h3>Danh sách sản phẩm</h3>
                    <div className="products_table">
                        <div className="table_header">
                            <div>Sản phẩm</div>
                            <div>Đơn giá</div>
                            <div>Số lượng</div>
                            <div>Thành tiền</div>
                        </div>
                        <div className="table_body">
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} className="product_row">
                                    <div className="product_info">
                                        <img src={item.image || "/no-image.png"} alt={item.productName} />
                                        <span>{item.productName}</span>
                                    </div>
                                    <div className="product_price">{item.price?.toLocaleString()}₫</div>
                                    <div className="product_quantity">x{item.quantity}</div>
                                    <div className="product_total">{(item.price * item.quantity)?.toLocaleString()}₫</div>
                                </div>
                            ))}
                        </div>
                        <div className="table_footer">
                            <div className="total_amount">
                                <span>Tổng cộng:</span>
                                <strong>{order.totalAmount?.toLocaleString()}₫</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;