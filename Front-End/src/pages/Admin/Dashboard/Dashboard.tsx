// Dashboard.tsx - Phần cập nhật

import React, { useEffect, useState } from 'react';
// @ts-ignore
import './Dashboard.css';
import {
    ShoppingOutlined,
    DollarOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    MoreOutlined,
    SmileOutlined,
    MehOutlined,
    FrownOutlined,
    HeartOutlined,
    FilterOutlined
} from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import adminApi from "../../../api/Admin/Admin";
import { TopProduct } from "../../../model/TopProduct ";
import { CategoryStatistic } from "../../../model/CategoryStatistic ";

const Dashboard = () => {

    const [dashboardStats, setDashboardStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalCustomers: 0
    });
    const [revenueData, setRevenueData] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [categoryRevenue, setCategoryRevenue] = useState([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [categories, setCategories] = useState<CategoryStatistic[]>([]);
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [sentimentStats, setSentimentStats] = useState({
        positive: 0,
        neutral: 0,
        negative: 0,
        positivePercent: 0,
        neutralPercent: 0,
        negativePercent: 0
    });

    // State cho danh sách sản phẩm đánh giá
    const [productReviews, setProductReviews] = useState<any[]>([]);
    const [filteredReviews, setFilteredReviews] = useState<any[]>([]);
    const [sentimentFilter, setSentimentFilter] = useState("POS");
    const [topSentimentProducts, setTopSentimentProducts] = useState<any[]>([]);

    const totalReviews = sentimentStats.positive + sentimentStats.neutral + sentimentStats.negative;

    // Animation states for satisfaction bars
    const [animatedValues, setAnimatedValues] = useState({
        positive: 0,
        neutral: 0,
        negative: 0
    });

    // Fetch dashboard stats
    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                const response = await adminApi.getDashboardStats();
                setDashboardStats(response.data);
            } catch (error) {
                console.log("Lỗi lấy dashboard stats:", error);
            }
        };
        fetchDashboardStats();
    }, []);

    // Fetch revenue by month
    useEffect(() => {
        const fetchRevenueChart = async () => {
            try {
                const response = await adminApi.getRevenueByMonth(selectedYear);
                setRevenueData(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchRevenueChart();
    }, [selectedYear]);

    // Fetch category revenue
    useEffect(() => {
        const fetchCategoryRevenue = async () => {
            try {
                const response = await adminApi.getRevenueByCategory(selectedYear);
                setCategoryRevenue(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCategoryRevenue();
    }, [selectedYear]);

    // Fetch top products
    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await adminApi.getTopSellingProducts(selectedYear);
                setTopProducts(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchTopProducts();
    }, [selectedYear]);

    // Fetch category statistics
    useEffect(() => {
        const fetchCategoryStatistics = async () => {
            try {
                const response = await adminApi.getCategoryStatistics();
                const colors = [
                    '#5b8cae',
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#8b5cf6',
                    '#06b6d4'
                ];
                const dataWithColors: CategoryStatistic[] = response.data.map(
                    (item: any, index: number) => ({
                        ...item,
                        color: colors[index % colors.length]
                    })
                );
                setCategories(dataWithColors);
            } catch (error) {
                console.log(error);
            }
        };
        fetchCategoryStatistics();
    }, []);

    // Fetch recent orders
    useEffect(() => {
        const fetchRecentOrders = async () => {
            try {
                const response = await adminApi.getRecentOrders();
                setRecentOrders(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        fetchRecentOrders();
    }, []);

    // Fetch sentiment statistics
    useEffect(() => {
        const fetchSentimentStats = async () => {
            try {
                const response = await adminApi.getSentimentStatistics();
                setSentimentStats(response.data);
            } catch (error) {
                console.log("Lỗi sentiment:", error);
            }
        };
        fetchSentimentStats();
    }, []);

    useEffect(() => {
        const fetchTopProducts = async () => {
            try {
                const response = await adminApi.getTopProductsBySentiment(sentimentFilter);
                setTopSentimentProducts(response.data);
            } catch (e) {
                console.log(e);
            }
        };

        fetchTopProducts();
    }, [sentimentFilter]);

    // Animate satisfaction bars on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedValues({
                positive: sentimentStats.positivePercent,
                neutral: sentimentStats.neutralPercent,
                negative: sentimentStats.negativePercent
            });
        }, 300);
        return () => clearTimeout(timer);
    }, [sentimentStats]);

    // Stats cards data
    const stats = [
        {
            title: 'Tổng doanh thu',
            value: `${dashboardStats.totalRevenue?.toLocaleString()}đ`,
            icon: <DollarOutlined />,
            color: '#5b8cae',
            bgColor: 'rgba(91, 140, 174, 0.1)'
        },
        {
            title: 'Đơn hàng',
            value: dashboardStats.totalOrders?.toLocaleString(),
            icon: <ShoppingCartOutlined />,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)'
        },
        {
            title: 'Sản phẩm',
            value: dashboardStats.totalProducts?.toLocaleString(),
            icon: <ShoppingOutlined />,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)'
        },
        {
            title: 'Khách hàng',
            value: dashboardStats.totalCustomers?.toLocaleString(),
            icon: <UserOutlined />,
            color: '#ef4444',
            bgColor: 'rgba(239, 68, 68, 0.1)'
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đã giao': return '#10b981';
            case 'Đang xử lý': return '#3b82f6';
            case 'Đang giao': return '#f59e0b';
            case 'Đã hủy': return '#f3442d';
            default: return '#64748b';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'Đã giao': return 'Đã giao';
            case 'Đang giao': return 'Đang giao';
            case 'Đang xử lý': return 'Đang xử lý';
            case 'Đã hủy': return 'Đã hủy';
            default: return status;
        }
    };

    // Get sentiment distribution for a product
    const getSentimentDistribution = (product: any) => {
        const total = product.totalReviews;
        return {
            positive: (product.positive / total * 100).toFixed(0),
            neutral: (product.neutral / total * 100).toFixed(0),
            negative: (product.negative / total * 100).toFixed(0)
        };
    };

    // Satisfaction data for donut chart and bars
    const satisfactionData = [
        {
            name: 'Hài lòng',
            percent: sentimentStats.positivePercent || 0,
            count: sentimentStats.positive || 0,
            color: '#10b981',
            icon: <SmileOutlined />
        },
        {
            name: 'Bình thường',
            percent: sentimentStats.neutralPercent || 0,
            count: sentimentStats.neutral || 0,
            color: '#f59e0b',
            icon: <MehOutlined />
        },
        {
            name: 'Không hài lòng',
            percent: sentimentStats.negativePercent || 0,
            count: sentimentStats.negative || 0,
            color: '#ef4444',
            icon: <FrownOutlined />
        }
    ];

    return (
        <div className="dashboard">

            {/* Stats Cards */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div className="stat-card" key={index}>
                        <div
                            className="stat-icon"
                            style={{
                                background: stat.bgColor,
                                color: stat.color,
                            }}
                        >
                            {stat.icon}
                        </div>
                        <div className="stat-content">
                            <span className="stat-title">{stat.title}</span>
                            <h2 className="stat-value">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="charts-row">
                <div className="chart-card large">
                    <div className="card-header">
                        <h3>Doanh thu theo tháng</h3>
                        <select
                            className="chart-select"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(Number(e.target.value))}
                        >
                            <option value={2026}>Năm 2026</option>
                            <option value={2025}>Năm 2025</option>
                            <option value={2024}>Năm 2024</option>
                            <option value={2023}>Năm 2023</option>
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
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis
                                stroke="var(--text-secondary)"
                                fontSize={12}
                                width={50}
                                tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip
                                formatter={(value: any) => `${Number(value).toLocaleString()}đ`}
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#5b8cae"
                                fill="url(#colorRevenue)"
                                strokeWidth={3}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h3>Doanh thu theo danh mục</h3>
                        <MoreOutlined style={{ cursor: 'pointer' }} />
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={categoryRevenue} barSize={55}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                            <YAxis
                                stroke="var(--text-secondary)"
                                fontSize={12}
                                width={45}
                                tickFormatter={(value) => `${value / 1000000}M`}
                            />
                            <Tooltip
                                formatter={(value: any) => `${Number(value).toLocaleString()}đ`}
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px'
                                }}
                            />
                            <Bar dataKey="revenue" fill="#5b8cae" radius={[10, 10, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products & Categories */}
            <div className="charts-row">
                <div className="chart-card">
                    <div className="card-header">
                        <h3>Sản phẩm bán chạy</h3>
                    </div>
                    <div className="product-list">
                        {topProducts.map((product, index) => (
                            <div className="product-item" key={product.id}>
                                <div className="product-rank">{index + 1}</div>
                                <img src={product.img} alt={product.name} className="product-image" />
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="product-price">{Number(product.price).toLocaleString()}đ</p>
                                </div>
                                <div className="product-stats">
                                    <div className="stat">
                                        <span className="stat-label">Đã bán</span>
                                        <span className="stat-value-small">{product.sold}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="chart-card">
                    <div className="card-header">
                        <h3>Danh mục sản phẩm</h3>
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
                                    <td className="order-id">#{order.id}</td>
                                    <td>
                                        <div className="customer-cell">
                                            <span className="customer-name">{order.customerName}</span>
                                        </div>
                                    </td>
                                    <td className="order-date">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleString("vi-VN") : ""}
                                    </td>
                                    <td className="amount">{Number(order.totalAmount).toLocaleString()}đ</td>
                                    <td>
                                        <span
                                            className={`payment-badge ${order.paymentMethod === "COD" ? "cod" : "online"}`}
                                        >
                                            {order.paymentMethod}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{ background: `${getStatusColor(order.status)}20`, color: getStatusColor(order.status) }}
                                        >
                                            {getStatusText(order.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Satisfaction Section - UPDATED */}
            <div className="satisfaction-section">
                <div className="satisfaction-header">
                    <div className="header-left">
                        <h3>Mức độ hài lòng của khách hàng</h3>
                    </div>
                    <div className="filter-wrapper">
                        <FilterOutlined style={{ color: 'var(--text-secondary)' }} />
                        <select
                            className="sentiment-filter"
                            value={sentimentFilter}
                            onChange={(e) => setSentimentFilter(e.target.value)}
                        >
                            <option value="POS">Hài lòng</option>
                            <option value="NEU">Bình thường</option>
                            <option value="NEG">Không hài lòng</option>
                        </select>
                    </div>
                </div>

                <div className="satisfaction-content">
                    {/* Donut Chart */}
                    <div className="satisfaction-chart">
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={satisfactionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="percent"
                                    stroke="none"
                                >
                                    {satisfactionData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.color}
                                            style={{
                                                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
                                            }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => `${value}%`}
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '10px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-center-label">
                            <span className="label-main">Tổng đánh giá</span>
                            <span className="label-value">{totalReviews}</span>
                        </div>
                    </div>

                    {/* Satisfaction Bars */}
                    <div className="satisfaction-bars">
                        {satisfactionData.map((item, index) => {
                            let animKey = 'positive';
                            if (item.name === 'Bình thường') animKey = 'neutral';
                            else if (item.name === 'Không hài lòng') animKey = 'negative';
                            const animValue = (animatedValues as any)[animKey];
                            return (
                                <div className="satisfaction-item" key={index}>
                                    <div className="satisfaction-item-header">
                                        <div className="item-label">
                                            <span className="item-icon" style={{ color: item.color }}>
                                                {item.icon}
                                            </span>
                                            <span className="item-name">{item.name}</span>
                                        </div>
                                        <span className="item-percentage" style={{ color: item.color }}>
                                            {item.percent}%
                                        </span>
                                    </div>
                                    <div className="satisfaction-bar-track">
                                        <div
                                            className="satisfaction-bar-fill"
                                            style={{
                                                width: `${animValue}%`,
                                                background: `linear-gradient(90deg, ${item.color}dd, ${item.color})`,
                                                boxShadow: `0 4px 12px ${item.color}40`
                                            }}
                                        >
                                            <div className="bar-shimmer"></div>
                                        </div>
                                    </div>
                                    <div className="satisfaction-stats">
                                        <span className="stat-count">
                                            {item.count} lượt
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Product Reviews List - NEW */}
                    <div className="product-reviews">
                        <h4 className="reviews-title">Danh sách sản phẩm</h4>
                        <div className="reviews-list">
                            {topSentimentProducts.map((product: any) => (
                                <div className="review-item" key={product.productId}>
                                    <img
                                        src={product.image}
                                        alt={product.productName}
                                        className="review-product-image"
                                    />

                                    <div className="review-product-info">
                                        <span className="review-product-name">
                                            {product.productName}
                                        </span>
                                    </div>

                                    <div className="review-total">
                                        <span className="review-count">
                                            {product.reviewCount}
                                        </span>
                                        <span className="review-label">
                                            lượt
                                        </span>
                                    </div>

                                </div>
                            ))}
                            {topSentimentProducts.length === 0 && (
                                <div className="no-reviews">
                                    <span>Không có sản phẩm nào phù hợp với bộ lọc</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;