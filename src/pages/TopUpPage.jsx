import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TopUpPage.css'; // Nếu bạn có file style riêng cho trang này

const TopUpPage = () => {
    const [amount, setAmount] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleTopUp = async () => {
        const value = Number(amount);

        if (isNaN(value) || value < 1000 || value > 100000000) {
            setErrorMessage("❌ Số tiền không hợp lệ (1000 ~ 100.000.000)");
            return;
        }

        try {
            const res = await fetch(`/api/paypal/pay?amount=${value}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                const link = await res.text();
                window.location.href = link;
            } else {
                const errText = await res.text();
                setErrorMessage(`❌ Lỗi: ${errText}`);
            }
        } catch (err) {
            setErrorMessage("❌ Không thể kết nối đến server.");
            console.error(err);
        }
    };

    return (
        <div className="topup-bg">
            <div className="topup-modern-card">
                <div className="topup-icon-banner">
                    <span role="img" aria-label="wallet" className="topup-wallet-icon">💳</span>
                </div>
                <h2 className="topup-title">Nạp tiền vào ví</h2>
                <div className="topup-subtitle">Vui lòng nhập số tiền bạn muốn nạp (tối thiểu 1.000đ, tối đa 100.000.000đ)</div>
                <input
                    className="topup-input-modern"
                    type="number"
                    min="1000"
                    max="100000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="VD: 100000"
                />
                {errorMessage && (
                    <div className="topup-alert-modern" role="alert">
                        {errorMessage}
                    </div>
                )}
                <div className="topup-actions-modern">
                    <button className="btn-primary" onClick={handleTopUp}>Xác nhận</button>
                    <button className="btn-outline" onClick={() => navigate(-1)}>Huỷ</button>
                </div>
            </div>
        </div>
    );
};

export default TopUpPage;
