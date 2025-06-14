import React, { useEffect, useState } from 'react';

const TestHistoryPage = () => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/api/test/history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setHistory(data);
                } else {
                    console.error('Không thể tải lịch sử xét nghiệm');
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử xét nghiệm:', err);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="test-history-page" style={{ padding: '20px' }}>
            <h2>Lịch sử xét nghiệm</h2>
            {history.length === 0 ? (
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
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(item.date).toLocaleString()}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.type}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.result}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TestHistoryPage;
