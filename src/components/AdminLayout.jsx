// src/components/AdminLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminLayout.css';

const AdminLayout = ({ children }) => {
    const navigate = useNavigate();

    return (
        <div className="admin-dashboard-container">
            <aside className="sidebar">
                <div className="logo">ADN ADMIN</div>
                <nav>
                    <ul>
                        <li onClick={() => navigate('/admin/dashboard')}>Bảng điều khiển</li>
                        <li onClick={() => navigate('/admin/users')}>Người dùng</li>
                        <li>Xét nghiệm ADN</li>
                        <li onClick={() => navigate('/admin/blog')}>Quản lý blog</li>
                        <li>Cài đặt</li>
                    </ul>
                </nav>
            </aside>
            <main className="dashboard-content">
                {children}
            </main>
        </div>
    );
};

export default AdminLayout;
