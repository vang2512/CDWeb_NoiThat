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
    LogOut,
    ChevronRight
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

    // load history order
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
    const handleCancelOrder = async (orderId: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn chặn sự kiện click vào card
        try {
            const res = await authApi.cancelOrder(orderId, storedUser.id);

            if (res.data.success) {
                toast.success("Đã hủy đơn hàng");
                // Refresh lại danh sách đơn hàng
                const refreshRes = await authApi.getHistoryOrderUser(storedUser.id);
                setOrders(refreshRes.data);
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
                color: "#dc2626"
            };
        }

        if (s.includes("xử lý")) {
            return {
                background: "#e0e7ff",
                color: "#4f46e5"
            };
        }

        if (s.includes("giao") && !s.includes("đã")) {
            return {
                background: "#dbeafe",
                color: "#2563eb"
            };
        }

        if (s.includes("đã giao")) {
            return {
                background: "#d1fae5",
                color: "#059669"
            };
        }

        return {};
    };

    // Hàm lấy text trạng thái tiếng Việt
    const getStatusText = (status: string) => {
        const s = status?.toLowerCase();
        if (s.includes("xử lý")) return "Đang xử lý";
        if (s.includes("giao") && !s.includes("đã")) return "Đang giao";
        if (s.includes("đã giao")) return "Đã giao";
        if (s.includes("hủy")) return "Đã hủy";
        return status;
    };

    // Kiểm tra có thể hủy đơn không
    const canCancel = (status: string) => {
        const s = status?.toLowerCase();
        return s.includes("xử lý");
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

                    {/* PROFILE - GIỮ NGUYÊN */}

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

                    {/* ORDERS - ĐÃ SỬA THEO YÊU CẦU */}

                    {tab === "orders" && (

                        <div className="content_box orders_content">

                            <h2>{t("order_history")}</h2>

                            {orders.length === 0 ? (
                                <p className="no_orders">Chưa có đơn hàng</p>
                            ) : (
                                <div className="orders_list">

                                    {orders.map((order) => (

                                        <div 
                                            key={order.id} 
                                            className="order_item"
                                            onClick={() => navigate(`/order-detail/${order.id}`)}
                                        >
                                            <div className="order_item_left">
                                                <div className="order_icon">
                                                    <Package size={24} />
                                                </div>
                                                <div className="order_info">
                                                    <div className="order_id">Đơn hàng #{order.id}</div>
                                                    <div className="order_date">
                                                        {new Date(order.date).toLocaleDateString()}
                                                    </div>
                                                    <div className="order_total">
                                                        {order.totalAmount?.toLocaleString()}₫
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="order_item_right">
                                                <div 
                                                    className="order_status"
                                                    style={getStatusStyle(order.status)}
                                                >
                                                    {getStatusText(order.status)}
                                                </div>
                                                {canCancel(order.status) && (
                                                    <button 
                                                        className="btn_cancel_order"
                                                        onClick={(e) => handleCancelOrder(order.id, e)}
                                                    >
                                                        Hủy đơn
                                                    </button>
                                                )}
                                                <ChevronRight size={20} className="arrow_icon" />
                                            </div>
                                        </div>

                                    ))}

                                </div>
                            )}

                        </div>
                    )}

                    {/* CONTACT - GIỮ NGUYÊN */}

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