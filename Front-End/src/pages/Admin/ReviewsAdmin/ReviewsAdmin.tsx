import React, { useState, useEffect } from 'react';
import {
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    CloseOutlined,
    CheckOutlined,
    DeleteOutlined,
    StarOutlined,
    StarFilled,
    UserOutlined,
    ProductOutlined,
    FilterOutlined,
    MessageOutlined,
    WarningOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './ReviewsAdmin.css';

interface Review {
    id: number;
    user: {
        userId: number;
        fullName: string;
        email: string;
        phone: string;
        address: string;
    };
    food: {
        id: number;
        name: string;
        price: number;
        img: string;
        category: {
            id: number;
            categoryName: string;
        };
    };
    rating: number;
    comment: string;
    createdAt: string;
    isHidden: boolean;
}

const Reviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [filterRating, setFilterRating] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // API Calls
    const API_BASE = 'http://localhost:8080/api/admin/reviews';

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE);
            const reviewsData = Array.isArray(response.data) ? response.data : [];
            setReviews(reviewsData);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleHidden = async (review: Review) => {
        try {
            await axios.patch(`${API_BASE}/${review.id}/hide`, { isHidden: !review.isHidden });
            fetchReviews();
        } catch (error) {
            console.error('Error toggling review visibility:', error);
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    const handleDelete = async () => {
        if (!selectedReview) return;
        try {
            await axios.delete(`${API_BASE}/${selectedReview.id}`);
            fetchReviews();
            setIsDeleteModalOpen(false);
            setSelectedReview(null);
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Xóa bình luận thất bại!');
        }
    };

    const formatDate = (date: string) => {
        if (!date) return '---';
        return dayjs(date).format('DD/MM/YYYY HH:mm');
    };

    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (i <= rating) {
                stars.push(<StarFilled key={i} style={{ color: '#f59e0b', fontSize: '14px' }} />);
            } else {
                stars.push(<StarOutlined key={i} style={{ color: '#cbd5e1', fontSize: '14px' }} />);
            }
        }
        return stars;
    };

    const getRatingLabel = (rating: number) => {
        switch (rating) {
            case 1: return 'Rất tệ';
            case 2: return 'Tệ';
            case 3: return 'Bình thường';
            case 4: return 'Tốt';
            case 5: return 'Xuất sắc';
            default: return '';
        }
    };

    // Filter reviews
    const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
        const matchesSearch =
            review.user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.food.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = filterRating === 'all' || review.rating.toString() === filterRating;
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'hidden' && review.isHidden) ||
            (filterStatus === 'visible' && !review.isHidden);
        return matchesSearch && matchesRating && matchesStatus;
    }) : [];

    // Tính toán stats
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    const stats = {
        total: safeReviews.length,
        averageRating: safeReviews.length > 0
            ? (safeReviews.reduce((sum, r) => sum + r.rating, 0) / safeReviews.length).toFixed(1)
            : 0,
        visible: safeReviews.filter(r => !r.isHidden).length,
        hidden: safeReviews.filter(r => r.isHidden).length,
        ratingDistribution: {
            5: safeReviews.filter(r => r.rating === 5).length,
            4: safeReviews.filter(r => r.rating === 4).length,
            3: safeReviews.filter(r => r.rating === 3).length,
            2: safeReviews.filter(r => r.rating === 2).length,
            1: safeReviews.filter(r => r.rating === 1).length
        }
    };

    const ratingOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: '5', label: '5 sao' },
        { value: '4', label: '4 sao' },
        { value: '3', label: '3 sao' },
        { value: '2', label: '2 sao' },
        { value: '1', label: '1 sao' }
    ];

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'visible', label: 'Hiển thị' },
        { value: 'hidden', label: 'Đã ẩn' }
    ];

    return (
        <div className="reviews-page">
            {/* Header */}
            <div className="reviews-header">
                <div className="header-left">
                    <h1>Quản lý đánh giá</h1>
                    <p>Quản lý bình luận và đánh giá sản phẩm</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchReviews}>
                        <ReloadOutlined /> Làm mới
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="reviews-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <MessageOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng đánh giá</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <StarFilled />
                    </div>
                    <div className="stat-info">
                        <h3>Đánh giá trung bình</h3>
                        <p>{stats.averageRating} / 5</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <EyeInvisibleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đang hiển thị</h3>
                        <p>{stats.visible}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                        <EyeInvisibleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã ẩn</h3>
                        <p>{stats.hidden}</p>
                    </div>
                </div>
            </div>

            {/* Rating Distribution */}
            <div className="rating-distribution">
                <h3>Phân bố đánh giá</h3>
                <div className="distribution-bars">
                    {[5, 4, 3, 2, 1].map(rating => (
                        <div key={rating} className="distribution-item">
                            <div className="distribution-label">
                                <StarFilled style={{ color: '#f59e0b', fontSize: '12px' }} />
                                <span>{rating} sao</span>
                            </div>
                            <div className="distribution-bar-container">
                                <div
                                    className="distribution-bar"
                                    style={{
                                        width: `${stats.total > 0 ? (stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] / stats.total * 100) : 0}%`,
                                        background: rating >= 4 ? '#10b981' : rating === 3 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                            <div className="distribution-count">
                                {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-bar">
                    <SearchOutlined className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên khách hàng, sản phẩm hoặc nội dung..."
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
                    <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}>
                        {ratingOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="status-filter">
                    <EyeOutlined />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Reviews Table */}
            <div className="reviews-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="reviews-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Khách hàng</th>
                                <th>Sản phẩm</th>
                                <th>Đánh giá</th>
                                <th>Nội dung</th>
                                <th>Ngày đánh giá</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReviews.length > 0 ? (
                                filteredReviews.map((review) => (
                                    <tr key={review.id} className={review.isHidden ? 'hidden-row' : ''}>
                                        <td className="review-id">#{review.id}</td>
                                        <td>
                                            <div className="customer-info">
                                                <div className="customer-avatar">
                                                    {review.user.fullName?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div className="customer-details">
                                                    <strong>{review.user.fullName}</strong>
                                                    <span>{review.user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="product-info">
                                                <img
                                                    src={review.food.img || 'https://via.placeholder.com/40x40'}
                                                    alt={review.food.name}
                                                    className="product-image"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40';
                                                    }}
                                                />
                                                <span className="product-name">{review.food.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="rating-info">
                                                <div className="stars">{renderStars(review.rating)}</div>
                                                <span className="rating-label">{getRatingLabel(review.rating)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="comment-content">
                                                {review.comment && review.comment.length > 80
                                                    ? `${review.comment.substring(0, 80)}...`
                                                    : review.comment || 'Không có nội dung'}
                                            </div>
                                        </td>
                                        <td>{formatDate(review.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${review.isHidden ? 'hidden' : 'visible'}`}>
                                                {review.isHidden ? 'Đã ẩn' : 'Hiển thị'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => {
                                                    setSelectedReview(review);
                                                    setIsViewModalOpen(true);
                                                }}>
                                                    <EyeOutlined />
                                                </button>
                                                <button
                                                    className={`action-btn toggle ${review.isHidden ? 'show' : 'hide'}`}
                                                    onClick={() => handleToggleHidden(review)}
                                                >
                                                    {review.isHidden ? <EyeInvisibleOutlined /> : <EyeInvisibleOutlined />}
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => {
                                                        setSelectedReview(review);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="empty-row">
                                    <td colSpan={8}>
                                        <div className="empty-state">
                                            <MessageOutlined />
                                            <p>Không tìm thấy đánh giá nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* View Modal */}
            {isViewModalOpen && selectedReview && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết đánh giá</h2>
                            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-review">
                                {/* Customer Info */}
                                <div className="detail-section">
                                    <h3><UserOutlined /> Thông tin khách hàng</h3>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Họ tên:</label>
                                            <span>{selectedReview.user.fullName}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Email:</label>
                                            <span>{selectedReview.user.email}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Số điện thoại:</label>
                                            <span>{selectedReview.user.phone || '---'}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Địa chỉ:</label>
                                            <span>{selectedReview.user.address || '---'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="detail-section">
                                    <h3><ProductOutlined /> Thông tin sản phẩm</h3>
                                    <div className="product-detail">
                                        <img
                                            src={selectedReview.food.img || 'https://via.placeholder.com/80x80'}
                                            alt={selectedReview.food.name}
                                            className="product-image-large"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80';
                                            }}
                                        />
                                        <div className="product-detail-info">
                                            <div><strong>Tên:</strong> {selectedReview.food.name}</div>
                                            <div><strong>Danh mục:</strong> {selectedReview.food.category?.categoryName || '---'}</div>
                                            <div><strong>Giá:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedReview.food.price)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Review Info */}
                                <div className="detail-section">
                                    <h3><StarFilled /> Nội dung đánh giá</h3>
                                    <div className="review-detail">
                                        <div className="review-rating">
                                            <span className="rating-label-large">Đánh giá: </span>
                                            <div className="stars-large">{renderStars(selectedReview.rating)}</div>
                                            <span className="rating-text">{getRatingLabel(selectedReview.rating)}</span>
                                        </div>
                                        <div className="review-comment">
                                            <label>Nội dung:</label>
                                            <p>{selectedReview.comment || 'Không có nội dung'}</p>
                                        </div>
                                        <div className="review-date">
                                            <label>Ngày đánh giá:</label>
                                            <span>{formatDate(selectedReview.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>
                                Đóng
                            </button>
                            <button
                                className="btn-submit"
                                onClick={() => handleToggleHidden(selectedReview)}
                            >
                                {selectedReview.isHidden ? <EyeInvisibleOutlined /> : <EyeInvisibleOutlined />}
                                {selectedReview.isHidden ? ' Hiển thị' : ' Ẩn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedReview && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xác nhận xóa</h2>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa đánh giá của khách hàng
                                <strong> "{selectedReview.user.fullName}"</strong> cho sản phẩm
                                <strong> "{selectedReview.food.name}"</strong>?
                            </p>
                            <p className="delete-warning">Hành động này không thể hoàn tác!</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                <DeleteOutlined /> Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    );
};

export default Reviews;