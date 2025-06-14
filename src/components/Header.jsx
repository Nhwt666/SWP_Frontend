import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    const navigate = useNavigate();

    const [wallet, setWallet] = useState(() => {
        const raw = localStorage.getItem('wallet');
        const value = Number(raw);
        return isNaN(value) ? 0 : value;
    });

    const [showDropdown, setShowDropdown] = useState(false);

    const fullName = localStorage.getItem('fullName') || '';
    const email = localStorage.getItem('email') || '';
    const isLoggedIn = !!email;

    const handleLogout = () => {
        if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
            localStorage.clear();
            navigate('/');
        }
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

    const toggleDropdown = () => {
        setShowDropdown(prev => !prev);
    };

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
                                    Ví: {wallet.toLocaleString('vi-VN')} ₫
                                </div>
                            </div>
                            <div className="avatar-container">
                                <div
                                    className="avatar"
                                    role="button"
                                    aria-label="Avatar người dùng"
                                    onClick={toggleDropdown}
                                ></div>
                                {showDropdown && (
                                    <div className="dropdown-menu">
                                        <button onClick={() => {navigate('/update-profile'); setShowDropdown(false);}}>Cập nhật thông tin</button>
                                        <button onClick={() => {navigate('/topup-history'); setShowDropdown(false);}}>Lịch sử nạp tiền</button>
                                        <button onClick={() => {navigate('/test-history'); setShowDropdown(false);}}>Lịch sử xét nghiệm</button>
                                        <button onClick={() => {navigate('/topup'); setShowDropdown(false);}}>Nạp tiền</button>
                                        <button onClick={() => {handleLogout(); setShowDropdown(false);}}>Đăng xuất</button>
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
