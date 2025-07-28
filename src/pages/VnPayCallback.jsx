import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VnPayCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {

        const forwardToBackend = async () => {
            try {

                const queryString = location.search;
                console.log('VNPay Callback - Query string:', queryString);
                

                await fetch(`/api/vnpay/success${queryString}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });


                console.log('VNPay Callback - Always redirecting to success');
                

                const urlParams = new URLSearchParams(queryString);
                const amount = urlParams.get('vnp_Amount') ? Number(urlParams.get('vnp_Amount')) / 100 : 0;
                

                navigate(`/payment-success?method=vnpay&status=success&amount=${amount}`);
                
            } catch (error) {
                console.error('VNPay Callback - Network error:', error);

                const urlParams = new URLSearchParams(location.search);
                const amount = urlParams.get('vnp_Amount') ? Number(urlParams.get('vnp_Amount')) / 100 : 0;
                navigate(`/payment-success?method=vnpay&status=success&amount=${amount}`);
            }
        };

        forwardToBackend();
    }, [location, navigate]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            flexDirection: 'column'
        }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
                🔄 Đang xử lý thanh toán VNPay...
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
                Vui lòng chờ trong giây lát
            </div>
        </div>
    );
};

export default VnPayCallback; 