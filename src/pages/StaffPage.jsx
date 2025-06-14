import React, { useState } from 'react';
import Header from '../components/Header';
import '../styles/StaffPage.css';

const mockTickets = [
    {
        id: 1,
        type: 'Tự gửi mẫu',
        status: 'Mới',
        customer: {
            name: 'Nguyễn Văn A',
            email: 'a@example.com',
            phone: '0912345678',
        },
    },
    {
        id: 2,
        type: 'Tại cơ sở',
        status: 'Mới',
        customer: {
            name: 'Trần Thị B',
            email: 'b@example.com',
            phone: '0987654321',
        },
    },
    {
        id: 3,
        type: 'Yêu cầu khác',
        status: 'Mới',
        customer: {
            name: 'Lê Văn C',
            email: 'c@example.com',
            phone: '0909090909',
        },
    },
];

const StaffPage = () => {
    const [tickets, setTickets] = useState(mockTickets);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [note, setNote] = useState('');
    const [result, setResult] = useState('');

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

    const handleSelectTicket = (id) => {
        setSelectedTicketId(id);
        setNote('');
        setResult('');
        // Nếu cần, có thể reset trạng thái tạm thời ở đây
    };

    const updateTicketStatus = (id, updates) => {
        setTickets((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const handleMarkProcessing = () => {
        if (!selectedTicket) return;
        updateTicketStatus(selectedTicket.id, { status: 'Đang xử lý' });
    };

    const handleSubmitResult = () => {
        if (!selectedTicket) return;
        if (selectedTicket.type === 'Tại cơ sở' && !note.trim()) {
            alert('Vui lòng nhập ghi chú xử lý mẫu!');
            return;
        }
        if (!result.trim()) {
            alert('Vui lòng nhập kết quả xét nghiệm!');
            return;
        }

        // Cập nhật trạng thái Done và lưu note, result
        updateTicketStatus(selectedTicket.id, {
            status: 'Done',
            note,
            result,
        });

        // Gửi mail/sms giả lập
        console.log(`Đã gửi kết quả đến email: ${selectedTicket.customer.email} - SĐT: ${selectedTicket.customer.phone}`);
        alert('Kết quả đã được gửi và ticket đánh dấu Done!');

        // Reset lựa chọn
        setSelectedTicketId(null);
        setNote('');
        setResult('');
    };

    return (
        <>
            <Header />
            <div className="staff-page">
                <h2>Quản lý Lịch Xét Nghiệm (Staff)</h2>
                <div className="ticket-list">
                    <h3>Danh sách Ticket</h3>
                    <ul>
                        {tickets.map((ticket) => (
                            <li
                                key={ticket.id}
                                className={`ticket-item ${selectedTicketId === ticket.id ? 'selected' : ''} ${ticket.status === 'Done' ? 'done' : ''}`}
                                onClick={() => handleSelectTicket(ticket.id)}
                            >
                                #{ticket.id} - {ticket.type} - Trạng thái: {ticket.status}
                            </li>
                        ))}
                    </ul>
                </div>

                {selectedTicket && (
                    <div className="ticket-detail">
                        <h3>Chi tiết Ticket #{selectedTicket.id}</h3>
                        <p><strong>Loại ticket:</strong> {selectedTicket.type}</p>
                        <p><strong>Khách hàng:</strong> {selectedTicket.customer.name}</p>
                        <p><strong>Email:</strong> {selectedTicket.customer.email}</p>
                        <p><strong>SĐT:</strong> {selectedTicket.customer.phone}</p>
                        <p><strong>Trạng thái:</strong> {selectedTicket.status}</p>

                        {selectedTicket.status === 'Mới' && (
                            <button onClick={handleMarkProcessing} className="btn-processing">
                                Đánh dấu đang xử lý
                            </button>
                        )}

                        {selectedTicket.status === 'Đang xử lý' && (
                            <>
                                {selectedTicket.type === 'Tại cơ sở' && (
                                    <div className="form-group">
                                        <label>Ghi chú xử lý mẫu (bác sĩ):</label>
                                        <textarea
                                            rows={4}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Ghi chú mẫu xét nghiệm..."
                                        />
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Kết quả xét nghiệm:</label>
                                    <textarea
                                        rows={4}
                                        value={result}
                                        onChange={(e) => setResult(e.target.value)}
                                        placeholder="Nhập kết quả xét nghiệm..."
                                    />
                                </div>

                                <button onClick={handleSubmitResult} className="btn-submit-result">
                                    Trả kết quả và đánh dấu Done
                                </button>
                            </>
                        )}

                        {selectedTicket.status === 'Done' && (
                            <p className="done-msg">Ticket đã hoàn thành.</p>
                        )}
                    </div>
                )}
            </div>
        </>
    );
};

export default StaffPage;
