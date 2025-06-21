import React, { useEffect, useState } from 'react';
import '../styles/StaffDashboardPage.css';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../components/StaffLayout';

const API_BASE = '';

const StaffDashboardPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [pendingCount, setPendingCount] = useState(0);
    const [processingCount, setProcessingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [pendingTickets, setPendingTickets] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError('');
            try {
                // Lấy danh sách ticket PENDING chưa có staff
                const resPending = await fetch(`/tickets/unassigned`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!resPending.ok) throw new Error('Không thể tải dữ liệu vé.');
                const dataPending = await resPending.json();
                setPendingCount(dataPending.length);
                setPendingTickets(dataPending);

                // Lấy danh sách ticket IN_PROGRESS
                const resInProgress = await fetch(`/tickets/status/IN_PROGRESS`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!resInProgress.ok) throw new Error('Không thể tải dữ liệu vé.');
                const dataInProgress = await resInProgress.json();
                setProcessingCount(dataInProgress.length);

                // Lấy danh sách ticket COMPLETED
                const resCompleted = await fetch(`/tickets/status/COMPLETED`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!resCompleted.ok) throw new Error('Không thể tải dữ liệu vé.');
                const dataCompleted = await resCompleted.json();
                setCompletedCount(dataCompleted.length);
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
                    <h3>Yêu Cầu Chưa Xử Lý</h3>
                    <p>{loading ? '...' : error ? '-' : pendingCount}</p>
                </div>
                <div className="card">
                    <h3>Yêu Cầu Đang Xử Lý</h3>
                    <p>{loading ? '...' : error ? '-' : processingCount}</p>
                </div>
                <div className="card">
                    <h3>Yêu Cầu Đã Hoàn Thành</h3>
                    <p>{loading ? '...' : error ? '-' : completedCount}</p>
                </div>
            </div>

            <div className="charts">
                <div className="chart-box">Biểu đồ A</div>
                <div className="chart-box">Biểu đồ B</div>
            </div>

            <div className="recent-submissions">
                <h3>Danh sách Yêu Cầu Mới</h3>
                <table>
                    <thead>
                    <tr>
                        <th>Mã Yêu Cầu</th>
                        <th>Người gửi</th>
                        <th>Thời gian</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading ? (
                        <tr><td colSpan="3">Đang tải...</td></tr>
                    ) : error ? (
                        <tr><td colSpan="3" style={{color:'red'}}>{error}</td></tr>
                    ) : pendingTickets.length === 0 ? (
                        <tr><td colSpan="3">Không có yêu cầu mới chưa xử lý.</td></tr>
                    ) : (
                        pendingTickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>#{ticket.id}</td>
                                <td>{ticket.customer?.fullName || ticket.customer?.name || ''}</td>
                                <td>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleString('vi-VN') : ''}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </StaffLayout>
    );
};

export default StaffDashboardPage;
