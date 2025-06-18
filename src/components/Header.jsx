import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fullName } = useContext(UserContext);
    const [wallet, setWallet] = useState(() => {
        const raw = localStorage.getItem('wallet');
        const value = Number(raw);
        return isNaN(value) ? 0 : value;
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const [role, setRole] = useState(localStorage.getItem('role') || '');

    const email = localStorage.getItem('email') || '';
    const isLoggedIn = !!email;
    const dropdownRef = useRef();

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
                const balance = Number(user.walletBalance);
                const safeBalance = isNaN(balance) ? 0 : balance;
                localStorage.setItem('wallet', safeBalance);
                localStorage.setItem('role', user.role);
                setWallet(safeBalance);
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
                                    Xin chào, {fullName || 'Người dùng'} {role === 'ADMIN' && '(Quản trị)'}
                                </div>
                                {role !== 'ADMIN' && (
                                    <div className="user-wallet">Ví: {wallet.toLocaleString()}đ</div>
                                )}
                            </div>
                            <div className="avatar-container">
                                <div
                                    className="avatar"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    {(fullName || 'U').charAt(0).toUpperCase()}
                                </div>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        {role === 'ADMIN' ? (
                                            <>
                                                <button onClick={() => navigate('/admin/dashboard')}>Bảng điều khiển</button>
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
                        </div>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/register">Đăng ký</Link>
                        </>
                    )}
                </nav>
            </div>

            {role !== 'ADMIN' && (
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
