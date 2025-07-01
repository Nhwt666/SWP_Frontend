import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboardPage.css';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [depositStats, setDepositStats] = useState(null);
    const [customerCount, setCustomerCount] = useState(0);
    const [pendingTicketCount, setPendingTicketCount] = useState(0);
    const [error, setError] = useState('');
    const [depositError, setDepositError] = useState('');
    const [ticketStats, setTicketStats] = useState([]);
    const [ticketStatusStats, setTicketStatusStats] = useState([]);
    const [recentCompletedTickets, setRecentCompletedTickets] = useState([]);
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

                let totalTickets = 0;
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    totalTickets = data.totalTickets || 0;
                    setStats({
                        tongXetNghiem: totalTickets,
                        baiGuiGanDay: data.recentTickets || [],
                        totalTicketSpending: data.totalTicketSpending || 0
                    });
                } else {
                    throw new Error('Could not fetch stats');
                }

                // Fetch all users to count customers
                const usersRes = await fetch('/admin/all-users', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    const customers = users.filter(user => (user.user ? user.user.role === 'CUSTOMER' : user.role === 'CUSTOMER'));
                    setCustomerCount(customers.length);
                } else {
                    throw new Error('Could not fetch users');
                }

                // Fetch all tickets to count pending
                const ticketsRes = await fetch('/admin/tickets', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (ticketsRes.ok) {
                    const tickets = await ticketsRes.json();
                    const pending = tickets.filter(ticket => ticket.status === 'PENDING');
                    setPendingTicketCount(pending.length);
                } else {
                    throw new Error('Could not fetch tickets');
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

        const fetchDepositStats = async () => {
            try {
                // Fetch deposit stats
                const depositStatsRes = await fetch('/admin/deposits/stats', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (depositStatsRes.ok) {
                    const data = await depositStatsRes.json();
                    setDepositStats(data);
                } else {
                    console.error('Lỗi khi tải thống kê tiền nạp. Trạng thái:', depositStatsRes.status);
                    try {
                        const errorData = await depositStatsRes.json();
                        console.error('Nội dung lỗi từ máy chủ:', errorData);
                    } catch (e) {
                        console.error('Không thể phân tích nội dung lỗi dưới dạng JSON.');
                    }
                    setDepositError('❌ Không thể tải thống kê tiền nạp');
                }
            } catch (err) {
                console.error('Lỗi kết nối đến máy chủ thống kê tiền nạp:', err);
                setDepositError('❌ Lỗi kết nối đến máy chủ thống kê tiền nạp');
            }
        };

        const fetchTicketStats = async () => {
            try {
                const res = await fetch('/admin/ticket-stats/last-5-days', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTicketStats(data);
                } else {
                    setTicketStats([]);
                }
            } catch (err) {
                setTicketStats([]);
            }
        };

        const fetchTicketStatusStats = async () => {
            try {
                const res = await fetch('/admin/ticket-stats/by-status', {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTicketStatusStats(data);
                } else {
                    setTicketStatusStats([]);
                }
            } catch (err) {
                setTicketStatusStats([]);
            }
        };

        // Fetch recent completed tickets for 7 days
        const fetchRecentCompletedTickets = async () => {
            try {
                const res = await fetch('/admin/recent-completed-tickets', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setRecentCompletedTickets(data);
                } else {
                    setRecentCompletedTickets([]);
                }
            } catch (err) {
                setRecentCompletedTickets([]);
            }
        };

        fetchDashboardData();
        fetchDepositStats();
        fetchTicketStats();
        fetchTicketStatusStats();
        fetchRecentCompletedTickets();
    }, []);

    return (
        <>
            <Header />
            <AdminLayout>
                <div className="dashboard-content">
                    <div className="dashboard-main-box">
                        <header className="dashboard-header">
                            <h2>Bảng điều khiển quản trị</h2>
                            <div className="admin-badge">Quản trị viên</div>
                        </header>

                        {error && <p className="error-message">{error}</p>}
                        {!error && !stats && <p>⏳ Đang tải dữ liệu...</p>}

                        {stats && (
                            <>
                                <div className="dashboard-row">
                                    <div className="stats-cards">
                                        <div className="card card-blue">
                                            <span className="card-icon">
                                                <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#e3f0ff"/><path d="M10 10c4 4 8 8 12 12" stroke="#1976d2" strokeWidth="2"/><path d="M22 10c-4 4-8 8-12 12" stroke="#1976d2" strokeWidth="2"/></svg>
                                            </span>
                                            <h3>Tổng số xét nghiệm ADN</h3>
                                            <p>{stats.tongXetNghiem.toLocaleString()}</p>
                                            <button onClick={() => navigate('/admin/tickets')}>Xem chi tiết</button>
                                        </div>
                                        <div className="card card-green">
                                            <span className="card-icon">
                                                <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#e0f7fa"/><path d="M16 18c-3 0-6 1.5-6 3v1h12v-1c0-1.5-3-3-6-3z" fill="#17a2b8"/><circle cx="16" cy="13" r="3" fill="#17a2b8"/></svg>
                                            </span>
                                            <h3>Số người dùng đăng ký</h3>
                                            <p>{customerCount.toLocaleString()}</p>
                                            <button onClick={() => navigate('/admin/users')}>Xem chi tiết</button>
                                        </div>
                                        <div className="card card-orange">
                                            <span className="card-icon">
                                                <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#fff3e0"/><path d="M16 10v6l4 2" stroke="#ff9800" strokeWidth="2" strokeLinecap="round"/></svg>
                                            </span>
                                            <h3>Xét nghiệm chờ duyệt</h3>
                                            <p>{pendingTicketCount.toLocaleString()}</p>
                                            <button onClick={() => navigate('/admin/tickets')}>Xem chi tiết</button>
                                        </div>
                                        <div className="card card-purple">
                                            <span className="card-icon">
                                                <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="#ede7f6"/><path d="M10 20c2-2 10-2 12 0" stroke="#7b47d8" strokeWidth="2"/><circle cx="16" cy="16" r="3" fill="#7b47d8"/></svg>
                                            </span>
                                            <h3>Tổng tiền đã nạp</h3>
                                            <p>{depositStats ? Number(depositStats.totalDeposits).toLocaleString('vi-VN') : 0}đ</p>
                                            <div style={{color:'#1976d2', fontWeight:600, fontSize:'1.1rem'}}>Tổng tiền xét nghiệm<br/>{stats && stats.totalTicketSpending !== undefined ? Number(stats.totalTicketSpending).toLocaleString('vi-VN') : 0}đ</div>
                                            <button onClick={() => navigate('/admin/topup-history')} style={{marginTop:18, background:'#7b47d8', color:'#fff', border:'none', borderRadius:10, padding:'12px 32px', fontWeight:700, fontSize:20, cursor:'pointer', boxShadow:'0 2px 8px #eee'}}>Xem chi tiết</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    {depositError && <p className="error-message" style={{textAlign: 'center', width: '100%'}}>{depositError}</p>}
                                </div>

                                <div className="dashboard-row">
                                    <div className="charts">
                                        <div className="chart-box" style={{background: '#f3e8ff', minWidth: 340, minHeight: 320, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                            <div style={{fontWeight: 700, color: '#6c47d8', marginBottom: 12, fontSize: '1.08rem'}}> Số lượng ticket tạo 5 ngày gần nhất</div>
                                            {ticketStats.length > 0 ? (
                                                <Bar
                                                    data={{
                                                        labels: ticketStats.map(item => item.date.slice(5)),
                                                        datasets: [
                                                            {
                                                                label: 'Số ticket',
                                                                data: ticketStats.map(item => item.count),
                                                                backgroundColor: '#6c47d8',
                                                                borderRadius: 8,
                                                            }
                                                        ]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { display: false },
                                                            title: { display: false }
                                                        },
                                                        scales: {
                                                            x: {
                                                                grid: { display: false },
                                                                title: { display: true, text: 'Ngày', color: '#6c47d8', font: { weight: 700 } }
                                                            },
                                                            y: {
                                                                beginAtZero: true,
                                                                grid: { color: '#e0e0e0' },
                                                                title: { display: true, text: 'Số ticket', color: '#6c47d8', font: { weight: 700 } }
                                                            }
                                                        }
                                                    }}
                                                    height={260}
                                                    width={340}
                                                    style={{maxHeight: 260, maxWidth: 340}}
                                                />
                                            ) : (
                                                <div style={{color: '#aaa'}}>Không có dữ liệu.</div>
                                            )}
                                        </div>
                                        <div className="chart-box" style={{background: '#f3e8ff'}}>
                                            <div style={{fontWeight: 700, color: '#6c47d8', marginBottom: 12, fontSize: '1.08rem'}}>🟣 Tỉ lệ trạng thái ticket</div>
                                            {ticketStatusStats.length > 0 ? (
                                                <Pie
                                                    data={{
                                                        labels: ticketStatusStats.map(item => {
                                                            switch(item.status) {
                                                                case 'PENDING': return 'Chờ xử lý';
                                                                case 'IN_PROGRESS': return 'Đang xử lý';
                                                                case 'RECEIVED': return 'Đã nhận kit';
                                                                case 'CONFIRMED': return 'Đã xác nhận Yêu Cầu';
                                                                case 'COMPLETED': return 'Hoàn thành';
                                                                case 'REJECTED': return 'Từ chối';
                                                                default: return item.status;
                                                            }
                                                        }),
                                                        datasets: [
                                                            {
                                                                data: ticketStatusStats.map(item => item.count),
                                                                backgroundColor: [
                                                                    '#fbc02d', // PENDING
                                                                    '#1976d2', // IN_PROGRESS
                                                                    '#43a047', // COMPLETED
                                                                    '#e53935'  // REJECTED
                                                                ],
                                                                borderWidth: 2,
                                                                borderColor: '#fff',
                                                            }
                                                        ]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        plugins: {
                                                            legend: {
                                                                display: true,
                                                                position: 'bottom',
                                                                labels: { color: '#6c47d8', font: { weight: 700 } }
                                                            },
                                                            title: { display: false }
                                                        }
                                                    }}
                                                    height={120}
                                                />
                                            ) : (
                                                <div style={{color: '#aaa'}}>Không có dữ liệu.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="dashboard-row">
                                    <div className="recent-submissions">
                                        <h3>Xét nghiệm ADN gần đây</h3>
                                        {recentCompletedTickets.length === 0 ? (
                                            <p>Không có dữ liệu.</p>
                                        ) : (
                                            <table>
                                                <thead>
                                                <tr>
                                                    <th>Mã đơn</th>
                                                    <th>Khách hàng</th>
                                                    <th>Ngày hoàn thành</th>
                                                    <th>Trạng thái</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {recentCompletedTickets.map(item => (
                                                    <tr key={item.id}>
                                                        <td>{item.id}</td>
                                                        <td>{item.customerName}</td>
                                                        <td>{item.completedAt ? new Date(item.completedAt).toLocaleString('vi-VN') : ''}</td>
                                                        <td>{item.status}</td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </AdminLayout>
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div><strong>Số Hotline:</strong> 1800.9999</div>
                        <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                        <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AdminDashboardPage;
