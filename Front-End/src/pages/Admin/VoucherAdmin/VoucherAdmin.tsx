import React, { useState, useEffect } from 'react';
import {
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseOutlined,
    PlusOutlined,
    TagOutlined,
    DollarOutlined,
    CalendarOutlined,
    MoneyCollectOutlined,
    CheckOutlined,
    StopOutlined,
    PlayCircleOutlined,
    WarningOutlined,
    FilterOutlined
} from '@ant-design/icons';
import adminApi from "../../../api/Admin/Admin";
import dayjs from 'dayjs';
import './VoucherAdmin.css';

interface Voucher {
    id: number;
    code: string;
    discountType: string; // PERCENT or FIXED
    discountValue: number;
    minOrderValue: number;
    quantity: number;
    usedCount: number;
    startDate: string;
    endDate: string;
    status: string; // ACTIVE or INACTIVE
    createdAt: string;
}

const Vouchers = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENT',
        discountValue: 0,
        minOrderValue: 0,
        quantity: 0,
        startDate: '',
        endDate: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            // Sử dụng adminApi thay vì axios trực tiếp
            const response = await adminApi.getVouchers();
            const vouchersData = Array.isArray(response.data) ? response.data : [];
            setVouchers(vouchersData);
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setVouchers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedVoucher) return;
        try {
            await adminApi.deleteVoucher(selectedVoucher.id);
            fetchVouchers();
            setIsDeleteModalOpen(false);
            setSelectedVoucher(null);
        } catch (error) {
            console.error('Error deleting voucher:', error);
            alert('Xóa voucher thất bại!');
        }
    };

    const handleSubmit = async () => {
        try {
            const submitData = {
                ...formData,
                discountValue: Number(formData.discountValue),
                minOrderValue: Number(formData.minOrderValue),
                quantity: Number(formData.quantity)
            };

            if (modalMode === 'add') {
                await adminApi.createVoucher(submitData);
            } else {
                await adminApi.updateVoucher(selectedVoucher?.id, submitData);
            }
            fetchVouchers();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving voucher:', error);
            alert('Lưu voucher thất bại!');
        }
    };

    const handleEdit = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
        setFormData({
            code: voucher.code,
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            minOrderValue: voucher.minOrderValue,
            quantity: voucher.quantity,
            startDate: dayjs(voucher.startDate).format('YYYY-MM-DDTHH:mm'),
            endDate: dayjs(voucher.endDate).format('YYYY-MM-DDTHH:mm'),
            status: voucher.status
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
        setIsViewModalOpen(true);
    };

    const handleToggleStatus = async (voucher: Voucher) => {
        const newStatus = voucher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await adminApi.toggleVoucherStatus(voucher.id, newStatus);
            fetchVouchers();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Cập nhật trạng thái thất bại!');
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountType: 'PERCENT',
            discountValue: 0,
            minOrderValue: 0,
            quantity: 0,
            startDate: '',
            endDate: '',
            status: 'ACTIVE'
        });
        setSelectedVoucher(null);
    };

    const getDiscountTypeLabel = (type: string) => {
        return type === 'PERCENT' ? 'Phần trăm (%)' : 'Cố định (VNĐ)';
    };

    const getStatusInfo = (status: string) => {
        if (status === 'ACTIVE') {
            return { label: 'Hoạt động', color: '#10b981', icon: <PlayCircleOutlined />, bg: '#10b98120' };
        }
        return { label: 'Không hoạt động', color: '#ef4444', icon: <StopOutlined />, bg: '#ef444420' };
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

    const isExpired = (endDate: string) => {
        return dayjs().isAfter(dayjs(endDate));
    };

    const isAvailable = (voucher: Voucher) => {
        const now = dayjs();
        const start = dayjs(voucher.startDate);
        const end = dayjs(voucher.endDate);
        const hasQuantity = voucher.quantity === null || voucher.quantity > voucher.usedCount;
        return voucher.status === 'ACTIVE' && now.isAfter(start) && now.isBefore(end) && hasQuantity;
    };

    // Filter vouchers
    const filteredVouchers = Array.isArray(vouchers) ? vouchers.filter(voucher => {
        const matchesSearch = voucher.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || voucher.status === filterStatus;
        return matchesSearch && matchesStatus;
    }) : [];

    // Tính toán stats
    const safeVouchers = Array.isArray(vouchers) ? vouchers : [];
    const stats = {
        total: safeVouchers.length,
        active: safeVouchers.filter(v => v.status === 'ACTIVE').length,
        inactive: safeVouchers.filter(v => v.status === 'INACTIVE').length,
        expired: safeVouchers.filter(v => isExpired(v.endDate)).length
    };

    const statusOptions = [
        { value: 'all', label: 'Tất cả' },
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Không hoạt động' }
    ];

    return (
        <div className="vouchers-page">
            {/* Header */}
            <div className="vouchers-header">
                <div className="header-left">
                    <h1>Quản lý Voucher</h1>
                    <p>Quản lý mã giảm giá và khuyến mãi</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchVouchers}>
                        <ReloadOutlined /> Làm mới
                    </button>
                    <button
                        className="btn-add"
                        onClick={() => {
                            resetForm();
                            setModalMode('add');
                            setIsModalOpen(true);
                        }}
                    >
                        <PlusOutlined /> Thêm voucher
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="vouchers-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <TagOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng voucher</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <PlayCircleOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đang hoạt động</h3>
                        <p>{stats.active}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                        <StopOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Không hoạt động</h3>
                        <p>{stats.inactive}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <WarningOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã hết hạn</h3>
                        <p>{stats.expired}</p>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-bar">
                    <SearchOutlined className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã voucher..."
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
                        {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Vouchers Table */}
            <div className="vouchers-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="vouchers-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Mã code</th>
                                <th>Loại giảm giá</th>
                                <th>Giá trị</th>
                                <th>Đơn hàng tối thiểu</th>
                                <th>Số lượng</th>
                                <th>Đã dùng</th>
                                <th>Ngày bắt đầu</th>
                                <th>Ngày kết thúc</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVouchers.length > 0 ? (
                                filteredVouchers.map((voucher) => {
                                    const status = getStatusInfo(voucher.status);
                                    const expired = isExpired(voucher.endDate);
                                    const available = isAvailable(voucher);
                                    return (
                                        <tr key={voucher.id} className={expired ? 'expired-row' : ''}>
                                            <td className="voucher-id">{voucher.id}</td>
                                            <td className="voucher-code">{voucher.code}</td>
                                            <td>{getDiscountTypeLabel(voucher.discountType)}</td>
                                            <td>
                                                {voucher.discountType === 'PERCENT'
                                                    ? `${voucher.discountValue}%`
                                                    : formatPrice(voucher.discountValue)}
                                            </td>
                                            <td>{voucher.minOrderValue > 0 ? formatPrice(voucher.minOrderValue) : 'Không'}</td>
                                            <td>{voucher.quantity === null ? '∞' : voucher.quantity}</td>
                                            <td>{voucher.usedCount}</td>
                                            <td>{formatDate(voucher.startDate)}</td>
                                            <td className={expired ? 'expired-date' : ''}>{formatDate(voucher.endDate)}</td>
                                            <td>
                                                <span className="status-badge" style={{ background: status.bg, color: status.color }}>
                                                    {status.icon} {status.label}
                                                </span>
                                                {available && !expired && voucher.status === 'ACTIVE' && (
                                                    <div className="available-badge">Có hiệu lực</div>
                                                )}
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="action-btn view" onClick={() => handleView(voucher)}>
                                                        <EyeOutlined />
                                                    </button>
                                                    <button className="action-btn edit" onClick={() => handleEdit(voucher)}>
                                                        <EditOutlined />
                                                    </button>
                                                    <button
                                                        className={`action-btn toggle ${voucher.status === 'ACTIVE' ? 'deactivate' : 'activate'}`}
                                                        onClick={() => handleToggleStatus(voucher)}
                                                    >
                                                        {voucher.status === 'ACTIVE' ? <StopOutlined /> : <PlayCircleOutlined />}
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => {
                                                            setSelectedVoucher(voucher);
                                                            setIsDeleteModalOpen(true);
                                                        }}
                                                    >
                                                        <DeleteOutlined />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr className="empty-row">
                                    <td colSpan={11}>
                                        <div className="empty-state">
                                            <TagOutlined />
                                            <p>Không tìm thấy voucher nào</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Thêm voucher mới' : 'Chỉnh sửa voucher'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label><TagOutlined /> Mã code *</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    placeholder="NHẬP MÃ CODE (VD: SALE10)"
                                    maxLength={20}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại giảm giá *</label>
                                    <select
                                        value={formData.discountType}
                                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                    >
                                        <option value="PERCENT">Phần trăm (%)</option>
                                        <option value="FIXED">Cố định (VNĐ)</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Giá trị giảm *</label>
                                    <input
                                        type="number"
                                        value={formData.discountValue}
                                        onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                                        placeholder={formData.discountType === 'PERCENT' ? 'Nhập % giảm' : 'Nhập số tiền giảm'}
                                        min="0"
                                        max={formData.discountType === 'PERCENT' ? 100 : undefined}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><MoneyCollectOutlined /> Đơn hàng tối thiểu</label>
                                <input
                                    type="number"
                                    value={formData.minOrderValue}
                                    onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
                                    placeholder="Nhập số tiền tối thiểu (0 = không giới hạn)"
                                    min="0"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số lượng voucher</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        placeholder="Nhập số lượng (0 = không giới hạn)"
                                        min="0"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Trạng thái</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Hoạt động</option>
                                        <option value="INACTIVE">Không hoạt động</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><CalendarOutlined /> Ngày bắt đầu *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>

                                <div className="form-group">
                                    <label><CalendarOutlined /> Ngày kết thúc *</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="btn-submit" onClick={handleSubmit}>
                                {modalMode === 'add' ? 'Thêm mới' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {isViewModalOpen && selectedVoucher && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết voucher</h2>
                            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-voucher">
                                <div className="voucher-card">
                                    <div className="voucher-code-large">{selectedVoucher.code}</div>
                                    <div className="voucher-value">
                                        {selectedVoucher.discountType === 'PERCENT'
                                            ? `${selectedVoucher.discountValue}% GIẢM`
                                            : formatPrice(selectedVoucher.discountValue)}
                                    </div>
                                </div>
                                <div className="view-info">
                                    <div className="info-row">
                                        <div className="info-label">ID:</div>
                                        <div className="info-value">{selectedVoucher.id}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Loại giảm giá:</div>
                                        <div className="info-value">{getDiscountTypeLabel(selectedVoucher.discountType)}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Đơn hàng tối thiểu:</div>
                                        <div className="info-value">
                                            {selectedVoucher.minOrderValue > 0 ? formatPrice(selectedVoucher.minOrderValue) : 'Không giới hạn'}
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Số lượng:</div>
                                        <div className="info-value">{selectedVoucher.quantity === null ? 'Không giới hạn' : selectedVoucher.quantity}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Đã sử dụng:</div>
                                        <div className="info-value">{selectedVoucher.usedCount}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Còn lại:</div>
                                        <div className="info-value">
                                            {selectedVoucher.quantity === null ? '∞' : selectedVoucher.quantity - selectedVoucher.usedCount}
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Ngày bắt đầu:</div>
                                        <div className="info-value">{formatDate(selectedVoucher.startDate)}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Ngày kết thúc:</div>
                                        <div className="info-value">{formatDate(selectedVoucher.endDate)}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Trạng thái:</div>
                                        <div className="info-value">
                                            <span className="status-badge" style={{ background: getStatusInfo(selectedVoucher.status).bg, color: getStatusInfo(selectedVoucher.status).color }}>
                                                {getStatusInfo(selectedVoucher.status).icon} {getStatusInfo(selectedVoucher.status).label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Ngày tạo:</div>
                                        <div className="info-value">{formatDate(selectedVoucher.createdAt)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>
                                Đóng
                            </button>
                            <button className="btn-submit" onClick={() => {
                                setIsViewModalOpen(false);
                                handleEdit(selectedVoucher);
                            }}>
                                <EditOutlined /> Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedVoucher && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xác nhận xóa</h2>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn xóa voucher <strong>"{selectedVoucher.code}"</strong>?
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

export default Vouchers;