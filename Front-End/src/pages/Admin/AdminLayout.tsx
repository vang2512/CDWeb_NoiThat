import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
// @ts-ignore: CSS module import without type declarations
import './AdminLayout.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ContainerOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  TagOutlined,
  DollarOutlined,
  BarChartOutlined,
  BellOutlined,
  SearchOutlined,
  MoonOutlined,
  SunOutlined,
  StarOutlined,
  DownOutlined,
  UserSwitchOutlined,
  KeyOutlined
} from '@ant-design/icons';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Lấy thông tin user từ localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUserInfo(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Set active menu based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const activeItem = menuItems.find(item => currentPath.includes(item.path));
    if (activeItem) {
      setActiveMenu(activeItem.key);
    }
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    {
      key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan', path: '/admin/dashboard'
    },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Sản phẩm', path: '/admin/products' },
    { key: 'orders', icon: <ContainerOutlined />, label: 'Đơn hàng', path: '/admin/orders', badge: 12 },
    { key: 'categories', icon: <TagOutlined />, label: 'Danh mục', path: '/admin/categories' },
    { key: 'vouchers', icon: <TagOutlined />, label: 'Mã giảm giá', path: '/admin/vouchers' },
    { key: 'customers', icon: <UserOutlined />, label: 'Khách hàng', path: '/admin/customers' },
    { key: 'reviews', icon: <StarOutlined />, label: 'Đánh giá', path: '/admin/reviews' },
    { key: 'logs', icon: <BellOutlined />, label: 'Logs hệ thống', path: '/admin/logs' },
    { key: 'revenue', icon: <DollarOutlined />, label: 'Doanh thu', path: '/admin/revenue' },
    { key: 'statistics', icon: <BarChartOutlined />, label: 'Thống kê', path: '/admin/statistics' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Đăng xuất thành công!');
    setTimeout(() => {
      navigate('/login');
      window.location.reload();
    }, 500);
  };

  // Lấy tên và avatar từ userInfo
  const getUserName = () => {
    if (userInfo) {
      return userInfo.fullName || userInfo.name || userInfo.email || 'Admin';
    }
    return 'Admin';
  };

  const getUserAvatar = () => {
    if (userInfo?.avatar) {
      return userInfo.avatar;
    }
    // Tạo avatar từ tên
    const name = getUserName();
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4F46E5&color=fff&size=128`;
  };

  const getUserRole = () => {
    if (userInfo) {
      if (userInfo.role === 0) return 'Quản trị viên';
      if (userInfo.role === 1) return 'Nhân viên';
      return 'Khách hàng';
    }
    return 'Quản trị viên';
  };

  return (
    <div className={`admin-container ${isDarkMode ? 'dark' : ''}`}>
      {/* SIDEBAR */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          {!collapsed && (
            <div className="logo-area">
              <div className="logo-icon">🪑</div>
              <div className="logo-text">
                <span className="logo-title">Nội Thất</span>
                <span className="logo-sub">Admin</span>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="logo-icon-small">🪑</div>
          )}
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.key}
              className={`nav-item ${activeMenu === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveMenu(item.key);
                navigate(item.path);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={toggleTheme}>
            <span className="nav-icon">
              {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            </span>
            {!collapsed && <span className="nav-label">Chế độ tối</span>}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-wrapper">
        {/* TOP BAR */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="toggle-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <div className="page-title">
              <h2>{menuItems.find(item => item.key === activeMenu)?.label || 'Dashboard'}</h2>
            </div>
          </div>

          <div className="top-bar-right">
            {/* User Dropdown */}
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <div
                className="user-info"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="user-avatar">
                  <img src={getUserAvatar()} alt={getUserName()} />
                </div>

                {!collapsed && (
                  <div className="user-details">
                    <span className="user-name">{getUserName()}</span>
                    <span className="user-role">{getUserRole()}</span>
                  </div>
                )}

                {!collapsed && (
                  <DownOutlined className="dropdown-arrow" />
                )}
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      <img src={getUserAvatar()} alt={getUserName()} />
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{getUserName()}</span>
                      <span className="dropdown-user-email">{userInfo?.email || ''}</span>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item" onClick={() => navigate('/admin/profile')}>
                    <UserSwitchOutlined />
                    <span>Thông tin cá nhân</span>
                  </div>

                  <div className="dropdown-divider"></div>

                  <div className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogoutOutlined />
                    <span>Đăng xuất</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;