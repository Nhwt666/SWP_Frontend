import { useEffect, useState, useContext } from 'react';
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

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            {method === 'paypal' && (
                <div style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px',
                    minWidth: 300
                }}>
                    ✅ Thanh toán PayPal thành công! Số dư ví của bạn đã được cộng.
                </div>
            )}
            {method === 'momo' && (
                <>
                    {status === 'SUCCESS' ? (
                        <div style={{
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#d4edda',
                            color: '#155724',
                            border: '1px solid #c3e6cb',
                            borderRadius: '5px',
                            minWidth: 300
                        }}>
                            ✅ Nạp tiền thành công! Đang chuyển hướng...
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
