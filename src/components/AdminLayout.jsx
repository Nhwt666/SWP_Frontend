// src/components/AdminLayout.jsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Bảng điều khiển' },
        { path: '/admin/tickets', label: 'Xét nghiệm ADN' },
        { path: '/admin/users', label: 'Người dùng' },
        { path: '/admin/blog', label: 'Quản lý blog' },
        { path: '/admin/reports', label: 'Đánh Giá' },
        { path: '/admin/settings', label: 'Cài đặt' }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="admin-dashboard-container">
            <aside className="sidebar">
                <div className="logo">ADN ADMIN</div>
                <nav>
                    <ul>
                        {menuItems.map((item) => (
                            <li 
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={isActive(item.path) ? 'active' : ''}
                                style={{
                                    cursor: 'pointer',
                                    padding: '12px 16px',
                                    margin: '4px 0',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s',
                                    backgroundColor: isActive(item.path) ? '#1976d2' : 'transparent',
                                    color: isActive(item.path) ? '#fff' : '#333',
                                    fontWeight: isActive(item.path) ? '600' : '400'
                                }}
                                onMouseOver={(e) => {
                                    if (!isActive(item.path)) {
                                        e.target.style.backgroundColor = '#f5f5f5';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isActive(item.path)) {
                                        e.target.style.backgroundColor = 'transparent';
                                    }
                                }}
                            >
                                {item.label}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-content with-sidebar">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
