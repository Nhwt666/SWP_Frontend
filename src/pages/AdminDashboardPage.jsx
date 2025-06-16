import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardPage.css';

const AdminDashboardPage = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
                    setDashboardData({
                        tongXetNghiem: data.totalTickets || 0,
                        nguoiDungDangKy: data.totalUsers || 0,
                        dangChoXetDuyet: data.feedbackCount || 0,
                        baiGuiGanDay: [
                            { id: '#001', khachHang: 'Nguyễn Văn A', ngay: '2025-05-25', trangThai: 'Hoàn thành' },
                            { id: '#002', khachHang: 'Trần Thị B', ngay: '2025-05-24', trangThai: 'Đang xử lý' }
                        ]
                    });
                } else if (res.status === 403) {
                    setError('❌ Bạn không có quyền truy cập trang này!');
                } else {
                    setError('❌ Lỗi khi lấy dữ liệu từ máy chủ');
                }
            } catch (err) {
                console.error('Lỗi:', err);
                setError('❌ Không thể kết nối đến máy chủ');
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
                        <li>Xét nghiệm ADN</li>
                        <li>Người dùng</li>
                        <li>Báo cáo</li>
                        <li>Cài đặt</li>
                    </ul>
                </nav>
            </aside>

            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h2>Bảng điều khiển quản trị</h2>
                    <div className="admin-badge">Quản trị viên</div>
                </header>

                {error && <p className="error-message">{error}</p>}
                {!error && !dashboardData && <p>⏳ Đang tải dữ liệu...</p>}

                {dashboardData && (
                    <>
                        <div className="stats-cards">
                            <div className="card">
                                <h3>Tổng số xét nghiệm ADN</h3>
                                <p>{dashboardData.tongXetNghiem.toLocaleString()}</p>
                                <button>Xem chi tiết</button>
                            </div>
                            <div className="card">
                                <h3>Số người dùng đăng ký</h3>
                                <p>{dashboardData.nguoiDungDangKy.toLocaleString()}</p>
                                <button>Xem chi tiết</button>
                            </div>
                            <div className="card">
                                <h3>Xét nghiệm chờ duyệt</h3>
                                <p>{dashboardData.dangChoXetDuyet.toLocaleString()}</p>
                                <button>Xem chi tiết</button>
                            </div>
                        </div>

                        <div className="charts">
                            <div className="chart-box">📊 Biểu đồ xét nghiệm theo tháng (đang phát triển)</div>
                            <div className="chart-box">📈 Phân loại trạng thái xét nghiệm (đang phát triển)</div>
                        </div>

                        <div className="recent-submissions">
                            <h3>Xét nghiệm ADN gần đây</h3>
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
                                {dashboardData.baiGuiGanDay.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.khachHang}</td>
                                        <td>{item.ngay}</td>
                                        <td>{item.trangThai}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminDashboardPage;
