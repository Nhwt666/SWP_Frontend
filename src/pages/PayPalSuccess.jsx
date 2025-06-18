import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const PayPalSuccess = () => {
    const navigate = useNavigate();
    const { updateFullName, updateWallet } = useContext(UserContext);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const resUser = await fetch('/auth/me', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (resUser.ok) {
                    const user = await resUser.json();
                    updateFullName(user.fullName);
                    updateWallet(user.walletBalance);
                }
            } catch (e) {
                console.error('PayPalSuccess error:', e);
            }
            setTimeout(() => {
                navigate('/');
            }, 2000);
        };
        fetchUser();
    }, [navigate, updateFullName, updateWallet]);

    return (
        <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div style={{
                display: 'inline-block',
                padding: '10px 20px',
                backgroundColor: '#d4edda',
                color: '#155724',
                border: '1px solid #c3e6cb',
                borderRadius: '5px',
                minWidth: 300
            }}>
                ✅ Nạp tiền PayPal thành công! Đang chuyển hướng...
            </div>
            <div>DEBUG: PayPalSuccess page loaded</div>
        </div>
    );
};

export default PayPalSuccess;