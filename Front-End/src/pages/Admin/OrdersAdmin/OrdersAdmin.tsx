import React, { useState, useEffect } from 'react';
import {
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    CloseOutlined,
    CheckOutlined,
    TruckOutlined,
    ClockCircleOutlined,
    DollarOutlined,
    UserOutlined,
    ShoppingOutlined,
    FilterOutlined,
    DownloadOutlined,
    PrinterOutlined,
    SendOutlined
} from '@ant-design/icons';
import adminApi from "../../../api/Admin/Admin";
import dayjs from 'dayjs';
import './OrdersAdmin.css';

// Interface đúng với cấu trúc API thực tế
interface OrderItem {
    productName: string;
    quantity: number;
    price: number;
    image: string | null;
}

interface Order {
    id: number;
    userId: number;
    date: string;
    totalAmount: number;
    status: string;
    note: string;
    paymentMethod: string;
    deliveredAt: string | null;
    items: OrderItem[];
}

interface User {
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    address: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<Map<number, User>>(new Map());
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchUsers();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            // Sử dụng adminApi thay vì axios trực tiếp
            const response = await adminApi.getOrders();
            const ordersData = Array.isArray(response.data) ? response.data : [];
            console.log('Fetched orders:', ordersData);
            setOrders(ordersData);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminApi.getUsers();
            const userMap = new Map();
            if (Array.isArray(response.data)) {
                response.data.forEach((user: User) => {
                    userMap.set(user.userId, user);
                });
            }
            setUsers(userMap);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            await adminApi.updateOrderStatus(orderId, status);
            fetchOrders();
            setIsUpdateStatusModalOpen(false);
            setSelectedStatus('');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    // Map trạng thái tiếng Việt
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Đang xử lý':
                return { label: 'Chờ xử lý', color: '#f59e0b', icon: <ClockCircleOutlined />, bg: '#f59e0b20' };
            case 'Đã xác nhận':
                return { label: 'Đã xác nhận', color: '#3b82f6', icon: <CheckOutlined />, bg: '#3b82f620' };
            case 'Đang giao':
                return { label: 'Đang giao', color: '#8b5cf6', icon: <TruckOutlined />, bg: '#8b5cf620' };
            case 'Đã giao':
                return { label: 'Đã giao', color: '#10b981', icon: <CheckOutlined />, bg: '#10b98120' };
            case 'Đã hủy':
                return { label: 'Đã hủy', color: '#ef4444', icon: <CloseOutlined />, bg: '#ef444420' };
            default:
                return { label: status || 'Không xác định', color: '#64748b', icon: <ClockCircleOutlined />, bg: '#64748b20' };
        }
    };

    // Lấy thông tin thanh toán từ paymentMethod
    const getPaymentInfo = (paymentMethod: string, status: string) => {
        let method = '';
        let paymentStatus = '';

        if (paymentMethod === 'Thanh toán khi nhận hàng') {
            method = 'Thanh toán khi nhận hàng (COD)';
            paymentStatus = status === 'Đã giao' ? 'Đã thanh toán' : 'Chưa thanh toán';
        } else if (paymentMethod === 'Thanh toán qua Vnpay') {
            method = 'Chuyển khoản qua VNPay';
            paymentStatus = 'Đã thanh toán';
        } else {
            method = paymentMethod || 'Chưa xác định';
            paymentStatus = 'Chưa xác định';
        }

        return { method, status: paymentStatus };
    };

    const formatPrice = (price: number) => {
        if (!price && price !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const formatDate = (date: string) => {
        if (!date) return '---';
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    const getUserInfo = (userId: number) => {
        return users.get(userId) || { fullName: 'N/A', email: 'N/A', phone: 'N/A', address: 'N/A' };
    };

    // Filter orders
    const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
        if (!order) return false;
        const user = getUserInfo(order.userId);
        const matchesSearch =
            order.id?.toString().includes(searchTerm) ||
            user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
        return matchesSearch && matchesStatus;
    }) : [];

    // Tính toán stats
    const safeOrders = Array.isArray(orders) ? orders : [];
    const stats = {
        total: safeOrders.length,
        pending: safeOrders.filter(o => o?.status === 'Đang xử lý').length,
        confirmed: safeOrders.filter(o => o?.status === 'Đã xác nhận').length,
        shipping: safeOrders.filter(o => o?.status === 'Đang giao').length,
        delivered: safeOrders.filter(o => o?.status === 'Đã giao').length,
        cancelled: safeOrders.filter(o => o?.status === 'Đã hủy').length,
        totalRevenue: safeOrders
            .filter(o => o?.status === 'Đã giao')
            .reduce((sum, o) => sum + (o?.totalAmount || 0), 0)
    };

    const statusOptions = [
        { value: 'Đang xử lý', label: 'Chờ xử lý' },
        { value: 'Đã xác nhận', label: 'Đã xác nhận' },
        { value: 'Đang giao', label: 'Đang giao' },
        { value: 'Đã giao', label: 'Đã giao' },
        { value: 'Đã hủy', label: 'Đã hủy' }
    ];

    return (
        <div className="orders-page">
            {/* Header */}
            <div className="orders-header">
                <div className="header-left">
                    <h1>Quản lý đơn hàng</h1>
                    <p>Quản lý và theo dõi trạng thái đơn hàng</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchOrders}>
                        <ReloadOutlined /> Làm mới
                    </button>
                    <button className="btn-export">
                        <DownloadOutlined /> Xuất Excel
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="orders-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <ShoppingOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng đơn hàng</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <ClockCircleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Chờ xử lý</h3>
                        <p>{stats.pending}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#3b82f620', color: '#3b82f6' }}>
                        <CheckOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã xác nhận</h3>
                        <p>{stats.confirmed}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#8b5cf620', color: '#8b5cf6' }}>
                        <TruckOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đang giao</h3>
                        <p>{stats.shipping}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <CheckOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã giao</h3>
                        <p>{stats.delivered}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <DollarOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Doanh thu</h3>
                        <p>{formatPrice(stats.totalRevenue)}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-bar">
                    <SearchOutlined className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn, tên khách hàng, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-search" onClick={() => setSearchTerm('')}>
                            <CloseOutlined />
                        </button>
                    )}
                </div>
                <div className="status-filter">
                    <FilterOutlined />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="all">Tất cả trạng thái</option>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => {
                                    const status = getStatusInfo(order.status);
                                    const user = getUserInfo(order.userId);
                                    const paymentInfo = getPaymentInfo(order.paymentMethod, order.status);
                                    return (
                                        <tr key={order.id}>
                                            <td className="order-id">#{order.id}</td>
                                            <td>
                                                <div className="customer-info">
                                                    <div className="customer-avatar">
                                                        {user.fullName?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="customer-details">
                                                        <strong>{user.fullName}</strong>
                                                        <span>{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatDate(order.date)}</td>
                                            <td className="amount">{formatPrice(order.totalAmount)}</td>
                                            <td>
                                                <span className="payment-badge" style={{
                                                    background: paymentInfo.status === 'Đã thanh toán' ? '#10b98120' : '#f59e0b20',
                                                    color: paymentInfo.status === 'Đã thanh toán' ? '#10b981' : '#f59e0b'
                                                }}>
                                                    {paymentInfo.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                                                    {status.icon} {status.label}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn view" onClick={() => {
                                                        setSelectedOrder(order);
                                                        setIsDetailModalOpen(true);
                                                    }}>
                                                        <EyeOutlined />
                                                    </button>
                                                    {order.status !== 'Đã giao' && order.status !== 'Đã hủy' && (
                                                        <button className="action-btn update" onClick={() => {
                                                            setSelectedOrder(order);
                                                            setSelectedStatus(order.status);
                                                            setIsUpdateStatusModalOpen(true);
                                                        }}>
                                                            <SendOutlined />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="empty-row">
                                    <td colSpan={7}>
                                        <div className="empty-state">
                                            <ShoppingOutlined />
                                            <p>Không tìm thấy đơn hàng nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Order Detail Modal */}
            {isDetailModalOpen && selectedOrder && (
                <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
                    <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setIsDetailModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Order Info */}
                            <div className="detail-section">
                                <h3>Thông tin đơn hàng</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Mã đơn:</label>
                                        <span>#{selectedOrder.id}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Ngày đặt:</label>
                                        <span>{formatDate(selectedOrder.date)}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Trạng thái:</label>
                                        <span className="status-badge" style={{ background: getStatusInfo(selectedOrder.status).bg, color: getStatusInfo(selectedOrder.status).color }}>
                                            {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).label}
                                        </span>
                                    </div>
                                    <div className="info-item">
                                        <label>Ghi chú:</label>
                                        <span>{selectedOrder.note || 'Không có ghi chú'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Info */}
                            <div className="detail-section">
                                <h3><UserOutlined /> Thông tin khách hàng</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Họ tên:</label>
                                        <span>{getUserInfo(selectedOrder.userId).fullName}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email:</label>
                                        <span>{getUserInfo(selectedOrder.userId).email}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Số điện thoại:</label>
                                        <span>{getUserInfo(selectedOrder.userId).phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Địa chỉ:</label>
                                        <span>{getUserInfo(selectedOrder.userId).address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Info */}
                            <div className="detail-section">
                                <h3><DollarOutlined /> Thông tin thanh toán</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Phương thức:</label>
                                        <span>{getPaymentInfo(selectedOrder.paymentMethod, selectedOrder.status).method}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Trạng thái:</label>
                                        <span className="payment-badge" style={{
                                            background: getPaymentInfo(selectedOrder.paymentMethod, selectedOrder.status).status === 'Đã thanh toán' ? '#10b98120' : '#f59e0b20',
                                            color: getPaymentInfo(selectedOrder.paymentMethod, selectedOrder.status).status === 'Đã thanh toán' ? '#10b981' : '#f59e0b'
                                        }}>
                                            {getPaymentInfo(selectedOrder.paymentMethod, selectedOrder.status).status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="detail-section">
                                <h3><ShoppingOutlined /> Sản phẩm đã đặt</h3>
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đơn giá</th>
                                            <th>Số lượng</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                            selectedOrder.items.map((item, index) => (
                                                <tr key={index}>
                                                    <td>
                                                        <div className="product-info">
                                                            <img
                                                                src={item.image || 'https://via.placeholder.com/40x40'}
                                                                alt={item.productName}
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40';
                                                                }}
                                                            />
                                                            <span>{item.productName}</span>
                                                        </div>
                                                    </td>
                                                    <td>{formatPrice(item.price)}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatPrice(item.price * item.quantity)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="empty-row">
                                                <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                                    Không có sản phẩm nào trong đơn hàng
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    {selectedOrder.items && selectedOrder.items.length > 0 && (
                                        <tfoot>
                                            <tr>
                                                <td colSpan={3} className="total-label">Tổng cộng:</td>
                                                <td className="total-amount">{formatPrice(selectedOrder.totalAmount)}</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsDetailModalOpen(false)}>
                                Đóng
                            </button>
                            <button className="btn-print" onClick={() => window.print()}>
                                <PrinterOutlined /> In đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {isUpdateStatusModalOpen && selectedOrder && (
                <div className="modal-overlay" onClick={() => setIsUpdateStatusModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Cập nhật trạng thái đơn hàng #{selectedOrder.id}</h2>
                            <button className="modal-close" onClick={() => setIsUpdateStatusModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Trạng thái hiện tại:</label>
                                <div className="current-status">
                                    <span className="status-badge" style={{ background: getStatusInfo(selectedOrder.status).bg, color: getStatusInfo(selectedOrder.status).color }}>
                                        {getStatusInfo(selectedOrder.status).icon} {getStatusInfo(selectedOrder.status).label}
                                    </span>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Cập nhật trạng thái mới:</label>
                                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                                    {statusOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsUpdateStatusModalOpen(false)}>
                                Hủy
                            </button>
                            <button
                                className="btn-submit"
                                onClick={() => updateOrderStatus(selectedOrder.id, selectedStatus)}
                                disabled={selectedStatus === selectedOrder.status}
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Orders;