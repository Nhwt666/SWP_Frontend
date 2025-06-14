import React, { useEffect, useState } from 'react';

const TopUpHistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        // Gọi API lấy dữ liệu lịch sử nạp tiền
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/topup/history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                } else {
                    console.error('Không thể tải lịch sử nạp tiền');
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử nạp tiền:', err);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="topup-history-page" style={{ padding: '20px' }}>
            <h2>Lịch sử nạp tiền</h2>
            {history.length === 0 ? (
                <p>Không có dữ liệu nạp tiền.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ngày</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Số tiền</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(item.date).toLocaleString()}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.amount.toLocaleString()} đ</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TopUpHistoryPage;
