import React, { useState, useEffect } from 'react';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    ReloadOutlined,
    EyeOutlined,
    CloseOutlined,
    CheckOutlined,
    UploadOutlined,
    DollarOutlined,
    StockOutlined,
    ShoppingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { Product } from '../../../model/Product';
import './ProductsAdmin.css';


interface Category {
    id: number;
    categoryName: string;
}

const Products = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        quantity: 0,
        categoryId: 0,
        img: ''
    });

    // API Calls
    const API_BASE = 'http://localhost:8080/api/admin/foods';
    const CATEGORY_API = 'http://localhost:8080/api/categories';

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE);
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(CATEGORY_API);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;
        try {
            await axios.delete(`${API_BASE}/${selectedProduct.id}`);
            fetchProducts();
            setIsDeleteModalOpen(false);
            setSelectedProduct(null);
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            const productData = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                discount: formData.discount,
                quantity: formData.quantity,
                categoryId: formData.categoryId,
                img: formData.img
            };

            if (modalMode === 'add') {
                await axios.post(API_BASE, productData);
            } else {
                await axios.put(`${API_BASE}/${selectedProduct?.id}`, productData);
            }
            fetchProducts();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price,
            discount: product.discount || 0,
            quantity: product.quantity,
            categoryId: product.category?.id || 0,
            img: product.img || ''
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            discount: 0,
            quantity: 0,
            categoryId: 0,
            img: ''
        });
        setSelectedProduct(null);
    };

    const calculateSalePrice = (price: number, discount: number) => {
        return price - (price * discount / 100);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.categoryName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="products-page">
            {/* Header */}
            <div className="products-header">
                <div className="header-left">
                    <h1>Quản lý sản phẩm</h1>
                    <p>Quản lý danh sách sản phẩm nội thất</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchProducts}>
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
                        <PlusOutlined /> Thêm sản phẩm
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm theo tên hoặc danh mục..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <CloseOutlined />
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="products-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <ShoppingOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng sản phẩm</h3>
                        <p>{products.length}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <StockOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tồn kho</h3>
                        <p>{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#f59e0b20', color: '#f59e0b' }}>
                        <DollarOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Đã bán</h3>
                        <p>{products.reduce((sum, p) => sum + p.quantitySold, 0)}</p>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="products-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Hình ảnh</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá gốc</th>
                                <th>Giảm giá</th>
                                <th>Giá bán</th>
                                <th>Tồn kho</th>
                                <th>Đã bán</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>
                                        <img
                                            src={product.img || 'https://via.placeholder.com/60x60?text=No+Image'}
                                            alt={product.name}
                                            className="product-image"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=No+Image';
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <div className="product-name">
                                            <strong>{product.name}</strong>
                                            {product.description && (
                                                <span className="product-description">{product.description.substring(0, 40)}...</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className="category-badge">
                                            {product.category?.categoryName || 'Chưa phân loại'}
                                        </span>
                                    </td>
                                    <td className="price original">{formatPrice(product.price)}</td>
                                    <td className="discount">
                                        {product.discount > 0 ? (
                                            <span className="discount-badge">-{product.discount}%</span>
                                        ) : (
                                            <span className="no-discount">0%</span>
                                        )}
                                    </td>
                                    <td className="price sale">
                                        <strong>{formatPrice(calculateSalePrice(product.price, product.discount))}</strong>
                                    </td>
                                    <td>
                                        <span className={`quantity-badge ${product.quantity < 10 ? 'low' : product.quantity < 30 ? 'medium' : 'high'}`}>
                                            {product.quantity}
                                        </span>
                                    </td>
                                    <td className="sold">{product.quantitySold}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="action-btn edit" onClick={() => handleEdit(product)}>
                                                <EditOutlined />
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => {
                                                    setSelectedProduct(product);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                            >
                                                <DeleteOutlined />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Tên sản phẩm *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Nhập mô tả sản phẩm"
                                    rows={3}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá gốc *</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        placeholder="Nhập giá"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Giảm giá (%)</label>
                                    <input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) })}
                                        placeholder="0"
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số lượng *</label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        placeholder="Nhập số lượng"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Danh mục *</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                                    >
                                        <option value={0}>Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.categoryName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URL hình ảnh</label>
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

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedProduct && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xác nhận xóa</h2>
                        </div>
                        <div className="modal-body">
                            <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{selectedProduct.name}"</strong>?</p>
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

export default Products;