import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();

    const fullName = localStorage.getItem('fullName');
    const email = localStorage.getItem('email');
    const isLoggedIn = !!email;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
        window.location.reload();
    };

    const refreshWallet = async () => {
        try {
            const res = await fetch('/auth/me', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                const user = await res.json();
                localStorage.setItem('wallet', user.walletBalance);
            }
        } catch (err) {
            console.error('❌ Lỗi cập nhật ví:', err);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            refreshWallet();
        }
    }, [isLoggedIn]);

    return (
        <header className="header" role="banner">
            <div className="header-container">
                <div className="logo-title">
                    <Link to="/" aria-label="Trang chủ">
                        <img src="/logo.png" alt="Logo Trung Tâm Xét nghiệm ADN" className="logo" />
                    </Link>
                    <h1>Trung Tâm Xét nghiệm ADN</h1>
                </div>

                <nav className="auth-links" aria-label="Liên kết đăng nhập và đăng ký">
                    {isLoggedIn ? (
                        <div className="user-info-container">
                            <div className="user-info-text">
                                <div className="user-name">{fullName}</div>
                                <div className="user-wallet">
                                    Ví: {(Number(localStorage.getItem('wallet')) || 0).toLocaleString()}đ
                                </div>
                            </div>
                            <div className="avatar" />
                            <button
                                className="topup-btn"
                                onClick={() => navigate('/topup')}
                                aria-label="Nạp tiền vào ví"
                            >
                                Nạp tiền
                            </button>
                            <button
                                className="logout-btn"
                                onClick={handleLogout}
                                aria-label="Đăng xuất khỏi tài khoản"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <>
                            <Link to="/login">Đăng nhập</Link>
                            <Link to="/register">Đăng ký</Link>
                        </>
                    )}
                </nav>
            </div>

            <section className="main-nav">
                <nav className="main-nav-container">
                    <Link to="/" className="nav-btn">Trang Chủ</Link>
                    <Link to="/ticket" className="nav-btn">Đăng ký xét nghiệm</Link>
                    <Link to="/pricing" className="nav-btn">Bảng giá</Link>
                    <Link to="/guide" className="nav-btn">Hướng dẫn tự thu mẫu</Link>
                    <Link to="/blog" className="nav-btn">Blog chia sẻ</Link>
                </nav>
            </section>
        </header>
    );
};

export default Header;
