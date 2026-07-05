import React, { useState, useEffect } from 'react';
import {
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseOutlined,
    PlusOutlined,
    FolderOutlined,
    FolderOpenOutlined,
    TagOutlined,
    PictureOutlined,
    CheckOutlined
} from '@ant-design/icons';
import adminApi from "../../../api/Admin/Admin";
import './CategoriesAdmin.css';

interface Category {
    id: number;
    categoryName: string;
    img: string;
    isDeleted: boolean;
}

const Categories = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        categoryName: '',
        img: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            // Sử dụng adminApi thay vì axios trực tiếp
            const response = await adminApi.getCategories();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        try {
            await adminApi.deleteCategory(selectedCategory.id);
            fetchCategories();
            setIsDeleteModalOpen(false);
            setSelectedCategory(null);
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Không thể xóa danh mục đang có sản phẩm!');
        }
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();

            data.append("categoryName", formData.categoryName);
            data.append("imgUrl", formData.img);

            if (modalMode === "add") {
                await adminApi.createCategory(data);
            } else {
                await adminApi.updateCategory(selectedCategory!.id, data);
            }

            fetchCategories();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            categoryName: category.categoryName,
            img: category.img || ''
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (category: Category) => {
        setSelectedCategory(category);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            categoryName: '',
            img: ''
        });
        setSelectedCategory(null);
    };

    const filteredCategories = categories.filter(category =>
        category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: categories.length,
        active: categories.filter(c => !c.isDeleted).length,
        deleted: categories.filter(c => c.isDeleted).length,
        hasImage: categories.filter(c => c.img && c.img.trim() !== '').length
    };

    return (
        <div className="categories-page">
            {/* Header */}
            <div className="categories-header">
                <div className="header-left">
                    <h1>Quản lý danh mục</h1>
                    <p>Quản lý danh mục sản phẩm nội thất</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchCategories}>
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
                        <PlusOutlined /> Thêm danh mục
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="categories-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <FolderOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng danh mục</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <FolderOpenOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đang hoạt động</h3>
                        <p>{stats.active}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#ef444420', color: '#ef4444' }}>
                        <DeleteOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã xóa</h3>
                        <p>{stats.deleted}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <PictureOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Có hình ảnh</h3>
                        <p>{stats.hasImage}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <CloseOutlined />
                    </button>
                )}
            </div>

            {/* Categories Table */}
            <div className="categories-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Hình ảnh</th>
                                <th>Tên danh mục</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map((category) => (
                                <tr key={category.id} className={category.isDeleted ? 'deleted-row' : ''}>
                                    <td className="category-id">{category.id}</td>
                                    <td className="category-image-cell">
                                        {category.img ? (
                                            <img
                                                src={category.img}
                                                alt={category.categoryName}
                                                className="category-image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=No+Image';
                                                }}
                                            />
                                        ) : (
                                            <div className="no-image-placeholder">
                                                <PictureOutlined />
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="category-name-cell">
                                            <TagOutlined className="category-icon" />
                                            <span className="category-name">{category.categoryName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${category.isDeleted ? 'inactive' : 'active'}`}>
                                            {category.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn view" onClick={() => handleView(category)}>
                                                <EyeOutlined />
                                            </button>
                                            {!category.isDeleted && (
                                                <button className="action-btn edit" onClick={() => handleEdit(category)}>
                                                    <EditOutlined />
                                                </button>
                                            )}
                                            <button
                                                className="action-btn delete"
                                                onClick={() => {
                                                    setSelectedCategory(category);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <DeleteOutlined />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredCategories.length === 0 && (
                                <tr className="empty-row">
                                    <td colSpan={5}>
                                        <div className="empty-state">
                                            <TagOutlined />
                                            <p>Không tìm thấy danh mục nào</p>
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
                            <h2>{modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label><TagOutlined /> Tên danh mục *</label>
                                <input
                                    type="text"
                                    value={formData.categoryName}
                                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                                    placeholder="Nhập tên danh mục"
                                />
                            </div>

                            <div className="form-group">
                                <label><PictureOutlined /> URL hình ảnh</label>
                                <input
                                    type="text"
                                    value={formData.img}
                                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            {formData.img && (
                                <div className="image-preview">
                                    <img src={formData.img} alt="Preview" />
                                </div>
                            )}
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
            {isViewModalOpen && selectedCategory && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Thông tin chi tiết</h2>
                            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-category">
                                <div className="category-image-large">
                                    {selectedCategory.img ? (
                                        <img src={selectedCategory.img} alt={selectedCategory.categoryName} />
                                    ) : (
                                        <div className="no-image-large">
                                            <PictureOutlined />
                                        </div>
                                    )}
                                </div>
                                <div className="view-info">
                                    <div className="info-row">
                                        <div className="info-label">ID:</div>
                                        <div className="info-value">{selectedCategory.id}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label"><TagOutlined /> Tên danh mục:</div>
                                        <div className="info-value">{selectedCategory.categoryName}</div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label"><PictureOutlined /> Hình ảnh:</div>
                                        <div className="info-value">
                                            {selectedCategory.img ? (
                                                <a href={selectedCategory.img} target="_blank" rel="noopener noreferrer">
                                                    {selectedCategory.img}
                                                </a>
                                            ) : (
                                                'Chưa có hình ảnh'
                                            )}
                                        </div>
                                    </div>
                                    <div className="info-row">
                                        <div className="info-label">Trạng thái:</div>
                                        <div className="info-value">
                                            <span className={`status-badge ${selectedCategory.isDeleted ? 'inactive' : 'active'}`}>
                                                {selectedCategory.isDeleted ? 'Đã xóa' : 'Hoạt động'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>
                                Đóng
                            </button>
                            {!selectedCategory.isDeleted && (
                                <button className="btn-submit" onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedCategory);
                                }}>
                                    <EditOutlined /> Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedCategory && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xác nhận {selectedCategory.isDeleted ? 'khôi phục' : 'xóa'}</h2>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn {selectedCategory.isDeleted ? 'khôi phục' : 'xóa'} danh mục
                                <strong> "{selectedCategory.categoryName}"</strong>?
                            </p>
                            {!selectedCategory.isDeleted && (
                                <p className="delete-warning">
                                    <strong>Cảnh báo:</strong> Danh mục này sẽ bị xóa khỏi hệ thống!
                                </p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                <DeleteOutlined /> {selectedCategory.isDeleted ? 'Khôi phục' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Categories;