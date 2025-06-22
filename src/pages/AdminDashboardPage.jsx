import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [memberCount, setMemberCount] = useState(0);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch general stats
                const statsRes = await fetch('/admin/stats', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats({
                        tongXetNghiem: data.totalTickets || 0,
                        dangChoXetDuyet: data.feedbackCount || 0,
                        baiGuiGanDay: data.recentTickets || []
                    });
                } else {
                    throw new Error('Could not fetch stats');
                }

                // Fetch all users to count members
                const usersRes = await fetch('/admin/users', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    const members = users.filter(user => user.role === 'MEMBER');
                    setMemberCount(members.length);
                } else {
                    throw new Error('Could not fetch users');
                }

            } catch (err) {
                console.error('Lỗi:', err);
                if (err.response && err.response.status === 403) {
                    setError('❌ Bạn không có quyền truy cập trang này!');
                } else {
                    setError('❌ Lỗi khi lấy dữ liệu từ máy chủ');
                }
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <div className="admin-dashboard-container">
            <aside className="sidebar">
                <div className="logo">ADN ADMIN</div>
                <nav>
                    <ul>
                        <li onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
                            Bảng điều khiển
                        </li>
                        <li onClick={() => navigate('/admin/tests')} style={{ cursor: 'pointer' }}>
                            Xét nghiệm ADN
                        </li>
                        <li onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
                            Người dùng
                        </li>
                        <li onClick={() => navigate('/admin/reports')} style={{ cursor: 'pointer' }}>
                            Báo cáo
                        </li>
                        <li onClick={() => navigate('/admin/settings')} style={{ cursor: 'pointer' }}>
                            Cài đặt
                        </li>
                    </ul>
                </nav>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Bảng điều khiển quản trị</h2>
                    <div className="admin-badge">Quản trị viên</div>
                </header>

                {error && <p className="error-message">{error}</p>}
                {!error && !stats && <p>⏳ Đang tải dữ liệu...</p>}

                {stats && (
                    <>
                        <div className="stats-cards">
                            <div className="card">
                                <h3>Tổng số xét nghiệm ADN</h3>
                                <p>{stats.tongXetNghiem.toLocaleString()}</p>
                                <button onClick={() => navigate('/admin/tests')}>Xem chi tiết</button>
                            </div>
                            <div className="card">
                                <h3>Số người dùng đăng ký</h3>
                                <p>{memberCount.toLocaleString()}</p>
                                <button onClick={() => navigate('/admin/users')}>Xem chi tiết</button>
                            </div>
                            <div className="card">
                                <h3>Xét nghiệm chờ duyệt</h3>
                                <p>{stats.dangChoXetDuyet.toLocaleString()}</p>
                                <button onClick={() => navigate('/admin/feedbacks')}>Xem chi tiết</button>
                            </div>
                        </div>

                        <div className="charts">
                            <div className="chart-box">📊 Biểu đồ xét nghiệm theo tháng (đang phát triển)</div>
                            <div className="chart-box">📈 Phân loại trạng thái xét nghiệm (đang phát triển)</div>
                        </div>

                        <div className="recent-submissions">
                            <h3>Xét nghiệm ADN gần đây</h3>
                            {stats.baiGuiGanDay.length === 0 ? (
                                <p>Không có dữ liệu.</p>
                            ) : (
                                <table>
                                    <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {stats.baiGuiGanDay.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.id}</td>
                                            <td>{item.khachHang}</td>
                                            <td>{item.ngay}</td>
                                            <td>{item.trangThai}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;
