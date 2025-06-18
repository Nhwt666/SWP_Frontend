import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState('login');

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsLoading(true);

        try {
            if (step === 'login') {
                await handleLogin();
            } else if (step === 'email') {
                await handleRequestReset();
            } else if (step === 'otp') {
                await handleConfirmOtp();
            } else if (step === 'newpass') {
                await handleUpdatePassword();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async () => {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const err = await res.json();
            setMessage(`❌ Đăng nhập thất bại: ${err.error || 'Sai thông tin đăng nhập'}`);
            return;
        }

        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', email);

        const meRes = await fetch('/auth/me', {
            headers: { Authorization: `Bearer ${data.token}` }
        });

        if (!meRes.ok) {
            setMessage('❌ Không thể lấy thông tin người dùng');
            return;
        }

        const user = await meRes.json();
        localStorage.setItem('fullName', user.fullName);
        localStorage.setItem('wallet', user.walletBalance);
        localStorage.setItem('role', user.role);

        setMessage('🎉 Đăng nhập thành công!');
        setTimeout(() => {
            const role = user.role?.toUpperCase();
            if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (role === 'STAFF') {
                navigate('/staff/dashboard');
            } else {
                navigate('/');
            }
        }, 500);
    };

    const handleRequestReset = async () => {
        const res = await fetch(`/auth/request-reset?email=${encodeURIComponent(email)}`, {
            method: 'POST'
        });
        if (!res.ok) {
            setMessage('❌ Không thể gửi email.');
        } else {
            setMessage('📨 Đã gửi mã xác nhận đến email.');
            setStep('otp');
        }
    };

    const handleConfirmOtp = async () => {
        const res = await fetch(`/auth/confirm-reset?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
            method: 'POST'
        });
        if (!res.ok) {
            setMessage('❌ OTP không hợp lệ hoặc đã hết hạn.');
        } else {
            setMessage('✅ OTP hợp lệ. Nhập mật khẩu mới.');
            sessionStorage.setItem('verifiedOtp', otp);
            setStep('newpass');
        }
    };

    const handleUpdatePassword = async () => {
        const verifiedOtp = sessionStorage.getItem('verifiedOtp');
        if (!verifiedOtp) {
            setMessage('❌ Vui lòng xác thực OTP trước.');
            return;
        }

        const res = await fetch('/auth/update-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ otp: verifiedOtp, newPassword })
        });

        if (!res.ok) {
            setMessage('❌ Mật khẩu phải chứa ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
        } else {
            setMessage('🔐 Mật khẩu đã được đổi thành công!');
            sessionStorage.removeItem('verifiedOtp');
            setTimeout(() => {
                setStep('login');
                setPassword('');
                setOtp('');
                setNewPassword('');
            }, 1000);
        }
    };

    return (
        <>
            <Header />
            <div className="login-bg">
                <div className="login-container flex-col">
                    <div className="login-avatar-section">
                        {/* <img src="/logo192.png" alt="Logo" className="login-avatar" /> */}
                    </div>
                    <h2 className="login-title">
                        {step === 'login' && 'Đăng Nhập'}
                        {step === 'email' && 'Quên mật khẩu'}
                        {step === 'otp' && 'Nhập mã OTP'}
                        {step === 'newpass' && 'Đặt Mật Khẩu Mới'}
                    </h2>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={step !== 'login' && step !== 'email'}
                        />
                        {step === 'login' && (
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        )}
                        {step === 'otp' && (
                            <input
                                type="text"
                                placeholder="Mã xác nhận OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                            />
                        )}
                        {step === 'newpass' && (
                            <input
                                type="password"
                                placeholder="Mật khẩu mới"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        )}
                        <div className="button-group">
                            <button
                                type="submit"
                                disabled={isLoading}
                            >
                                {step === 'login' ? (isLoading ? 'Đang đăng nhập...' : 'Đăng nhập') :
                                    step === 'email' ? 'Xác Nhận' :
                                        step === 'otp' ? 'Xác minh' :
                                            'Đổi mật khẩu'}
                            </button>
                            {step === 'login' ? (
                                <button
                                    type="button"
                                    onClick={() => setStep('email')}
                                    className="link-button"
                                >
                                    Quên mật khẩu?
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setStep('login');
                                        setOtp('');
                                        setNewPassword('');
                                    }}
                                    className="link-button"
                                >
                                    Quay lại đăng nhập
                                </button>
                            )}
                        </div>
                    </form>
                    {message && <div className="divider" />}
                    {message && <div className="message">{message}</div>}
                </div>
            </div>
        </>
    );
};

export default LoginPage;
