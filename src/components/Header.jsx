import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { fullName } = useContext(UserContext);
    const [wallet, setWallet] = useState(() => {
        const raw = localStorage.getItem('wallet');
        const value = Number(raw);
        return isNaN(value) ? 0 : value;
    });
    const [showDropdown, setShowDropdown] = useState(false);
    const email = localStorage.getItem('email') || '';
    const isLoggedIn = !!email;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const refreshWallet = async () => {
        try {
            const res = await fetch('/auth/me', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                const user = await res.json();
                const balance = Number(user.walletBalance);
                const safeBalance = isNaN(balance) ? 0 : balance;
                localStorage.setItem('wallet', safeBalance);
                setWallet(safeBalance);
            }
        } catch (err) {
            console.error('❌ Lỗi cập nhật ví:', err);
        }
    };

    useEffect(() => {
        if (isLoggedIn && localStorage.getItem('token')) {
            refreshWallet();
        }
    }, [isLoggedIn]);

    return (
        <header className="header">
            <div className="header-container">
                <div className="logo-title">
                    <Link to="/">
                        <img src="/logo.png" alt="Logo" className="logo" />
                    </Link>
                    <h1>Trung Tâm Xét nghiệm ADN</h1>
                </div>

                <nav className="auth-links">
                    {isLoggedIn ? (
                        <div className="user-info-container">
                            <div className="user-info-text">
                                <div className="user-greeting">Xin chào, {fullName}</div>
                                <div className="user-wallet">Ví: {wallet.toLocaleString()}đ</div>
                            </div>
                            <div className="avatar-container">
                                <div className="avatar" onClick={() => setShowDropdown(!showDropdown)}>
                                    {fullName.charAt(0).toUpperCase()}
                                </div>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => navigate('/profile')}>Thông tin của tôi</button>
                                        <button onClick={() => navigate('/update-profile')}>Cập nhật thông tin</button>
                                        <button onClick={() => navigate('/topup-history')}>Lịch sử nạp tiền</button>
                                        <button onClick={() => navigate('/test-history')}>Lịch sử xét nghiệm</button>
                                        <button onClick={() => navigate('/topup')}>Nạp tiền</button>
                                        <button onClick={handleLogout}>Đăng xuất</button>
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

            <nav className="main-nav">
                <div className="main-nav-container">
                    <Link to="/" className="nav-btn">Trang Chủ</Link>
                    <Link to="/ticket" className="nav-btn">Đăng ký xét nghiệm</Link>
                    <Link to="/pricing" className="nav-btn">Bảng giá</Link>
                    <Link to="/guide" className="nav-btn">Hướng dẫn tự thu mẫu</Link>
                    <Link to="/blog" className="nav-btn">Blog chia sẻ</Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;
