import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StaffDashboardPage.css';

const StaffLayout = ({ children }) => {
    const navigate = useNavigate();
    return (
        <>
            <div className="staff-dashboard-container">
                <aside className="sidebar">
                    <div className="logo">STAFF</div>
                    <nav>
                        <ul>
                            <li style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>Trang chính</li>
                            <li onClick={() => navigate('/staff/requests')} style={{ cursor: 'pointer', fontWeight: 600 }}>Quản lý Yêu Cầu</li>
                            <li>Hồ sơ cá nhân</li>
                            <li>Đăng xuất</li>
                        </ul>
                    </nav>
                </aside>
                <main className="dashboard-content">
                    {children}
                </main>
            </div>
        </>
    );
};

export default StaffLayout; 