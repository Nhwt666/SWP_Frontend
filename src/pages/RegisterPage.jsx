import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');
    const [showOtpForm, setShowOtpForm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const res = await fetch('/auth/request-register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    email,
                    password,
                    phone
                }),
            });

            if (res.ok) {
                setMessage('✅ OTP đã được gửi tới email. Vui lòng nhập để xác nhận.');
                setShowOtpForm(true);
            } else {
                const err = await res.text();
                setMessage('❌' + err);
            }
        } catch (error) {
            setMessage('❌ Không thể kết nối đến server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const res = await fetch(`/auth/confirm-register?email=${email}&otp=${otp}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                const data = await res.json();

                // ✅ Lưu token & thông tin user vào localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('role', data.role);

                // ✅ Gọi /me để lấy thêm thông tin
                const meRes = await fetch('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${data.token}`
                    }
                });

                if (meRes.ok) {
                    const user = await meRes.json();
                    localStorage.setItem('fullName', user.fullName);
                    localStorage.setItem('wallet', user.walletBalance);
                }

                setMessage('🎉 Đăng ký và đăng nhập thành công!');
                setTimeout(() => {
                    navigate('/');
                    window.location.reload();
                }, 1000);
            } else {
                const err = await res.text();
                setMessage('❌ Lỗi xác nhận: ' + err);
            }
        } catch (error) {
            setMessage('❌ Không thể kết nối đến server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Header />
            <div className="register-bg">
                <div className="register-container flex-col">
                    <div className="register-avatar-section">
                        {/* <img src="/logo192.png" alt="Logo" className="register-avatar" /> */}
                    </div>
                    <h2 className="register-title">Đăng Ký</h2>
                    {!showOtpForm ? (
                        <form className="register-form" onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="Tên người dùng"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Đang gửi...' : 'Xác nhận'}
                            </button>
                        </form>
                    ) : (
                        <form className="register-form" onSubmit={handleConfirm}>
                            <input
                                type="text"
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? 'Đang xác nhận...' : 'Xác nhận'}
                            </button>
                        </form>
                    )}
                    {message && <div className="divider" />}
                    {message && <div className="message">{message}</div>}
                </div>
            </div>
        </>
    );
};

export default RegisterPage;
