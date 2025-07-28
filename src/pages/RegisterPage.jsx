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
    const [errorMessages, setErrorMessages] = useState([]);

    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
        setErrorMessages([]);

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
                let errText = await res.text();
                let errors = [];
                try {
                    const errObj = JSON.parse(errText);
                    if (typeof errObj === 'object' && errObj !== null) {
                        errors = Object.values(errObj);
                    } else {
                        errors = [errText];
                    }
                } catch {
                    errors = [errText];
                }
                setErrorMessages(errors);
            }
        } catch (error) {
            setErrorMessages(['Không thể kết nối đến server.']);
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


                localStorage.setItem('token', data.token);
                localStorage.setItem('email', data.email);
                localStorage.setItem('role', data.role);


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
                    <h2 className="register-title" style={{ fontFamily: 'Be Vietnam Pro, Inter, Arial, sans-serif', fontWeight: 900 }}>Đăng Ký</h2>
                    {errorMessages.length > 0 && (
                        <div className="member-error-box">
                            {errorMessages.map((msg, idx) => (
                                <div key={idx} className="member-error-line">❌ {msg}</div>
                            ))}
                        </div>
                    )}
                    {!showOtpForm ? (
                        <form className="register-form" onSubmit={handleRegister} autoComplete="off">
                            <input
                                type="text"
                                placeholder="Tên người dùng"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                            <input
                                type="password"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                            <input
                                type="text"
                                placeholder="Số điện thoại"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{ fontFamily: 'inherit' }}
                            />
                            <button type="submit" disabled={isLoading} style={{ fontFamily: 'inherit', position: 'relative' }}>
                                {isLoading ? (
                                    <span className="spinner" style={{ display: 'inline-block', verticalAlign: 'middle', width: 22, height: 22 }}>
                                        <svg width="22" height="22" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#6c47d8">
                                            <g fill="none" fillRule="evenodd" strokeWidth="4">
                                                <circle cx="22" cy="22" r="18" strokeOpacity=".2" />
                                                <path d="M40 22c0-9.94-8.06-18-18-18">
                                                    <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.9s" repeatCount="indefinite" />
                                                </path>
                                            </g>
                                        </svg>
                                    </span>
                                ) : 'Xác nhận'}
                            </button>
                        </form>
                    ) : (
                        <form className="register-form" onSubmit={handleConfirm} autoComplete="off">
                            <input
                                type="text"
                                placeholder="Nhập mã OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                style={{ fontFamily: 'inherit' }}
                            />
                            <button type="submit" disabled={isLoading} style={{ fontFamily: 'inherit', position: 'relative' }}>
                                {isLoading ? (
                                    <span className="spinner" style={{ display: 'inline-block', verticalAlign: 'middle', width: 22, height: 22 }}>
                                        <svg width="22" height="22" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg" stroke="#6c47d8">
                                            <g fill="none" fillRule="evenodd" strokeWidth="4">
                                                <circle cx="22" cy="22" r="18" strokeOpacity=".2" />
                                                <path d="M40 22c0-9.94-8.06-18-18-18">
                                                    <animateTransform attributeName="transform" type="rotate" from="0 22 22" to="360 22 22" dur="0.9s" repeatCount="indefinite" />
                                                </path>
                                            </g>
                                        </svg>
                                    </span>
                                ) : 'Xác nhận'}
                            </button>
                        </form>
                    )}
                    {message && <div className="divider" style={{ margin: '18px auto 0', width: 48, height: 3, borderRadius: 2, background: 'linear-gradient(90deg,#6c47d8 60%,#17a2b8 100%)', opacity: 0.18 }} />}
                    {message && <div className="message" style={{ fontFamily: 'inherit', marginTop: 10, animation: 'fadeInLogin 0.5s' }}>{message}</div>}
                </div>
            </div>
            
            {/* Footer with Map */}
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

export default RegisterPage;
