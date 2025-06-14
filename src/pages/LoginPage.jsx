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
    const [step, setStep] = useState('login'); // login | email | otp | newpass

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const res = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const err = await res.json();
                setMessage(`❌ Đăng nhập thất bại: ${err.error || 'Sai thông tin đăng nhập'}`);
                localStorage.clear();
                setIsLoading(false);
                return;
            }

            const data = await res.json();
            const token = data.token;
            localStorage.setItem('token', token);
            localStorage.setItem('email', email);

            // Lấy thông tin người dùng
            const meRes = await fetch('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!meRes.ok) {
                setMessage('❌ Không thể lấy thông tin người dùng');
                localStorage.clear();
                setIsLoading(false);
                return;
            }

            const user = await meRes.json();
            localStorage.setItem('fullName', user.fullName);
            localStorage.setItem('wallet', user.walletBalance);
            localStorage.setItem('role', user.role);

            setMessage('🎉 Đăng nhập thành công!');

            setTimeout(() => {
                if (user.role?.toUpperCase() === 'ADMIN') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 500);

        } catch (err) {
            setMessage(`❌ Đăng nhập thất bại: ${err.message}`);
            localStorage.clear();
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestReset = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await fetch(`/auth/request-reset?email=${email}`, { method: 'POST' });
            setMessage('📨 Đã gửi mã xác nhận đến email.');
            setStep('otp');
        } catch {
            setMessage('❌ Không thể gửi email.');
        }
    };

    const handleConfirmOtp = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await fetch(`/auth/confirm-reset?email=${email}&otp=${otp}`, { method: 'POST' });
            setMessage('✅ OTP hợp lệ. Nhập mật khẩu mới.');
            setStep('newpass');
        } catch {
            setMessage('❌ OTP không hợp lệ.');
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await fetch(`/auth/update-password?email=${email}&newPassword=${newPassword}`, {
                method: 'POST'
            });
            setMessage('🔐 Mật khẩu đã được cập nhật!');
            setTimeout(() => {
                setStep('login');
                setPassword('');
                setOtp('');
                setNewPassword('');
            }, 1000);
        } catch {
            setMessage('❌ Không thể cập nhật mật khẩu.');
        }
    };

    const handleSubmit = (e) => {
        if (step === 'login') return handleLogin(e);
        if (step === 'email') return handleRequestReset(e);
        if (step === 'otp') return handleConfirmOtp(e);
        return handleUpdatePassword(e);
    };

    return (
        <>
            <Header />
            <div className="login-container">
                <h2>
                    {step === 'login' && 'Đăng Nhập'}
                    {step === 'email' && 'Quên mật khẩu'}
                    {step === 'otp' && 'Nhập mã OTP'}
                    {step === 'newpass' && 'Đặt lại mật khẩu'}
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

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                maxWidth: '200px',
                                backgroundColor: '#0047AB',
                                color: '#fff',
                                border: 'none',
                                padding: '10px',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                            }}
                        >
                            {step === 'login' ? (isLoading ? 'Đang đăng nhập...' : 'Đăng nhập') :
                                step === 'email' ? 'Gửi liên kết' :
                                    step === 'otp' ? 'Xác minh' : 'Đổi mật khẩu'}
                        </button>

                        {step === 'login' ? (
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#0047AB',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px'
                                }}
                            >
                                Quên mật khẩu?
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    setStep('login');
                                    setMessage('');
                                    setOtp('');
                                    setNewPassword('');
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'gray',
                                    cursor: 'pointer',
                                    textDecoration: 'underline',
                                    fontSize: '14px'
                                }}
                            >
                                ← Quay lại đăng nhập
                            </button>
                        )}
                    </div>
                </form>

                {message && <p className="message" style={{ marginTop: '12px', textAlign: 'center' }}>{message}</p>}
            </div>
        </>
    );
};

export default LoginPage;
