import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom'; // Thêm useLocation
import './AdminLayout.css';
import Dashboard from './Dashboard/Dashboard';

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
  SunOutlined
} from '@ant-design/icons';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const menuItems = [
    {
      key: 'dashboard', icon: <DashboardOutlined />, label: 'Tổng quan', path: '/admin/dashboard'
    },
    { key: 'products', icon: <ShoppingOutlined />, label: 'Sản phẩm', path: '/admin/products' },
    { key: 'orders', icon: <ContainerOutlined />, label: 'Đơn hàng', path: '/admin/orders', badge: 12 },
    { key: 'categories', icon: <TagOutlined />, label: 'Danh mục', path: '/admin/categories' },
    { key: 'customers', icon: <UserOutlined />, label: 'Khách hàng', path: '/admin/customers' },
    { key: 'revenue', icon: <DollarOutlined />, label: 'Doanh thu', path: '/admin/revenue' },
    { key: 'statistics', icon: <BarChartOutlined />, label: 'Thống kê', path: '/admin/statistics' },
    { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
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
              }}            >
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
          <div className="nav-item">
            <span className="nav-icon"><LogoutOutlined /></span>
            {!collapsed && <span className="nav-label">Đăng xuất</span>}
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
            <div className="search-box">
              <SearchOutlined className="search-icon" />
              <input type="text" placeholder="Tìm kiếm..." />
            </div>

            <div className="notifications">
              <BellOutlined />
              <span className="notification-badge">3</span>
            </div>

            <div className="user-info">
              <div className="user-avatar">
                <img src="https://i.pravatar.cc/300?img=7" alt="Admin" />
              </div>
              {!collapsed && (
                <div className="user-details">
                  <span className="user-name">Nguyễn Văn A</span>
                  <span className="user-role">Quản trị viên</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="main-content">
          {<Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;