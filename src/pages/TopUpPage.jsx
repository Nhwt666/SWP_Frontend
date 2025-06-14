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
        <div className="topup-page">
            <h2>💰 Nạp tiền vào ví</h2>

            <input
                type="number"
                min="1000"
                max="100000000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="VD: 100000"
            />

            <div className="topup-actions">
                <button onClick={handleTopUp}>Xác nhận</button>
                <button onClick={() => navigate(-1)}>Huỷ</button>
            </div>

            {errorMessage && (
                <p role="alert" style={{ color: 'red', marginTop: '10px' }}>
                    {errorMessage}
                </p>
            )}
        </div>
    );
};

export default TopUpPage;
