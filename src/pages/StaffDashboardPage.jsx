import React, { useEffect, useState } from 'react';
import '../styles/StaffDashboardPage.css';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../components/StaffLayout';

const API_BASE = '';

const StaffDashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [processingCount, setProcessingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE}/tickets/assigned`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!res.ok) throw new Error('Không thể tải dữ liệu vé.');
                const data = await res.json();
                setProcessingCount(data.filter(t => t.status === 'IN_PROGRESS').length);
                setCompletedCount(data.filter(t => t.status === 'COMPLETED').length);
            } catch (err) {
                setError(err.message || 'Lỗi không xác định');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <StaffLayout>
            <div className="dashboard-header">
                <h2>Chào mừng bạn trở lại!</h2>
                <span className="staff-badge">STAFF</span>
            </div>

            <div className="stats-cards">
                <div className="card">
                    <h3>Số lượng vé đang xử lý</h3>
                    <p>{loading ? '...' : error ? '-' : processingCount}</p>
                </div>
                <div className="card">
                    <h3>Số vé hoàn tất</h3>
                    <p>{loading ? '...' : error ? '-' : completedCount}</p>
                </div>
            </div>

            <div className="charts">
                <div className="chart-box">Biểu đồ A</div>
                <div className="chart-box">Biểu đồ B</div>
            </div>

            <div className="recent-submissions">
                <h3>Danh sách vé mới</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Mã vé</th>
                        <th>Người gửi</th>
                        <th>Thời gian</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>#12345</td>
                        <td>Nguyễn Văn A</td>
                        <td>17/06/2025</td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </StaffLayout>
    );
};

export default StaffDashboardPage;
