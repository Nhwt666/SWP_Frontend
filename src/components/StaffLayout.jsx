import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/StaffDashboardPage.css';

const StaffLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isRequestsPage = location.pathname.includes('/staff/requests');

    useEffect(() => {
        if (isRequestsPage) {
            document.body.classList.add('requests-page');
        }
        
        return () => {
            document.body.classList.remove('requests-page');
        };
    }, [isRequestsPage]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div className="staff-dashboard-container" style={{ width: '100%', display: 'flex', flexDirection: 'row' }}>
            <aside className="sidebar" style={{ 
                width: '220px', 
                minWidth: '220px', 
                maxWidth: '220px',
                position: 'fixed',
                left: 0,
                top: '80px',
                bottom: 0,
                zIndex: 100,
                overflowY: 'auto',
                height: 'calc(100vh - 80px)'
            }}>
                <div className="staff-badge-animated">STAFF</div>
                <nav>
                    <ul>
                        <li style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate('/staff/dashboard')}>Trang chính</li>
                        <li onClick={() => navigate('/staff/requests')} style={{ cursor: 'pointer', fontWeight: 600 }}>Quản lý Yêu Cầu</li>
                        <li onClick={() => navigate('/profile')} style={{ cursor: 'pointer', fontWeight: 600 }}>Hồ sơ cá nhân</li>
                        <li onClick={handleLogout} style={{ cursor: 'pointer', fontWeight: 600, color: '#e53935' }}>Đăng xuất</li>
                    </ul>
                </nav>
            </aside>
            <main style={{ 
                marginLeft: '220px', 
                width: 'calc(100% - 220px)',
                padding: '20px',
                boxSizing: 'border-box',
                overflowX: 'hidden'
            }}>
                {children}
            </main>
        </div>
    );
};

export default StaffLayout; 