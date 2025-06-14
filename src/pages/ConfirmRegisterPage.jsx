import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/ConfirmRegisterPage.css';

const ConfirmRegisterPage = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const params = new URLSearchParams({ email, otp });

        try {
            const res = await fetch(`http://localhost:8080/auth/confirm-register?${params.toString()}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded', // 🔥 BẮT BUỘC cho POST có query param
                }
            });

            if (res.ok) {
                setMessage('✅ Đăng ký thành công!');
            } else {
                const err = await res.json();
                setMessage('❌ Lỗi: ' + (err.error || 'OTP không hợp lệ hoặc đã hết hạn'));
            }
        } catch (err) {
            setMessage('❌ Không thể kết nối đến server');
            console.error(err);
        }
    };

    return (
        <>
            <Header />
            <div className="confirm-container">
                <h2>Xác nhận đăng ký</h2>
                <form className="confirm-form" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email đã đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Mã OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button type="submit">Xác nhận</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </>
    );
};

export default ConfirmRegisterPage;
