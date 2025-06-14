import React, { useEffect, useState } from 'react';

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

                // Giả sử BE trả userId (nếu chưa có thì cần BE bổ sung userId vào /auth/me)
                const userId = user.userId;
                if (!userId) {
                    setMessage("Không tìm thấy userId trong thông tin người dùng");
                    return;
                }

                // Gọi API topup history
                const historyRes = await fetch(`/api/paypal/topup-history?userId=${userId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!historyRes.ok) throw new Error("Không thể tải lịch sử nạp tiền");
                const data = await historyRes.json();
                setHistory(data);
            } catch (err) {
                console.error(err);
                setMessage(err.message);
            }
        };

        fetchHistory();
    }, []);

    return (
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
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Thông tin PayPal</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {new Date(item.createdAt).toLocaleString('vi-VN')}
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {Number(item.amount).toLocaleString('vi-VN')} đ
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                PayID: {item.paymentId} <br />
                                PayerID: {item.payerId}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TopUpHistoryPage;
