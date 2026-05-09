import React, { useState, useEffect } from 'react';
import {
    SearchOutlined,
    ReloadOutlined,
    EditOutlined,
    DeleteOutlined,
    EyeOutlined,
    CloseOutlined,
    CheckOutlined,
    UserAddOutlined,
    LockOutlined,
    MailOutlined,
    PhoneOutlined,
    HomeOutlined,
    CalendarOutlined,
    CrownOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import './UsersAdmin.css';
interface User {
    userId: number;
    email: string;
    fullName: string;
    phone: string;
    address: string;
    dateOfBirth: string;
    role: number;
    isDeleted: boolean;
}

const Users = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        role: 1
    });

    // API Calls
    const API_BASE = 'http://localhost:8080/api/admin/users';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_BASE);
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            await axios.delete(`${API_BASE}/${selectedUser.userId}`);
            fetchUsers();
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const handleSubmit = async () => {
        try {
            if (modalMode === 'add') {
                await axios.post(API_BASE, formData);
            } else {
                const { password, ...updateData } = formData;
                await axios.put(`${API_BASE}/${selectedUser?.userId}`, updateData);
            }
            fetchUsers();
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setFormData({
            email: user.email,
            password: '',
            fullName: user.fullName || '',
            phone: user.phone || '',
            address: user.address || '',
            dateOfBirth: user.dateOfBirth || '',
            role: user.role
        });
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (user: User) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const resetForm = () => {
        setFormData({
            email: '',
            password: '',
            fullName: '',
            phone: '',
            address: '',
            dateOfBirth: '',
            role: 1
        });
        setSelectedUser(null);
    };

    const getRoleLabel = (role: number) => {
        switch (role) {
            case 0: return { text: 'Super Admin', color: '#ef4444', icon: <CrownOutlined /> };
            case 1: return { text: 'Người dùng', color: '#10b981', icon: <UserAddOutlined /> };
            case 2: return { text: 'Nhân viên', color: '#f59e0b', icon: <UserAddOutlined /> };
            default: return { text: 'Khách', color: '#94a3b8', icon: <UserAddOutlined /> };
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    const stats = {
        total: users.length,
        active: users.filter(u => !u.isDeleted).length,
        deleted: users.filter(u => u.isDeleted).length,
        admin: users.filter(u => u.role === 0).length
    };

    return (
        <div className="users-page">
            {/* Header */}
            <div className="users-header">
                <div className="header-left">
                    <h1>Quản lý người dùng</h1>
                    <p>Quản lý thông tin và phân quyền người dùng</p>
                </div>
                <div className="header-right">
                    <button className="btn-refresh" onClick={fetchUsers}>
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
                        <UserAddOutlined /> Thêm người dùng
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="users-stats">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#5b8cae20', color: '#5b8cae' }}>
                        <UserAddOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Tổng người dùng</h3>
                        <p>{stats.total}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: '#10b98120', color: '#10b981' }}>
                        <CheckOutlined />
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
                        <CrownOutlined />
                    </div>
                    <div className="stat-info">
                        <h3>Quản trị viên</h3>
                        <p>{stats.admin}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="search-bar">
                <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                        <CloseOutlined />
                    </button>
                )}
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                {loading ? (
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                ) : (
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Thông tin</th>
                                <th>Email</th>
                                <th>Số điện thoại</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => {
                                const role = getRoleLabel(user.role);
                                return (
                                    <tr key={user.userId} className={user.isDeleted ? 'deleted-row' : ''}>
                                        <td>{user.userId}</td>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                                </div>
                                                <div className="user-details">
                                                    <strong>{user.fullName || 'Chưa cập nhật'}</strong>
                                                    <span className="user-address">{user.address || 'Chưa có địa chỉ'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="email-cell">{user.email}</td>
                                        <td>{user.phone || '---'}</td>
                                        <td>
                                            <span className="role-badge" style={{ background: `${role.color}20`, color: role.color }}>
                                                {role.icon} {role.text}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${user.isDeleted ? 'inactive' : 'active'}`}>
                                                {user.isDeleted ? 'Đã khóa' : 'Hoạt động'}
                                            </span>
                                        </td>
                                        <td>
                                            {user.dateOfBirth ? dayjs(user.dateOfBirth).format('DD/MM/YYYY') : '---'}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="action-btn view" onClick={() => handleView(user)}>
                                                    <EyeOutlined />
                                                </button>
                                                {!user.isDeleted && (
                                                    <button className="action-btn edit" onClick={() => handleEdit(user)}>
                                                        <EditOutlined />
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    <DeleteOutlined />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{modalMode === 'add' ? 'Thêm người dùng mới' : 'Chỉnh sửa thông tin'}</h2>
                            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label><MailOutlined /> Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="example@email.com"
                                    disabled={modalMode === 'edit'}
                                />
                            </div>

                            {modalMode === 'add' && (
                                <div className="form-group">
                                    <label><LockOutlined /> Mật khẩu *</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Nhập mật khẩu"
                                    />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Họ và tên</label>
                                <input
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Nhập họ tên"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><PhoneOutlined /> Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="0987654321"
                                    />
                                </div>

                                <div className="form-group">
                                    <label><CalendarOutlined /> Ngày sinh</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label><HomeOutlined /> Địa chỉ</label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Nhập địa chỉ"
                                    rows={2}
                                />
                            </div>

                            <div className="form-group">
                                <label>Vai trò</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: parseInt(e.target.value) })}
                                >
                                    <option value={0}>Super Admin</option>
                                    <option value={1}>Người dùng</option>
                                    <option value={2}>Nhân viên</option>
                                </select>
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
            {isViewModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal-content view-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Thông tin chi tiết</h2>
                            <button className="modal-close" onClick={() => setIsViewModalOpen(false)}>
                                <CloseOutlined />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="view-avatar">
                                <div className="large-avatar">
                                    {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                                <h3>{selectedUser.fullName || 'Chưa cập nhật'}</h3>
                                <span className={`status-badge ${selectedUser.isDeleted ? 'inactive' : 'active'}`}>
                                    {selectedUser.isDeleted ? 'Đã khóa' : 'Hoạt động'}
                                </span>
                            </div>
                            <div className="view-info">
                                <div className="info-row">
                                    <div className="info-label"><MailOutlined /> Email:</div>
                                    <div className="info-value">{selectedUser.email}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label"><PhoneOutlined /> Số điện thoại:</div>
                                    <div className="info-value">{selectedUser.phone || '---'}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label"><HomeOutlined /> Địa chỉ:</div>
                                    <div className="info-value">{selectedUser.address || '---'}</div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label"><CalendarOutlined /> Ngày sinh:</div>
                                    <div className="info-value">
                                        {selectedUser.dateOfBirth ? dayjs(selectedUser.dateOfBirth).format('DD/MM/YYYY') : '---'}
                                    </div>
                                </div>
                                <div className="info-row">
                                    <div className="info-label"><CrownOutlined /> Vai trò:</div>
                                    <div className="info-value">
                                        <span className="role-badge" style={{ background: getRoleLabel(selectedUser.role).color + '20', color: getRoleLabel(selectedUser.role).color }}>
                                            {getRoleLabel(selectedUser.role).text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>
                                Đóng
                            </button>
                            {!selectedUser.isDeleted && (
                                <button className="btn-submit" onClick={() => {
                                    setIsViewModalOpen(false);
                                    handleEdit(selectedUser);
                                }}>
                                    <EditOutlined /> Chỉnh sửa
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedUser && (
                <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
                    <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Xác nhận {selectedUser.isDeleted ? 'khôi phục' : 'xóa'}</h2>
                        </div>
                        <div className="modal-body">
                            <p>
                                Bạn có chắc chắn muốn {selectedUser.isDeleted ? 'khôi phục' : 'xóa'} người dùng
                                <strong> "{selectedUser.fullName || selectedUser.email}"</strong>?
                            </p>
                            {!selectedUser.isDeleted && (
                                <p className="delete-warning">Hành động này sẽ chuyển người dùng vào thùng rác!</p>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                                Hủy
                            </button>
                            <button className="btn-delete" onClick={handleDelete}>
                                <DeleteOutlined /> {selectedUser.isDeleted ? 'Khôi phục' : 'Xóa'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Users;