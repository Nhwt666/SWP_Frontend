import React, { useEffect, useState } from 'react';

const TestHistoryPage = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await fetch('/tickets/history', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data);
                } else {
                    console.error('Không thể tải lịch sử ticket');
                }
            } catch (err) {
                console.error('Lỗi khi tải lịch sử ticket:', err);
            }
        };
        fetchHistory();
    }, []);

    const statusColor = (status) => {
        if (status === 'COMPLETED') return '#28a745';
        if (status === 'IN_PROGRESS') return '#007bff';
        return '#ffc107'; // PENDING
    };

    const typeToVietnamese = (type) => {
        switch(type) {
            case 'CIVIL': return 'Dân sự';
            case 'ADMINISTRATIVE': return 'Hành chính';
            case 'OTHER': return 'Yêu cầu khác';
            default: return type;
        }
    };
    const methodToVietnamese = (method) => {
        switch(method) {
            case 'SELF_TEST': return 'Tự gửi mẫu';
            case 'AT_FACILITY': return 'Tại cơ sở y tế';
            default: return method;
        }
    };
    const statusToVietnamese = (status, type) => {
        if (status === 'COMPLETED') return 'Hoàn thành';
        if (status === 'IN_PROGRESS') return 'Đang xử lý';
        if (status === 'PENDING') {
            if (type === 'OTHER') return 'Chờ duyệt';
            if (type === 'CIVIL' || type === 'ADMINISTRATIVE') return 'Chờ xử lý';
        }
        return status;
    };
    const resultToVietnamese = (ticket) => {
        if (ticket.status === 'COMPLETED') {
            if (ticket.result) return 'Đã có kết quả';
            return 'Chưa có kết quả';
        }
        return 'Chưa có kết quả';
    };

    const handleViewDetail = (ticket) => {
        setSelectedTicket(ticket);
    };

    return (
        <div className="test-history-page" style={{ padding: '20px' }}>
            <h2>Lịch sử xét nghiệm</h2>
            {tickets.length === 0 ? (
                <p>Không có dữ liệu xét nghiệm.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Ngày tạo</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Loại</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Phương thức</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Trạng thái</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Kết quả</th>
                        <th style={{ border: '1px solid #ccc', padding: '8px' }}>Xem lại đơn</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket, index) => (
                        <tr key={ticket.id || index}>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{new Date(ticket.createdAt).toLocaleString('vi-VN')}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{typeToVietnamese(ticket.type)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>{methodToVietnamese(ticket.method)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px', color: statusColor(ticket.status), fontWeight: 600 }}>{statusToVietnamese(ticket.status, ticket.type)}</td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                {ticket.status === 'COMPLETED' && ticket.result ? (
                                    <a href={`/uploads/results/${ticket.result}`} target="_blank" rel="noopener noreferrer">Tải file</a>
                                ) : (
                                    <span>{resultToVietnamese(ticket)}</span>
                                )}
                            </td>
                            <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                                <button onClick={() => handleViewDetail(ticket)}>Xem lại đơn</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
            {selectedTicket && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: '#fff', padding: '32px 24px', borderRadius: '8px', minWidth: 320, maxWidth: '90vw', boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
                    }}>
                        <h2>Chi tiết đơn xét nghiệm</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li><b>Ngày tạo:</b> {new Date(selectedTicket.createdAt).toLocaleString('vi-VN')}</li>
                            <li><b>Loại:</b> {typeToVietnamese(selectedTicket.type)}</li>
                            <li><b>Phương thức:</b> {methodToVietnamese(selectedTicket.method)}</li>
                            <li><b>Trạng thái:</b> {statusToVietnamese(selectedTicket.status, selectedTicket.type)}</li>
                            <li><b>Lý do:</b> {selectedTicket.reason}</li>
                            {selectedTicket.method === 'SELF_TEST' && (
                                <>
                                    <li><b>Địa chỉ:</b> {selectedTicket.address}</li>
                                    <li><b>Email:</b> {selectedTicket.email}</li>
                                    <li><b>Số điện thoại:</b> {selectedTicket.phone}</li>
                                </>
                            )}
                            {/* Thêm các trường khác nếu cần */}
                        </ul>
                        {selectedTicket.status === 'COMPLETED' && selectedTicket.result && (
                            <a href={`/uploads/results/${selectedTicket.result}`} target="_blank" rel="noopener noreferrer">
                                Tải kết quả
                            </a>
                        )}
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <button onClick={() => setSelectedTicket(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestHistoryPage;
