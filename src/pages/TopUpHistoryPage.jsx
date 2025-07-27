import React, { useEffect, useState } from 'react';
import Header from '../components/Header';

const TopUpHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Gọi /auth/me lấy user info
                const meRes = await fetch('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!meRes.ok) throw new Error("Không thể lấy thông tin user");
                const user = await meRes.json();

                const userId = user.userId;
                if (!userId) {
                    setMessage("Không tìm thấy userId trong thông tin người dùng");
                    return;
                }

                // Gọi cả API PayPal và VNPay để lấy lịch sử
                const [paypalRes, vnpayRes] = await Promise.allSettled([
                    fetch(`/api/paypal/topup-history?userId=${userId}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    fetch(`/api/vnpay/topup-history`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                let allHistory = [];

                // Xử lý kết quả PayPal
                if (paypalRes.status === 'fulfilled' && paypalRes.value.ok) {
                    const paypalData = await paypalRes.value.json();
                    console.log('PayPal history data:', paypalData);
                    // Thêm payment method cho PayPal
                    const paypalHistory = paypalData.map(item => ({
                        ...item,
                        paymentMethod: 'PAYPAL'
                    }));
                    allHistory = [...allHistory, ...paypalHistory];
                }

                // Xử lý kết quả VNPay
                if (vnpayRes.status === 'fulfilled' && vnpayRes.value.ok) {
                    const vnpayData = await vnpayRes.value.json();
                    console.log('VNPay history data:', vnpayData);
                    // Thêm payment method cho VNPay
                    const vnpayHistory = vnpayData.map(item => ({
                        ...item,
                        paymentMethod: 'VNPAY'
                    }));
                    allHistory = [...allHistory, ...vnpayHistory];
                }

                // Sắp xếp theo thời gian (mới nhất trước)
                allHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                
                // Loại bỏ duplicate đơn giản dựa trên PayID
                const uniqueHistory = allHistory.filter((item, index, self) => {
                    if (item.paymentId) {
                        // Nếu có PayID, chỉ giữ lại item đầu tiên tìm thấy
                        return index === self.findIndex(t => t.paymentId === item.paymentId);
                    }
                    // Nếu không có PayID, giữ lại tất cả
                    return true;
                });
                
                // Xác định payment method dựa trên PayerID
                const correctedHistory = uniqueHistory.map(item => {
                    const payerId = item.payerId || item.payer_id;
                    
                    // Nếu PayerID là NCB hoặc Vk5QQVIFUjQ, đó là VNPay
                    if (payerId === 'NCB' || payerId === 'Vk5QQVIFUjQ') {
                        return { ...item, paymentMethod: 'VNPAY' };
                    }
                    
                    // Nếu PayerID bắt đầu bằng PAYID- hoặc là PayPal, đó là PayPal
                    if (payerId && (payerId.startsWith('PAYID-') || payerId === 'PayPal' || payerId === '2F643AXYGRS6G')) {
                        return { ...item, paymentMethod: 'PAYPAL' };
                    }
                    
                    // Giữ nguyên payment method từ backend
                    return item;
                });
                
                console.log('Combined history data:', allHistory);
                console.log('Unique history data:', uniqueHistory);
                console.log('Corrected history data:', correctedHistory);

                setHistory(correctedHistory);
            } catch (err) {
                console.error(err);
                setMessage(err.message);
            }
        };

        fetchHistory();
    }, []);

    const getPaymentMethodDisplay = (paymentMethod) => {
        if (!paymentMethod) return 'VNPay';
        
        const method = paymentMethod.toUpperCase();
        switch (method) {
            case 'MOMO':
                return 'MoMo';
            case 'PAYPAL':
                return 'PayPal';
            case 'VNPAY':
                return 'VNPay';
            default:
                return 'VNPay';
        }
    };

    const formatAmount = (amount, paymentMethod) => {
        if (!amount) return '0';
        
        const numAmount = Number(amount);
        
        // Tất cả phương thức đều hiển thị bằng VND
        return `${numAmount.toLocaleString('vi-VN')} đ`;
    };

    return (
        <>
            <Header />
            <div className="topup-history-page" style={{ padding: '20px' }}>
                <h2>Lịch sử nạp tiền</h2>
                {message && <p style={{ color: 'red' }}>{message}</p>}
                {history.length === 0 && !message ? (
                    <p>Không có dữ liệu nạp tiền.</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                        <tr>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ngày</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Số tiền</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Phương thức</th>
                            <th style={{ border: '1px solid #ccc', padding: '8px' }}>Thông tin giao dịch</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((item, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {formatAmount(item.amount, item.paymentMethod)}
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {getPaymentMethodDisplay(item.paymentMethod)}
                                </td>
                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                    {item.paymentId ? (
                                        <>
                                            PayID: {item.paymentId} <br />
                                            PayerID: {item.payerId || item.payer_id || (item.paymentMethod === 'PAYPAL' ? 'PayPal' : 'VNPay')}
                                        </>
                                    ) : item.orderId ? (
                                        <>
                                            OrderID: {item.orderId}
                                        </>
                                    ) : (
                                        <>
                                            TransactionID: {item.transactionId || item.id || 'N/A'}
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div><strong>Số Hotline:</strong> 1800.9999</div>
                        <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                        <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default TopUpHistoryPage;
