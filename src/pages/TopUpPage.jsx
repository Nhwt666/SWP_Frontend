import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TopUpPage.css'; // Nếu bạn có file style riêng cho trang này

const paymentOptions = [
    {
        key: 'paypal',
        label: 'PayPal',
        icon: (
            <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" style={{ width: 32, height: 32 }} />
        )
    },
    {
        key: 'momo',
        label: 'MoMo',
        icon: (
            <img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" style={{ width: 32, height: 32, borderRadius: 6 }} />
        )
    }
];

const TopUpPage = () => {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('paypal');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleTopUp = async () => {
        const value = Number(amount);
        let min, max, errorMsg;
        if (paymentMethod === 'paypal') {
            min = 10;
            max = 100000000; // hoặc đặt max USD nếu muốn
            errorMsg = '❌ Số tiền không hợp lệ (10$ ~ 100.000.000$)';
        } else {
            min = 100000;
            max = 100000000;
            errorMsg = '❌ Số tiền không hợp lệ (100.000 ~ 100.000.000)';
        }
        if (isNaN(value) || value < min || value > max) {
            setErrorMessage(errorMsg);
            return;
        }

        try {
            let res, link;
            if (paymentMethod === 'paypal') {
                res = await fetch(`/api/paypal/pay?amount=${value}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    link = await res.text();
                    window.location.href = link + (link.includes('?') ? '&' : '?') + 'returnUrl=' + encodeURIComponent(window.location.origin + '/paypal-success');
                } else {
                    const errText = await res.text();
                    setErrorMessage(`❌ Lỗi: ${errText}`);
                }
            } else if (paymentMethod === 'momo') {
                res = await fetch(`/api/momo/pay?amount=${value}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.payUrl && data.orderId) {
                        localStorage.setItem('momoOrderId', data.orderId);
                        window.open(data.payUrl, '_blank');
                        navigate('/payment-success?method=momo');
                    } else {
                        setErrorMessage('❌ Không nhận được thông tin thanh toán MoMo.');
                    }
                } else {
                    const errText = await res.text();
                    setErrorMessage(`❌ Lỗi: ${errText}`);
                }
            }
        } catch (err) {
            setErrorMessage("❌ Không thể kết nối đến server.");
            console.error(err);
        }
    };

    // Hàm tăng/giảm số tiền
    const handleIncrease = () => {
        if (paymentMethod === 'paypal') {
            setAmount(prev => {
                const val = Number(prev) || 0;
                return (val + 10).toString();
            });
        } else {
            setAmount(prev => {
                const val = Number(prev) || 0;
                return (val + 100000).toString();
            });
        }
    };
    const handleDecrease = () => {
        if (paymentMethod === 'paypal') {
            setAmount(prev => {
                const val = Number(prev) || 0;
                return Math.max(10, val - 10).toString();
            });
        } else {
            setAmount(prev => {
                const val = Number(prev) || 0;
                return Math.max(100000, val - 100000).toString();
            });
        }
    };

    return (
        <div className="topup-center-outer">
            <div className="topup-center-card">
                <h2><span role="img" aria-label="moneybag">💰</span> Nạp tiền vào ví</h2>
                <div className="topup-input-row">
                    <button type="button" onClick={handleDecrease}>-</button>
                    <input
                        type="number"
                        min={paymentMethod === 'paypal' ? 10 : 100000}
                        step={paymentMethod === 'paypal' ? 10 : 100000}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={paymentMethod === 'paypal' ? 'VD: 10$' : 'VD: 100,000đ'}
                    />
                    <button type="button" onClick={handleIncrease}>+</button>
                </div>
                <div className="payment-methods-cards">
                    {paymentOptions.map(option => (
                        <div
                            key={option.key}
                            className={`payment-card${paymentMethod === option.key ? ' selected' : ''}`}
                            onClick={() => setPaymentMethod(option.key)}
                        >
                            {option.icon}
                            <div style={{ marginTop: 10, fontWeight: 600 }}>{option.label}</div>
                        </div>
                    ))}
                </div>
                {errorMessage && (
                    <p role="alert" style={{ color: 'red', marginTop: '10px' }}>
                        {errorMessage}
                    </p>
                )}
                <div className="topup-actions">
                    <button onClick={handleTopUp}>Xác nhận</button>
                    <button onClick={() => navigate(-1)}>Huỷ</button>
                </div>
            </div>
        </div>
    );
};

export default TopUpPage;
