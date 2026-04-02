import React, { useEffect, useState } from "react";
import "./OrderSuccess.css";
import { CheckCircle, Calendar, CreditCard, Receipt } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";

// Định nghĩa kiểu cho orderInfo
interface OrderInfo {
  total: number;
  date: string;
}

const OrderSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");

  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  useEffect(() => {
    // Lấy dữ liệu pendingOrder từ localStorage
    const storedOrder = localStorage.getItem("pendingOrder");

    if (storedOrder) {
      const parsedOrder = JSON.parse(storedOrder);

      setOrderInfo({
        total: parsedOrder?.total || 0,
        date: new Date().toLocaleString(),
      });

      // Xóa pendingOrder sau khi lấy dữ liệu
      localStorage.removeItem("pendingOrder");
    } else {
      // Nếu không có dữ liệu, redirect về trang chủ
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="success_page">
      <div className="success_card">

        <CheckCircle size={70} color="#22c55e" />

        <h2>Thanh toán thành công</h2>
        <p>Đơn hàng của bạn đã được xử lý thành công</p>

        <div className="success_info">

          <div className="info_row">
            <CreditCard size={18} />
            <span>Phương thức:</span>
            <b>{method || "N/A"}</b>
          </div>

          <div className="info_row">
            <Calendar size={18} />
            <span>Thời gian:</span>
            <b>{orderInfo?.date || "-"}</b>
          </div>

          <div className="info_row total">
            <span>Tổng tiền:</span>
            <b>{orderInfo?.total?.toLocaleString() || "0"} đ</b>
          </div>

        </div>

        <div className="success_actions">
          <button onClick={() => navigate("/", { replace: true })}>
            Về trang chủ
          </button>

          <button className="outline" onClick={() => navigate("/orders")}>
            Xem đơn hàng
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;