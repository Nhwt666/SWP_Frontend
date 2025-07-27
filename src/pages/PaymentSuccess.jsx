import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { updateFullName, updateWallet } = useContext(UserContext);
    const [status, setStatus] = useState('PENDING');
    const [message, setMessage] = useState('Đang xử lý thanh toán...');
    const [amount, setAmount] = useState(null);
    const query = useQuery();
    const method = query.get('method'); // 'paypal' hoặc 'vnpay'
    const paymentStatus = query.get('status'); // 'success' hoặc 'failed'

    // Xử lý kết quả từ backend (sau khi VnPayCallback forward)
    useEffect(() => {
        if (method === 'vnpay' && paymentStatus) {
            if (paymentStatus === 'success') {
                setStatus('SUCCESS');
                setMessage('✅ Nạp tiền thành công!');
                
                // Lấy số tiền từ query param
                const amountValue = query.get('amount');
                if (amountValue) {
                    setAmount(Number(amountValue));
                }
                
                // Cập nhật lại thông tin người dùng
                (async () => {
                    try {
                        const resUser = await fetch('/auth/me', {
                            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                        });
                        if (resUser.ok) {
                            const user = await resUser.json();
                            updateFullName(user.fullName);
                            updateWallet(user.walletBalance);
                        }
                    } catch {}
                })();
                
                // Redirect về trang nạp tiền sau 3 giây
                setTimeout(() => {
                    navigate('/topup');
                }, 3000);
            } else {
                setStatus('FAILED');
                setMessage('❌ Thanh toán thất bại! Vui lòng thử lại.');
                setTimeout(() => {
                    navigate('/topup');
                }, 3000);
            }
        }
    }, [method, paymentStatus, query, updateFullName, updateWallet, navigate]);

    // Tự động chuyển về /topup sau khi thanh toán paypal thành công
    useEffect(() => {
        if (method === 'paypal') {
            const timer = setTimeout(() => {
                navigate('/topup');
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [method, navigate]);

    // Khi thanh toán PayPal thành công, delay 1s rồi fetch lại user info để cập nhật context
    useEffect(() => {
        if (method === 'paypal') {
            const timer = setTimeout(async () => {
                try {
                    const resUser = await fetch('/auth/me', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    if (resUser.ok) {
                        const user = await resUser.json();
                        updateFullName(user.fullName);
                        updateWallet(user.walletBalance);
                    }
                } catch {}
                navigate('/topup');
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [method, updateFullName, updateWallet, navigate]);

    useEffect(() => {
        // Lấy số tiền nạp từ localStorage hoặc query param (nếu có)
        const storedAmount = localStorage.getItem('vnpayAmount');
        const queryAmount = query.get('amount');
        if (queryAmount) setAmount(Number(queryAmount));
        else if (storedAmount) setAmount(Number(storedAmount));
    }, [query]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            {method === 'paypal' && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#fff',
                    borderRadius: 18,
                    boxShadow: '0 4px 24px 0 rgba(76, 175, 80, 0.13)',
                    padding: '38px 32px 32px 32px',
                    minWidth: 340,
                    maxWidth: 420,
                    margin: '60px auto 0 auto',
                    border: '2px solid #43d477',
                }}>
                    <div style={{
                        width: 54,
                        height: 54,
                        background: '#e8f5e9',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 18,
                        fontSize: 32,
                        color: '#43d477',
                        border: '2px solid #43d477'
                    }}>
                        <span style={{fontWeight:700}}>&#8358;</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#219653', marginBottom: 8 }}>Xác nhận nạp tiền PayPal thành công!</div>
                    {amount && <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1976d2', marginBottom: 8 }}>{amount.toLocaleString('vi-VN')}<span style={{fontSize:'1.1rem', fontWeight:600}}>$</span></div>}
                    <div style={{ color: '#219653', fontWeight: 500, marginBottom: 6 }}>Số tiền đã được cộng vào ví của bạn.</div>
                    <div style={{ color: '#888', fontSize: 15, marginTop: 8 }}>
                        {amount ? (
                            <span style={{color:'#1976d2', fontWeight:700, fontSize:'1.15rem'}}>Bạn vừa nạp thành công: {amount.toLocaleString('vi-VN')}$</span>
                        ) : 'Đang chuyển hướng...'}
                    </div>
                </div>
            )}
            {method === 'vnpay' && (
                <>
                    {status === 'SUCCESS' ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fff',
                            borderRadius: 18,
                            boxShadow: '0 4px 24px 0 rgba(76, 175, 80, 0.13)',
                            padding: '38px 32px 32px 32px',
                            minWidth: 340,
                            maxWidth: 420,
                            margin: '60px auto 0 auto',
                            border: '2px solid #43d477',
                        }}>
                            <div style={{
                                width: 54,
                                height: 54,
                                background: '#e8f5e9',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 18,
                                fontSize: 32,
                                color: '#43d477',
                                border: '2px solid #43d477'
                            }}>
                                <span style={{fontWeight:700}}>&#8358;</span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#219653', marginBottom: 8 }}>Nạp tiền VNPay thành công!</div>
                            {amount && <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#1a73e8', marginBottom: 8 }}>{amount.toLocaleString('vi-VN')}<span style={{fontSize:'1.1rem', fontWeight:600}}>đ</span></div>}
                            <div style={{ color: '#219653', fontWeight: 500, marginBottom: 6 }}>Số tiền đã được cộng vào ví của bạn.</div>
                            <div style={{ color: '#888', fontSize: 15, marginTop: 8 }}>
                                <span style={{color:'#1a73e8', fontWeight:700, fontSize:'1.15rem'}}>Bạn vừa nạp thành công: {amount.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div style={{ color: '#666', fontSize: 14, marginTop: 16 }}>
                                Đang chuyển hướng về trang nạp tiền...
                            </div>
                        </div>
                    ) : status === 'FAILED' ? (
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fff',
                            borderRadius: 18,
                            boxShadow: '0 4px 24px 0 rgba(220, 53, 69, 0.13)',
                            padding: '38px 32px 32px 32px',
                            minWidth: 340,
                            maxWidth: 420,
                            margin: '60px auto 0 auto',
                            border: '2px solid #dc3545',
                        }}>
                            <div style={{
                                width: 54,
                                height: 54,
                                background: '#f8d7da',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 18,
                                fontSize: 32,
                                color: '#dc3545',
                                border: '2px solid #dc3545'
                            }}>
                                ❌
                            </div>
                            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#dc3545', marginBottom: 8 }}>Thanh toán VNPay thất bại!</div>
                            <div style={{ color: '#dc3545', fontWeight: 500, marginBottom: 6 }}>Vui lòng thử lại sau.</div>
                            <div style={{ marginTop: 16 }}>
                                <button onClick={() => navigate('/topup')} style={{ padding: '10px 24px', fontSize: 16, fontWeight: 600, background: '#007bff', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                    Quay lại nạp tiền
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: 24, color: '#1976d2', fontWeight: 500 }}>
                            <p>🔄 Đang xử lý thanh toán VNPay...</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                                <button onClick={() => navigate('/topup')} style={{ padding: '10px 18px', fontSize: 14, fontWeight: 500, background: '#eee', color: '#1a73e8', border: '1px solid #1a73e8', borderRadius: 6, cursor: 'pointer' }}>
                                    Quay lại
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {!method && (
                <div style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px',
                    minWidth: 300
                }}>
                    ✅ Thanh toán thành công!
                </div>
            )}
        </div>
    );
};

export default PaymentSuccess;
