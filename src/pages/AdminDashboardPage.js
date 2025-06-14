import React, { useEffect, useState } from 'react';
import '../styles/AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await fetch('/admin/stats', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                } else if (res.status === 403) {
                    setError('❌ Bạn không có quyền truy cập trang này!');
                } else {
                    setError('❌ Lỗi khi lấy dữ liệu từ server');
                }
            } catch (err) {
                console.error('Lỗi:', err);
                setError('❌ Không thể kết nối server');
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="admin-dashboard">
            <h2>🎛️ Admin Dashboard</h2>

            {error && <p className="error-message">{error}</p>}

            {!error && !dashboardData && <p>⏳ Đang tải dữ liệu...</p>}

            {dashboardData && (
                <div className="dashboard-cards">
                    <div className="card">
                        <h3>Tổng số người dùng</h3>
                        <p>{dashboardData.totalUsers}</p>
                    </div>
                    <div className="card">
                        <h3>Tổng số ticket</h3>
                        <p>{dashboardData.totalTickets}</p>
                    </div>
                    <div className="card">
                        <h3>Số feedback</h3>
                        <p>{dashboardData.feedbackCount}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
