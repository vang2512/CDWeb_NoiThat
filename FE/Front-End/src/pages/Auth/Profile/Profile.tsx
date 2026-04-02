import React, { useState, useEffect } from "react";
import "./Profile.css";
import { useNavigate } from "react-router-dom";
import authApi from "../../../api/Auth/Auth_Api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import {
    User,
    Package,
    Phone,
    LogOut
} from "lucide-react";

const Profile = () => {

    const { t } = useTranslation();

    const [userData, setUserData] = useState<any>({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: ""
    });

    const [orders, setOrders] = useState<any[]>([]);
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();

    const [tab, setTab] = useState("profile");

    useEffect(() => {
        document.title = t("account");
    }, [t]);

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/login");
        window.location.reload();
    };

    // load user
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

    // update
    const handleUpdate = async () => {
        try {
            const res = await authApi.updateUser(storedUser.id, userData);

            if (res.data.success) {
                toast.success(t("update_success"));

                localStorage.setItem(
                    "user",
                    JSON.stringify({
                        ...storedUser,
                        fullName: userData.fullName
                    })
                );

            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);
            toast.error(t("update_error"));
        }
    };

    // loard history order
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await authApi.getHistoryOrderUser(storedUser.id);
                setOrders(res.data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchOrders();
    }, []);

    // Hàm xử lý hủy đơn hàng
    const handleCancelOrder = async (orderId: number) => {
        try {
            const res = await authApi.cancelOrder(orderId, storedUser.id);

            if (res.data.success) {
                toast.success("Đã hủy đơn hàng");
            } else {
                toast.error(res.data.message);
            }

        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi hủy đơn");
        }
    };

    // Hàm bắt trạng thái đơn hàng
    const getStatusStyle = (status: string) => {
        const s = status?.toLowerCase();

        if (s.includes("hủy")) {
            return {
                background: "#fee2e2",
                color: "#dc2626",
                border: "1px solid #fecaca"
            };
        }

        if (s.includes("xử lý")) {
            return {
                background: "#e0e7ff",
                color: "#4f46e5",
                border: "1px solid #c7d2fe"
            };
        }

        if (s.includes("giao") && !s.includes("đã")) {
            return {
                background: "#dbeafe",
                color: "#2563eb",
                border: "1px solid #bfdbfe"
            };
        }

        if (s.includes("đã giao")) {
            return {
                background: "#d1fae5",
                color: "#059669",
                border: "1px solid #a7f3d0"
            };
        }

        return {};
    };

    // Hàm bắt đơn hàng có thể hủy
    const isProcessing = (status: string) => {
        return status?.toLowerCase().includes("xử lý");
    };

    return (

        <div className="profile_page">

            <div className="breadcrumb">
                <span onClick={() => navigate("/")}>{t("home")}</span>
                <span className="slash">/</span>
                <span>{t("account")}</span>
            </div>

            <h1 className="profile_title">{t("my_account")}</h1>

            <div className="profile_container">

                {/* SIDEBAR */}

                <div className="profile_sidebar">

                    <div
                        className={`sidebar_item ${tab === "profile" ? "active" : ""}`}
                        onClick={() => setTab("profile")}
                    >
                        <User size={18} />
                        <span>{t("personal_info")}</span>
                    </div>

                    <div
                        className={`sidebar_item ${tab === "orders" ? "active" : ""}`}
                        onClick={() => setTab("orders")}
                    >
                        <Package size={18} />
                        <span>{t("order_history")}</span>
                    </div>

                    <div
                        className={`sidebar_item ${tab === "contact" ? "active" : ""}`}
                        onClick={() => setTab("contact")}
                    >
                        <Phone size={18} />
                        <span>{t("contact")}</span>
                    </div>

                    <div className="sidebar_item logout" onClick={handleLogout}>
                        <LogOut size={18} />
                        <span>{t("logout")}</span>
                    </div>

                </div>

                {/* CONTENT */}

                <div className="profile_content">

                    {/* PROFILE */}

                    {tab === "profile" && (

                        <div className="content_box">

                            <h2>{t("personal_info")}</h2>

                            <div className="profile_form">

                                <div className="form_group">
                                    <label>{t("full_name")}</label>
                                    <input
                                        value={userData.fullName || ""}
                                        onChange={(e) =>
                                            setUserData({ ...userData, fullName: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form_group">
                                    <label>{t("email")}</label>
                                    <input value={userData.email || ""} disabled />
                                </div>

                                <div className="form_group">
                                    <label>{t("phone")}</label>
                                    <input
                                        value={userData.phone || ""}
                                        onChange={(e) =>
                                            setUserData({ ...userData, phone: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form_group">
                                    <label>{t("address")}</label>
                                    <input
                                        value={userData.address || ""}
                                        onChange={(e) =>
                                            setUserData({ ...userData, address: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="form_group">
                                    <label>{t("dob")}</label>
                                    <input
                                        type="date"
                                        value={userData.dateOfBirth || ""}
                                        onChange={(e) =>
                                            setUserData({ ...userData, dateOfBirth: e.target.value })
                                        }
                                    />
                                </div>

                                <button className="btn_save" onClick={handleUpdate}>
                                    {t("update_info")}
                                </button>

                            </div>

                        </div>

                    )}

                    {/* ORDERS */}

                    {tab === "orders" && (

                        <div className="content_box">

                            <h2>{t("order_history")}</h2>

                            {orders.length === 0 ? (
                                <p>Chưa có đơn hàng</p>
                            ) : (
                                <div className="order_list">

                                    {orders.map((order) => (

                                        <div key={order.id} className="order_card">

                                            {/* HEADER */}
                                            <div className="order_header">

                                                <div className="order_left">
                                                    <p className="order_date">
                                                        {new Date(order.date).toLocaleString()}
                                                    </p>
                                                </div>

                                                <div
                                                    className="status"
                                                    style={getStatusStyle(order.status)}
                                                >
                                                    {order.status}
                                                </div>

                                            </div>

                                            {/* BODY */}
                                            <div className="order_body">

                                                <div className="order_info">
                                                    <span>Tổng tiền</span>
                                                    <b className="total_price">
                                                        {order.totalAmount?.toLocaleString()}₫
                                                    </b>
                                                </div>

                                                <div className="order_info">
                                                    <span>Thanh toán</span>
                                                    <b>{order.paymentMethod}</b>
                                                </div>

                                            </div>

                                            {/* ACTION */}
                                            <div className="order_actions">

                                                <button
                                                    className="btn_detail"
                                                    onClick={() =>
                                                        setExpandedOrderId(
                                                            expandedOrderId === order.id ? null : order.id
                                                        )
                                                    }
                                                >
                                                    👁 Xem chi tiết
                                                </button>

                                            </div>

                                            {/* EXPAND ITEMS */}
                                            {expandedOrderId === order.id && (

                                                <div className="order_items">

                                                    {order.items?.map((item: any, index: number) => (

                                                        <div key={index} className="order_item_detail">

                                                            <img
                                                                src={item.image || "/no-image.png"}
                                                                alt=""
                                                            />

                                                            <div className="item_info">
                                                                <p className="product_name">{item.productName}</p>
                                                                <p className="quantity">x{item.quantity}</p>
                                                            </div>

                                                            <div className="item_price">
                                                                {item.price?.toLocaleString()}₫
                                                            </div>

                                                        </div>

                                                    ))}

                                                    {/* 🔥 BUTTON HỦY */}
                                                    {isProcessing(order.status) && (
                                                        <div className="cancel_box">
                                                            <button
                                                                className="btn_cancel"
                                                                onClick={() => handleCancelOrder(order.id)}
                                                            >
                                                                Hủy đơn hàng
                                                            </button>
                                                        </div>
                                                    )}

                                                </div>

                                            )}

                                        </div>

                                    ))}

                                </div>
                            )}

                        </div>
                    )}

                    {/* CONTACT */}

                    {tab === "contact" && (

                        <div className="content_box">

                            <h2>{t("support_contact")}</h2>

                            <p>Email: support@shop.com</p>
                            <p>{t("hotline")}: 1900 1234</p>

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};

export default Profile;