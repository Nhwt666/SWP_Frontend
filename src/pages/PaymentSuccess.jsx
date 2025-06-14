import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [showMessage, setShowMessage] = useState(false);

    useEffect(() => {
        const refreshWallet = async () => {
            try {
                const res = await fetch('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    const user = await res.json();
                    localStorage.setItem('wallet', user.walletBalance);
                    setShowMessage(true); // ✅ hiện thông báo thành công
                }
            } catch (err) {
                console.error('⚠ Không thể cập nhật ví:', err);
            } finally {
                setTimeout(() => {
                    navigate('/');
                }, 2000); // ✅ chuyển sau 2 giây
            }
        };

        refreshWallet();
    }, [navigate]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            {showMessage ? (
                <div style={{
                    display: 'inline-block',
                    padding: '10px 20px',
                    backgroundColor: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    borderRadius: '5px'
                }}>
                    ✅ Nạp tiền thành công! Đang chuyển hướng...
                </div>
            ) : (
                <p>Đang xử lý...</p>
            )}
        </div>
    );
};

export default PaymentSuccess;
