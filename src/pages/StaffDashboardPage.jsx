import React from 'react';
import '../styles/StaffDashboardPage.css';

const StaffDashboardPage = () => {
    return (
        <div className="staff-dashboard-container">
            <aside className="sidebar">
                <div className="logo">STAFF</div>
                <nav>
                    <ul>
                        <li>Trang chính</li>
                        <li>Tìm Kiếm</li>
                        <li>Quản lý Yêu Cầu</li>
                        <li>Hồ sơ cá nhân</li>
                        <li>Đăng xuất</li>
                    </ul>
                </nav>
            </aside>

            <main className="dashboard-content">
                <div className="dashboard-header">
                    <h2>Chào mừng bạn trở lại!</h2>
                    <span className="staff-badge">STAFF</span>
                </div>

                <div className="stats-cards">
                    <div className="card">
                        <h3>Số lượng vé đang xử lý</h3>
                        <p>5</p>
                    </div>
                    <div className="card">
                        <h3>Số vé hoàn tất</h3>
                        <p>20</p>
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
            </main>
        </div>
    );
};

export default StaffDashboardPage;
