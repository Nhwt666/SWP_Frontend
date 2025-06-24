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
    const [message, setMessage] = useState('Vui lòng thanh toán trên app MoMo, sau đó bấm nút bên dưới để xác nhận.');
    const [checking, setChecking] = useState(false);
    const [manualCheckMsg, setManualCheckMsg] = useState('');
    const query = useQuery();
    const method = query.get('method'); // 'paypal' hoặc 'momo'
    const [amount, setAmount] = useState(null);

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

    // Xử lý khi user bấm nút "Tôi đã thanh toán" (chỉ cho momo)
    const handleUserConfirm = async () => {
        setChecking(true);
        setManualCheckMsg('');
        const orderId = localStorage.getItem('momoOrderId');
        try {
            const res = await fetch(`/api/momo/confirm?orderId=${orderId}`, {
                method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
            const msg = await res.text();
                if (res.ok) {
                // Cập nhật lại context số dư và tên
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
                setStatus('SUCCESS');
                setMessage('✅ Nạp tiền thành công! Đang chuyển hướng...');
                setManualCheckMsg('');
                setTimeout(() => {
                    localStorage.removeItem('momoOrderId');
                    navigate('/');
                }, 2000);
            } else {
                setManualCheckMsg(msg || 'Không thể xác nhận giao dịch, vui lòng thử lại sau hoặc liên hệ hỗ trợ.');
            }
        } catch (err) {
            setManualCheckMsg('Không thể kết nối tới máy chủ hoặc xác nhận giao dịch.');
        }
        setChecking(false);
    };

    // Luôn fetch lại user info khi status chuyển sang SUCCESS (MoMo)
    useEffect(() => {
        if (method === 'momo' && status === 'SUCCESS') {
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
        }
    }, [method, status, updateFullName, updateWallet]);

    useEffect(() => {
        // Lấy số tiền nạp từ localStorage hoặc query param (nếu có)
        const storedAmount = localStorage.getItem('momoAmount');
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
            {method === 'momo' && (
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
                            <div style={{ fontWeight: 800, fontSize: '1.35rem', color: '#219653', marginBottom: 8 }}>Xác nhận nạp tiền MoMo thành công!</div>
                            {amount && <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#e53e9f', marginBottom: 8 }}>{amount.toLocaleString('vi-VN')}<span style={{fontSize:'1.1rem', fontWeight:600}}>đ</span></div>}
                            <div style={{ color: '#219653', fontWeight: 500, marginBottom: 6 }}>Số tiền đã được cộng vào ví của bạn.</div>
                            <div style={{ color: '#888', fontSize: 15, marginTop: 8 }}>
                                {amount ? (
                                    <span style={{color:'#e53e9f', fontWeight:700, fontSize:'1.15rem'}}>Bạn vừa nạp thành công: {amount.toLocaleString('vi-VN')}đ</span>
                                ) : 'Đang chuyển hướng...'}
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: 24, color: '#1976d2', fontWeight: 500 }}>
                            <p>🔄 Sau khi thanh toán trên app MoMo, vui lòng bấm nút bên dưới để xác nhận.</p>
                            <p>Bạn có thể đóng tab QR MoMo sau khi đã thanh toán xong.</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16 }}>
                                <button onClick={handleUserConfirm} disabled={checking} style={{ padding: '10px 24px', fontSize: 16, fontWeight: 600, background: '#e53e9f', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
                                    {checking ? 'Đang kiểm tra...' : 'Tôi đã thanh toán'}
                                </button>
                                <button onClick={() => navigate('/topup')} style={{ padding: '10px 18px', fontSize: 14, fontWeight: 500, background: '#eee', color: '#e53e9f', border: '1px solid #e53e9f', borderRadius: 6, cursor: 'pointer' }}>
                                    Huỷ
                                </button>
                            </div>
                            {manualCheckMsg && <div style={{ color: '#d9534f', marginTop: 10 }}>{manualCheckMsg}</div>}
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
