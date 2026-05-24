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
import { ProductDetails } from '../../../model/ProductDetail';
import toast from "react-hot-toast";
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
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [subPreviewImages, setSubPreviewImages] = useState<string[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [mainFile, setMainFile] = useState<File | null>(null);
    const [subFiles, setSubFiles] = useState<File[]>([]);
    const [detailProduct, setDetailProduct] = useState<ProductDetails | null>(null);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        discount: 0,
        quantity: 0,
        categoryId: 0,
        img: '',

        material: '',
        origin: '',
        standard: '',
        dimensions: ''
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
            const form = new FormData();

            // text fields
            form.append("name", formData.name);
            form.append("description", formData.description);
            form.append("price", String(formData.price));
            form.append("quantity", String(formData.quantity));
            form.append("discount", String(formData.discount));
            form.append("categoryId", String(formData.categoryId));

            form.append("material", formData.material);
            form.append("origin", formData.origin);
            form.append("standard", formData.standard);
            form.append("dimensions", formData.dimensions);

            // ❗ CHECK IMAGE (QUAN TRỌNG)
            if (!mainFile) {
                alert("Vui lòng chọn ảnh chính");
                return;
            }

            form.append("img", mainFile);

            // sub images
            subFiles.forEach(file => {
                form.append("subImages", file);
            });

            const res = await axios.post(API_BASE, form, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            toast.success(
                modalMode === "add"
                    ? "Thêm sản phẩm thành công!"
                    : "Cập nhật sản phẩm thành công!"
            );

            fetchProducts();
            setIsModalOpen(false);
            resetForm();

        } catch (error: any) {
            console.error("ERROR:", error.response?.data || error.message);
        }
    };

    const handleEdit = async (product: Product) => {
        const res = await axios.get<ProductDetails>(
            `${API_BASE}/${product.id}`
        );

        const data = res.data;

        setSelectedProduct(data); // dùng luôn detail

        setFormData({
            name: data.name,
            description: data.description || '',
            price: data.price,
            discount: data.discount || 0,
            quantity: data.quantity,
            categoryId: data.category?.id || 0,
            img: data.img || '',

            material: data.specification?.material || '',
            origin: data.specification?.origin || '',
            standard: data.specification?.standard || '',
            dimensions: data.specification?.dimensions || ''
        });

        setSubPreviewImages(
            data.subImages?.map((x: any) => x.image) || []
        );

        setPreviewImage(data.img || '');

        setModalMode('edit');
        setIsModalOpen(true);
    };
    const handleViewDetail = async (id: number) => {

        try {

            const response = await axios.get<ProductDetails>(
                `${API_BASE}/${id}`
            );

            setDetailProduct(response.data);

            setIsDetailModalOpen(true);

        } catch (error) {

            console.error('Error fetching detail:', error);

        }
    };
    const handleSubImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (files.length === 0) return;

        setSubFiles(prev => [...prev, ...files]);

        const previews = files.map(file => URL.createObjectURL(file));

        setSubPreviewImages(prev => [...prev, ...previews]);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: 0,
            discount: 0,
            quantity: 0,
            categoryId: 0,
            img: '',
            material: '',
            origin: '',
            standard: '',
            dimensions: ''
        });

        setSelectedProduct(null);

        setMainFile(null);
        setPreviewImage('');
        setSubFiles([]);
        setSubPreviewImages([]);
    };
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setMainFile(file);
        setPreviewImage(URL.createObjectURL(file));
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
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const currentProducts = filteredProducts.slice(startIndex, endIndex);

    return (
        <div className="products-page">
            {/* Header */}
            <div className="products-header">
                <div className="header-right">
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
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
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
                    <>
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
                                {currentProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.id}</td>
                                        <td>
                                            <img
                                                loading="lazy"
                                                src={
                                                    product.img && product.img.trim() !== ''
                                                        ? product.img
                                                        : 'https://static.vecteezy.com/system/resources/previews/048/910/778/large_2x/default-image-missing-placeholder-free-vector.jpg'
                                                }
                                                alt={product.name}
                                                className="product-image"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;

                                                    // tránh loop load lỗi
                                                    target.onerror = null;

                                                    // ảnh mặc định
                                                    target.src =
                                                        'https://static.vecteezy.com/system/resources/previews/048/910/778/large_2x/default-image-missing-placeholder-free-vector.jpg';
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
                                                <button
                                                    className="action-btn view"
                                                    onClick={() => handleViewDetail(product.id)}
                                                >
                                                    <EyeOutlined />
                                                </button>

                                                <button
                                                    className="action-btn edit"
                                                    onClick={() => handleEdit(product)}
                                                >
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

                        <div className="pagination-wrapper">
                            <div className="pagination">

                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(currentPage - 1)}
                                >
                                    Prev
                                </button>

                                {/* Trang đầu */}
                                {currentPage > 2 && (
                                    <>
                                        <button onClick={() => setCurrentPage(1)}>
                                            1
                                        </button>

                                        {currentPage > 3 && (
                                            <span className="pagination-dots">...</span>
                                        )}
                                    </>
                                )}

                                {/* Trang trước */}
                                {currentPage > 1 && (
                                    <button onClick={() => setCurrentPage(currentPage - 1)}>
                                        {currentPage - 1}
                                    </button>
                                )}

                                {/* Trang hiện tại */}
                                <button className="active">
                                    {currentPage}
                                </button>

                                {/* Trang sau */}
                                {currentPage < totalPages && (
                                    <button onClick={() => setCurrentPage(currentPage + 1)}>
                                        {currentPage + 1}
                                    </button>
                                )}

                                {/* Trang cuối */}
                                {currentPage < totalPages - 1 && (
                                    <>
                                        {currentPage < totalPages - 2 && (
                                            <span className="pagination-dots">...</span>
                                        )}

                                        <button onClick={() => setCurrentPage(totalPages)}>
                                            {totalPages}
                                        </button>
                                    </>
                                )}

                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                    Next
                                </button>

                            </div>
                        </div>

                    </>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div
                    className="pf-overlay"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="pf-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* HEADER */}
                        <div className="pf-header">
                            <div>
                                <h2>
                                    {modalMode === 'add'
                                        ? 'Thêm sản phẩm mới'
                                        : 'Chỉnh sửa sản phẩm'}
                                </h2>

                                <p className="pf-subtitle">
                                    Quản lý thông tin và hình ảnh sản phẩm
                                </p>
                            </div>

                            <button
                                className="pf-close"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <CloseOutlined />
                            </button>
                        </div>

                        {/* BODY */}
                        <div className="pf-body">

                            <div className="pf-grid">

                                {/* LEFT */}
                                <div className="pf-left">

                                    {/* IMAGE */}
                                    <div className="pf-card">

                                        <label className="pf-title">
                                            Hình ảnh sản phẩm
                                        </label>

                                        <div className="pf-upload">

                                            {previewImage || formData.img ? (
                                                <img
                                                    src={previewImage || formData.img}
                                                    alt="preview"
                                                    className="pf-preview"
                                                />
                                            ) : (
                                                <div className="pf-placeholder">
                                                    <UploadOutlined />
                                                    <p>Thêm ảnh</p>
                                                </div>
                                            )}

                                            <input
                                                name="mainImage"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                            />

                                        </div>

                                    </div>

                                    {/* SUB IMAGES */}
                                    <div className="pf-card">

                                        <label className="pf-title">
                                            Ảnh sản phẩm liên quan
                                        </label>

                                        <div className="pf-sub-wrapper">

                                            <label className="pf-sub-upload">
                                                <UploadOutlined />
                                                <span>Thêm ảnh</span>

                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*"
                                                    onChange={handleSubImagesUpload}
                                                />
                                            </label>

                                            <div className="pf-sub-grid">

                                                {subPreviewImages.map((img, index) => (
                                                    <div
                                                        className="pf-sub-item"
                                                        key={index}
                                                    >
                                                        <img src={img} alt="sub" />

                                                        <button
                                                            type="button"
                                                            className="pf-remove"
                                                            onClick={() => {
                                                                setSubPreviewImages(
                                                                    subPreviewImages.filter(
                                                                        (_, i) => i !== index
                                                                    )
                                                                );
                                                            }}
                                                        >
                                                            <CloseOutlined />
                                                        </button>
                                                    </div>
                                                ))}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* RIGHT */}
                                <div className="pf-right">

                                    {/* BASIC */}
                                    <div className="pf-section">

                                        <h3>Thông tin cơ bản</h3>

                                        <div className="pf-group">
                                            <label>Tên sản phẩm *</label>
                                            <input
                                                value={formData.name}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        name: e.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="pf-group">
                                            <label>Mô tả</label>
                                            <textarea
                                                rows={4}
                                                value={formData.description}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        description: e.target.value
                                                    })
                                                }
                                            />
                                        </div>

                                    </div>

                                    {/* PRICE */}
                                    <div className="pf-section">

                                        <h3>Giá & Kho</h3>

                                        <div className="pf-row">

                                            <div className="pf-group">
                                                <label>Giá gốc</label>
                                                <input
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            price: parseFloat(e.target.value)
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="pf-group">
                                                <label>Giảm giá</label>
                                                <input
                                                    type="number"
                                                    value={formData.discount}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            discount: parseFloat(e.target.value)
                                                        })
                                                    }
                                                />
                                            </div>

                                        </div>

                                        <div className="pf-row">

                                            <div className="pf-group">
                                                <label>Số lượng</label>
                                                <input
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            quantity: parseInt(e.target.value)
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="pf-group">
                                                <label>Danh mục</label>
                                                <select
                                                    value={formData.categoryId}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            categoryId: parseInt(e.target.value)
                                                        })
                                                    }
                                                >
                                                    <option value={0}>Chọn danh mục</option>
                                                    {categories.map((c) => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.categoryName}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                        </div>

                                    </div>

                                    {/* EXTRA */}
                                    <div className="pf-section">
                                        <h3>Thông tin bổ sung</h3>

                                        <div className="pf-row">

                                            <div className="pf-group">
                                                <label>Chất liệu</label>
                                                <input
                                                    placeholder="Ví dụ: Da, vải, nhựa..."
                                                    value={formData.material}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            material: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="pf-group">
                                                <label>Xuất xứ</label>
                                                <input
                                                    placeholder="Ví dụ: Việt Nam, Trung Quốc..."
                                                    value={formData.origin}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            origin: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>

                                        </div>

                                        <div className="pf-row">

                                            <div className="pf-group">
                                                <label>Tiêu chuẩn</label>
                                                <input
                                                    placeholder="Ví dụ: ISO 9001, tiêu chuẩn EU..."
                                                    value={formData.standard}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            standard: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>

                                            <div className="pf-group">
                                                <label>Kích thước</label>
                                                <input
                                                    placeholder="Dài x Rộng x Cao (cm) — ví dụ: 20 x 10 x 5 cm"
                                                    value={formData.dimensions}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            dimensions: e.target.value
                                                        })
                                                    }
                                                />
                                            </div>

                                        </div>
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* FOOTER */}
                        <div className="pf-footer">

                            <button
                                className="pf-btn-cancel"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Hủy
                            </button>

                            <button
                                className="pf-btn-submit"
                                onClick={handleSubmit}
                            >
                                <CheckOutlined />
                                {modalMode === 'add' ? 'Thêm sản phẩm' : 'Cập nhật'}
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
            {isDetailModalOpen && detailProduct && (

                <div
                    className="modal-overlay"
                    onClick={() => setIsDetailModalOpen(false)}
                >

                    <div
                        className="modal-content detail-modal"
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="modal-header">

                            <h2>Chi tiết sản phẩm</h2>

                            <button
                                className="modal-close"
                                onClick={() => setIsDetailModalOpen(false)}
                            >
                                <CloseOutlined />
                            </button>

                        </div>

                        <div className="modal-body">

                            {/* Ảnh chính */}
                            <div className="detail-main-image">

                                <img
                                    src={detailProduct.img}
                                    alt={detailProduct.name}
                                />

                            </div>

                            {/* Ảnh phụ */}
                            {detailProduct.subImages?.length > 0 && (

                                <div className="sub-images">

                                    {detailProduct.subImages.map((img) => (

                                        <img
                                            key={img.id}
                                            src={img.image}
                                            alt="sub"
                                            className="sub-image"
                                        />

                                    ))}

                                </div>

                            )}

                            {/* Thông tin */}
                            <div className="detail-info">

                                <h3>{detailProduct.name}</h3>

                                <p>{detailProduct.description}</p>
                                <p>
                                    <strong>Danh mục:</strong>{" "}
                                    {detailProduct.category?.categoryName || 'Chưa phân loại'}
                                </p>
                                <p>
                                    <strong>Giá:</strong>{" "}
                                    {formatPrice(detailProduct.price)}
                                </p>

                                <p>
                                    <strong>Giảm giá:</strong>{" "}
                                    {detailProduct.discount}%
                                </p>

                                <p>
                                    <strong>Tồn kho:</strong>{" "}
                                    {detailProduct.quantity}
                                </p>

                                <p>
                                    <strong>Đã bán:</strong>{" "}
                                    {detailProduct.quantitySold}
                                </p>

                            </div>

                            {/* Specification */}
                            {detailProduct.specification && (

                                <div className="specification-box">

                                    <h3>Thông tin sản phẩm</h3>

                                    <div className="spec-grid">

                                        <div>
                                            <strong>Chất liệu</strong>

                                            <p>
                                                {detailProduct.specification.material}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>Xuất xứ</strong>

                                            <p>
                                                {detailProduct.specification.origin}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>Tiêu chuẩn</strong>

                                            <p>
                                                {detailProduct.specification.standard}
                                            </p>
                                        </div>

                                        <div>
                                            <strong>Kích thước</strong>

                                            <p>
                                                {detailProduct.specification.dimensions}
                                            </p>
                                        </div>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
};

export default Products;