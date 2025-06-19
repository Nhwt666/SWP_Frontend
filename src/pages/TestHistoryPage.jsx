import React, { useEffect, useState } from 'react';

const TestHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                // Gọi đúng endpoint BE: /tickets/history (dựa vào token)
                const historyRes = await fetch('/tickets/history', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (!historyRes.ok) throw new Error('Không thể tải lịch sử xét nghiệm');
                const data = await historyRes.json();
                setHistory(data);
            } catch (err) {
                setMessage(err.message || 'Lỗi khi tải lịch sử xét nghiệm');
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="test-history-page" style={{ padding: '20px' }}>
            <h2>Lịch sử xét nghiệm</h2>
            {message && <p style={{ color: 'red' }}>{message}</p>}
            {history.length === 0 && !message ? (
                <p>Không có dữ liệu xét nghiệm.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ngày</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Loại xét nghiệm</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Kết quả</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.reason || ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.result ? item.result : 'Chưa có'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.status || ''}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TestHistoryPage; 