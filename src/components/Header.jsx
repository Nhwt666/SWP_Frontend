import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/Header.css';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '../hooks/useNotifications';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fullName, wallet } = useContext(UserContext);
    const [showDropdown, setShowDropdown] = useState(false);
    const [role, setRole] = useState(localStorage.getItem('role') || '');
    const [showNotiDropdown, setShowNotiDropdown] = useState(false);
    
    const {
        notifications,
        unreadCount,
        loading: loadingNoti,
        markAllAsRead,
        formatTime
    } = useNotifications();

    const email = localStorage.getItem('email') || '';
    const isLoggedIn = !!email;
    const dropdownRef = useRef();
    const notiDropdownRef = useRef();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const refreshWalletAndRole = async () => {
        try {
            const res = await fetch('/auth/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const user = await res.json();
                const safeBalance = isNaN(Number(user.walletBalance)) ? 0 : Number(user.walletBalance);
                localStorage.setItem('wallet', safeBalance);
                localStorage.setItem('role', user.role);
                setRole(user.role);
            }
        } catch (err) {
            console.error('❌ Lỗi cập nhật thông tin:', err);
        }
    };

    useEffect(() => {
        if (isLoggedIn && localStorage.getItem('token')) {
            refreshWalletAndRole();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notiDropdownRef.current && !notiDropdownRef.current.contains(e.target)) {
                setShowNotiDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Smooth scroll to blog section if on homepage
    const handleBlogClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const el = document.getElementById('blog-section');
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate('/#blog-section');
        }
    };

    // Đánh dấu đã đọc khi mở dropdown nếu có noti chưa đọc
    useEffect(() => {
        if (showNotiDropdown && unreadCount > 0) {
            markAllAsRead();
        }
    }, [showNotiDropdown, unreadCount, markAllAsRead]);

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-title">
                    {role === 'ADMIN' ? (
                        <Link to="/admin/dashboard">
                            <img src="/logo.png" alt="Logo" className="logo" />
                        </Link>
                    ) : (
                        <a href="/" onClick={e => { e.preventDefault(); window.location.replace('/'); }}>
                            <img src="/logo.png" alt="Logo" className="logo" />
                        </a>
                    )}
                    <h1>Trung Tâm Xét nghiệm ADN</h1>
                </div>

                <nav className="auth-links">
                    {isLoggedIn ? (
                        <div className="user-info-container" ref={dropdownRef}>
                            <div className="user-info-text">
                                <div className="user-greeting">
                                    {role === 'STAFF' ? (
                                        'Xin chào, Nhân viên'
                                    ) : (
                                        `Xin chào, ${fullName || 'Người dùng'}${role === 'ADMIN' ? ' (Quản trị)' : ''}`
                                    )}
                                </div>
                                {role !== 'ADMIN' && (
                                    <div className="user-wallet">Ví: {(typeof wallet === 'number' && !isNaN(wallet) ? wallet : 0).toLocaleString()}đ</div>
                                )}
                            </div>
                            <div className="avatar-container" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div
                                    className="avatar"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    {(fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="noti-bell-container" style={{ position: 'relative' }} ref={notiDropdownRef}>
                                    <FaBell className="noti-bell-icon" style={{ fontSize: 24, cursor: 'pointer' }} onClick={() => setShowNotiDropdown(v => !v)} />
                                    {/* Nếu có notification chưa đọc, hiển thị chấm đỏ */}
                                    {unreadCount > 0 && (
                                        <span className="noti-dot" style={{
                                            position: 'absolute',
                                            top: 2,
                                            right: 2,
                                            width: 9,
                                            height: 9,
                                            background: '#e53935',
                                            borderRadius: '50%',
                                            border: '2px solid #fff',
                                            display: 'inline-block'
                                        }}></span>
                                    )}
                                    {showNotiDropdown && (
                                        <div className="noti-dropdown" style={{
                                            position: 'absolute',
                                            top: 32,
                                            right: 0,
                                            minWidth: 260,
                                            background: '#fff',
                                            boxShadow: '0 4px 18px rgba(30,58,138,0.13)',
                                            borderRadius: 12,
                                            zIndex: 2000,
                                            padding: '10px 0',
                                            maxHeight: 340,
                                            overflowY: 'auto'
                                        }}>
                                            <div style={{fontWeight:700, fontSize:15, padding:'0 16px 8px 16px', color:'#1976d2'}}>Thông báo</div>
                                            {loadingNoti ? (
                                                <div style={{padding:'16px', color:'#888', fontStyle:'italic'}}>Đang tải...</div>
                                            ) : notifications.length === 0 ? (
                                                <div style={{padding:'16px', color:'#888', fontStyle:'italic'}}>Không có thông báo mới.</div>
                                            ) : notifications.map(noti => (
                                                <div key={noti.id} style={{
                                                    padding: '10px 16px',
                                                    borderBottom: '1px solid #f0f4fa',
                                                    color: noti.type === 'error' ? '#e53935' : noti.type === 'warning' ? '#fbc02d' : '#1976d2',
                                                    fontWeight: noti.isRead ? 500 : 700,
                                                    fontSize: 14,
                                                    background: noti.isRead ? '#f4f7fc' : '#fff5f5',
                                                    cursor: noti.ticketId ? 'pointer' : 'default'
                                                }}
                                                onClick={() => {
                                                    if (noti.ticketId) {
                                                        navigate('/test-history', { state: { ticketId: noti.ticketId } });
                                                    }
                                                }}
                                                >
                                                    <div>{noti.message}</div>
                                                    <div style={{fontSize:12, color:'#888', marginTop:2}}>{formatTime(noti.createdAt)}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            {showDropdown && (
                                <div className="dropdown-menu">
                                    {role === 'ADMIN' ? (
                                        <>
                                            <button onClick={() => navigate('/admin/dashboard')}>Bảng điều khiển</button>
                                            <button onClick={handleLogout}>Đăng xuất</button>
                                        </>
                                    ) : role === 'STAFF' ? (
                                        <>
                                            <button onClick={() => navigate('/staff/dashboard')}>Trang chính</button>
                                            <button onClick={handleLogout}>Đăng xuất</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => navigate('/profile')}>Thông tin của tôi</button>
                                            <button onClick={() => navigate('/update-profile')}>Cập nhật thông tin</button>
                                            <button onClick={() => navigate('/topup-history')}>Lịch sử nạp tiền</button>
                                            <button onClick={() => navigate('/test-history')}>Lịch sử xét nghiệm</button>
                                            <button onClick={() => navigate('/topup')}>Nạp tiền</button>
                                            <button onClick={handleLogout}>Đăng xuất</button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/register">Đăng ký</Link>
                        </>
                    )}
                </nav>
            </div>

            {role !== 'ADMIN' && role !== 'STAFF' && (
                <nav className="main-nav">
                    <div className="main-nav-container">
                        <a href="/" className="nav-btn" onClick={e => { e.preventDefault(); window.location.replace('/'); }}>Trang Chủ</a>
                        <Link to="/ticket" className="nav-btn">Đăng ký xét nghiệm</Link>
                        <Link to="/pricing" className="nav-btn">Bảng giá</Link>
                        <Link to="/guide" className="nav-btn">Hướng dẫn tự thu mẫu</Link>
                        <a href="#blog-section" className="nav-btn" onClick={handleBlogClick}>Blog chia sẻ</a>
                    </div>
                </nav>
            )}
        </header>
    );
};

export default Header;
