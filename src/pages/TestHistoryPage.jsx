import React, { useEffect, useState } from 'react';

const statusMap = {
    PENDING: 'Đang chờ xử lý',
    IN_PROGRESS: 'Đang xử lý',
    DONE: 'Hoàn thành',
    COMPLETED: 'Hoàn thành',
};

const methodMap = {
    SELF_TEST: 'Tự gửi mẫu',
    AT_FACILITY: 'Tại cơ sở y tế',
    // Thêm các phương thức khác nếu có
};

const TestHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

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

    const handleRowClick = (item) => {
        setSelectedTicket(item);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedTicket(null);
    };

    const getDisplayResult = (resultStr) => {
        if (!resultStr || resultStr === 'Chưa có') return 'Chưa có';
        try {
            const parsed = JSON.parse(resultStr);
            if (parsed && typeof parsed === 'object' && parsed.result) {
                return parsed.result;
            }
            return parsed;
        } catch (e) {
            return resultStr;
        }
    };

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
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Phương thức</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Kết quả</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Xem chi tiết</th>
                    </tr>
                    </thead>
                    <tbody>
                    {history.map((item, index) => (
                        <tr key={index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.reason || ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{methodMap[item.method] || item.method || ''}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{item.result ? item.result : 'Chưa có'}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px', color: '#1976d2', fontWeight: 500 }}>{statusMap[item.status] || item.status || ''}</td>
                            <td style={{ padding: '8px' }}>
                                <button
                                    onClick={() => handleRowClick(item)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        background: '#1976d2', color: '#fff', border: 'none', borderRadius: 20,
                                        padding: '6px 16px', cursor: 'pointer', fontWeight: 500, fontSize: 14,
                                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)', transition: 'background 0.2s',
                                    }}
                                    onMouseOver={e => e.currentTarget.style.background = '#1251a3'}
                                    onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M2.05 12a9.94 9.94 0 0 1 19.9 0 9.94 9.94 0 0 1-19.9 0Z"/></svg>
                                    Xem lại
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}

            {showModal && selectedTicket && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                    background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 350, maxWidth: 500, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
                        <h3>Chi tiết phiếu xét nghiệm</h3>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <tr><td><b>Ngày tạo:</b></td><td>{selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString('vi-VN') : ''}</td></tr>
                                <tr><td><b>Loại xét nghiệm:</b></td><td>{selectedTicket.reason || ''}</td></tr>
                                <tr><td><b>Phương thức:</b></td><td>{methodMap[selectedTicket.method] || selectedTicket.method || ''}</td></tr>
                                <tr><td><b>Tên Mẫu 1:</b></td><td>{selectedTicket.sample1Name || ''}</td></tr>
                                <tr><td><b>Tên Mẫu 2:</b></td><td>{selectedTicket.sample2Name || ''}</td></tr>
                                <tr><td><b>Kết quả:</b></td><td>{getDisplayResult(selectedTicket.resultString)}</td></tr>
                                <tr><td><b>Trạng thái:</b></td><td>{statusMap[selectedTicket.status] || selectedTicket.status || ''}</td></tr>
                                <tr><td><b>Staff ID:</b></td><td>{selectedTicket.staffId || 'Chưa có'}</td></tr>
                                {selectedTicket.method === 'SELF_TEST' && (
                                    <>
                                        <tr><td><b>Địa chỉ:</b></td><td>{selectedTicket.address || ''}</td></tr>
                                        <tr><td><b>Email:</b></td><td>{selectedTicket.email || ''}</td></tr>
                                        <tr><td><b>Số điện thoại:</b></td><td>{selectedTicket.phone || ''}</td></tr>
                                    </>
                                )}
                            </tbody>
                        </table>
                        <div style={{ textAlign: 'right', marginTop: 24 }}>
                            <button onClick={closeModal} style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestHistoryPage; 