import React from 'react';
// @ts-ignore
import './Dashboard.css';
import {
    ShoppingOutlined,
    DollarOutlined,
    UserOutlined,
    RiseOutlined,
    FallOutlined,
    ShoppingCartOutlined,
    EyeOutlined,
    ThunderboltOutlined,
    StarOutlined,
    ArrowRightOutlined,
    DownloadOutlined,
    MoreOutlined
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';

const Dashboard = () => {
    // Dữ liệu thống kê
    const stats = [
        {
            title: 'Tổng doanh thu',
            value: '125.800.000đ',
            change: '+12.5%',
            trend: 'up',
            icon: <DollarOutlined />,
            color: '#5b8cae',
            bgColor: 'rgba(91, 140, 174, 0.1)'
        },
        {
            title: 'Đơn hàng',
            value: '1,234',
            change: '+8.2%',
            trend: 'up',
            icon: <ShoppingCartOutlined />,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            title: 'Sản phẩm',
            value: '456',
            change: '+5',
            trend: 'up',
            icon: <ShoppingOutlined />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'Khách hàng',
            value: '3,456',
            change: '+15%',
            trend: 'up',
            icon: <UserOutlined />,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        },
    ];

    // Dữ liệu biểu đồ doanh thu theo tháng
    const revenueData = [
        { month: 'T1', revenue: 85, orders: 120 },
        { month: 'T2', revenue: 92, orders: 135 },
        { month: 'T3', revenue: 88, orders: 128 },
        { month: 'T4', revenue: 105, orders: 150 },
        { month: 'T5', revenue: 118, orders: 168 },
        { month: 'T6', revenue: 125, orders: 185 },
        { month: 'T7', revenue: 135, orders: 210 },
        { month: 'T8', revenue: 142, orders: 225 },
        { month: 'T9', revenue: 138, orders: 218 },
        { month: 'T10', revenue: 155, orders: 245 },
        { month: 'T11', revenue: 168, orders: 268 },
        { month: 'T12', revenue: 180, orders: 290 },
    ];

    // Dữ liệu sản phẩm bán chạy
    const topProducts = [
        { id: 1, name: 'Ghế Sofa Cao Cấp', price: '12.500.000đ', sold: 245, revenue: '3.062.500.000đ', trend: '+23%', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=100' },
        { id: 2, name: 'Bàn Ăn Gỗ Tự Nhiên', price: '8.900.000đ', sold: 189, revenue: '1.682.100.000đ', trend: '+15%', image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=100' },
        { id: 3, name: 'Tủ Quần Áo Thông Minh', price: '15.500.000đ', sold: 156, revenue: '2.418.000.000đ', trend: '+32%', image: 'https://images.unsplash.com/photo-1595425970373-0dfc8fc1d78f?w=100' },
        { id: 4, name: 'Giường Ngủ Hiện Đại', price: '18.900.000đ', sold: 134, revenue: '2.532.600.000đ', trend: '+18%', image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=100' },
        { id: 5, name: 'Bàn Làm Việc Gỗ', price: '4.500.000đ', sold: 298, revenue: '1.341.000.000đ', trend: '+45%', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=100' },
    ];

    // Dữ liệu đơn hàng gần đây
    const recentOrders = [
        { id: '#ORD-001', customer: 'Nguyễn Văn An', amount: '12.500.000đ', status: 'completed', date: '2024-01-15', payment: 'Chuyển khoản' },
        { id: '#ORD-002', customer: 'Trần Thị Bình', amount: '8.900.000đ', status: 'shipping', date: '2024-01-14', payment: 'COD' },
        { id: '#ORD-003', customer: 'Lê Văn Cường', amount: '23.400.000đ', status: 'pending', date: '2024-01-14', payment: 'Chuyển khoản' },
        { id: '#ORD-004', customer: 'Phạm Thị Dung', amount: '5.600.000đ', status: 'completed', date: '2024-01-13', payment: 'Thẻ tín dụng' },
        { id: '#ORD-005', customer: 'Hoàng Văn Em', amount: '15.200.000đ', status: 'processing', date: '2024-01-13', payment: 'Chuyển khoản' },
    ];

    // Dữ liệu danh mục bán chạy
    const categories = [
        { name: 'Ghế Sofa', value: 35, color: '#5b8cae' },
        { name: 'Bàn Ăn', value: 25, color: '#10b981' },
        { name: 'Giường Ngủ', value: 20, color: '#f59e0b' },
        { name: 'Tủ Kệ', value: 12, color: '#ef4444' },
        { name: 'Trang Trí', value: 8, color: '#8b5cf6' },
    ];

    // Dữ liệu doanh thu theo danh mục
    const categoryRevenue = [
        { name: 'Ghế Sofa', revenue: 42, target: 35 },
        { name: 'Bàn Ăn', revenue: 28, target: 25 },
        { name: 'Giường Ngủ', revenue: 22, target: 20 },
        { name: 'Tủ Kệ', revenue: 15, target: 12 },
        { name: 'Trang Trí', revenue: 10, target: 8 },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return '#10b981';
            case 'shipping': return '#3b82f6';
            case 'pending': return '#f59e0b';
            case 'processing': return '#8b5cf6';
            default: return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed': return 'Hoàn thành';
            case 'shipping': return 'Đang giao';
            case 'pending': return 'Chờ xử lý';
            case 'processing': return 'Đang xử lý';
            default: return status;
        }
    };

    return (
        <div className="dashboard">
            {/* Header với greeting và actions */}
            <div className="dashboard-header">
                <div className="greeting">
                    <h1>Xin chào, Nguyễn Văn A! 👋</h1>
                    <p>Đây là tổng quan về cửa hàng nội thất của bạn hôm nay</p>
                </div>
                <div className="header-actions">
                    <button className="action-btn">
                        <DownloadOutlined /> Báo cáo
                    </button>
                    <button className="action-btn primary">
                        <ThunderboltOutlined /> Xuất kho
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div className="stat-header">
                            <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <span className={`stat-trend ${stat.trend}`}>
                                {stat.change}
                                {stat.trend === 'up' ? <RiseOutlined /> : <FallOutlined />}
                            </span>
                        </div>
                        <h3 className="stat-title">{stat.title}</h3>
                        <p className="stat-value">{stat.value}</p>
                        <div className="stat-progress">
                            <div className="progress-bar" style={{ width: '70%', background: stat.color }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-row">
                <div className="chart-card large">
                    <div className="card-header">
                        <h3>Doanh thu theo tháng</h3>
                        <select className="chart-select" aria-label="Chọn năm">
                            <option>Năm 2024</option>
                            <option>Năm 2023</option>
                            <option>Năm 2022</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={revenueData}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#5b8cae" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#5b8cae" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#5b8cae" fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h3>Doanh thu theo danh mục</h3>
                        <MoreOutlined style={{ cursor: 'pointer' }} />
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={categoryRevenue}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis stroke="var(--text-secondary)" />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Bar dataKey="revenue" fill="#5b8cae" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="target" fill="#cbd5e1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products & Categories */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="card-header">
                        <h3>Sản phẩm bán chạy</h3>
                        <button className="view-all">Xem tất cả <ArrowRightOutlined /></button>
                    </div>
                    <div className="product-list">
                        {topProducts.map((product, index) => (
                            <div className="product-item" key={product.id}>
                                <div className="product-rank">{index + 1}</div>
                                <img src={product.image} alt={product.name} className="product-image" />
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="product-price">{product.price}</p>
                                </div>
                                <div className="product-stats">
                                    <div className="stat">
                                        <span className="stat-label">Đã bán</span>
                                        <span className="stat-value-small">{product.sold}</span>
                                    </div>
                                    <div className="stat">
                                        <span className="stat-label">Xu hướng</span>
                                        <span className="trend up">{product.trend}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h3>Danh mục sản phẩm</h3>
                        <EyeOutlined style={{ cursor: 'pointer' }} />
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categories}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                            >
                                {categories.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="category-stats">
                        {categories.map((cat, index) => (
                            <div className="category-item" key={index}>
                                <span className="category-dot" style={{ background: cat.color }}></span>
                                <span className="category-name">{cat.name}</span>
                                <span className="category-value">{cat.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="table-card">
                <div className="card-header">
                    <h3>Đơn hàng gần đây</h3>
                    <button className="view-all">Xem tất cả <ArrowRightOutlined /></button>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Số tiền</th>
                                <th>Thanh toán</th>
                                <th>Trạng thái</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.map((order) => (
                                <tr key={order.id}>
                                    <td className="order-id">{order.id}</td>
                                    <td>{order.customer}</td>
                                    <td>{order.date}</td>
                                    <td className="amount">{order.amount}</td>
                                    <td>{order.payment}</td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="view-btn" aria-label="Xem chi tiết đơn hàng">
                                            <EyeOutlined />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Thao tác nhanh</h3>
                <div className="actions-grid">
                    <div className="action-item">
                        <div className="action-icon" style={{ background: 'rgba(91, 140, 174, 0.1)', color: '#5b8cae' }}>
                            <ShoppingOutlined />
                        </div>
                        <span>Thêm sản phẩm</span>
                    </div>
                    <div className="action-item">
                        <div className="action-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <UserOutlined />
                        </div>
                        <span>Thêm khách hàng</span>
                    </div>
                    <div className="action-item">
                        <div className="action-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <ShoppingCartOutlined />
                        </div>
                        <span>Tạo đơn hàng</span>
                    </div>
                    <div className="action-item">
                        <div className="action-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            <StarOutlined />
                        </div>
                        <span>Khuyến mãi</span>
                    </div>
                </div>
            </div>


        </div>
    );
};

export default Dashboard;