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
        <div className="topup-page">
            <h2>💰 Nạp tiền vào ví</h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <button type="button" onClick={handleDecrease} style={{ fontSize: 20, width: 36, height: 36, borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>-</button>
                <input
                    type="number"
                    min={paymentMethod === 'paypal' ? 10 : 100000}
                    step={paymentMethod === 'paypal' ? 10 : 100000}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={paymentMethod === 'paypal' ? 'VD: 10$' : 'VD: 100,000đ'}
                    style={{ flex: 1, fontSize: 18, padding: '8px 12px', borderRadius: 8, border: '1px solid #4caf50' }}
                />
                <button type="button" onClick={handleIncrease} style={{ fontSize: 20, width: 36, height: 36, borderRadius: '50%', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>+</button>
            </div>

            <div className="payment-methods-cards" style={{ display: 'flex', gap: 24, justifyContent: 'center', margin: '24px 0' }}>
                {paymentOptions.map(option => (
                    <div
                        key={option.key}
                        className={`payment-card${paymentMethod === option.key ? ' selected' : ''}`}
                        style={{
                            cursor: 'pointer',
                            border: paymentMethod === option.key ? '2px solid #1976d2' : '1px solid #ccc',
                            borderRadius: 12,
                            padding: 20,
                            minWidth: 120,
                            textAlign: 'center',
                            background: paymentMethod === option.key ? '#e3f0ff' : '#fff',
                            boxShadow: paymentMethod === option.key ? '0 2px 8px #1976d233' : '0 1px 4px #ccc2',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                        onClick={() => setPaymentMethod(option.key)}
                    >
                        {option.icon}
                        <div style={{ marginTop: 10, fontWeight: 600 }}>{option.label}</div>
                    </div>
                ))}
            </div>

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
