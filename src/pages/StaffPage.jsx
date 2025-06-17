import React, { useState } from 'react';
import { useHistory } from 'react-router-dom'; // Dùng để điều hướng sau khi thành công
import Header from '../components/Header';
import '../styles/StaffPage.css';
import { toast } from 'react-toastify'; // Thêm thông báo toast

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

const TicketPage = () => {
    const [tickets, setTickets] = useState(mockTickets);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [note, setNote] = useState('');
    const [result, setResult] = useState('');
    const history = useHistory(); // Dùng để điều hướng sau khi xử lý thành công

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

    const handleSelectTicket = (id) => {
        setSelectedTicketId(id);
        setNote('');
        setResult('');
    };

    const updateTicketStatus = (id, updates) => {
        setTickets((prevTickets) =>
            prevTickets.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
    };

    const handleMarkProcessing = () => {
        if (!selectedTicket || selectedTicket.status === 'Đang xử lý') return;
        updateTicketStatus(selectedTicket.id, { status: 'Đang xử lý' });
    };

    const handleSubmitResult = async () => {
        if (!selectedTicket) return;
        if (selectedTicket.type === 'Tại cơ sở' && !note.trim()) {
            toast.error('Vui lòng nhập ghi chú xử lý mẫu!');
            return;
        }
        if (!result.trim()) {
            toast.error('Vui lòng nhập kết quả xét nghiệm!');
            return;
        }

        // Gửi dữ liệu tới backend (POST request)
        const token = localStorage.getItem('jwtToken'); // Lấy token JWT từ localStorage
        if (!token) {
            toast.error('Vui lòng đăng nhập để tiếp tục!');
            return;
        }

        const ticketData = {
            type: selectedTicket.type,
            status: 'Done',
            customer: selectedTicket.customer,
            method: selectedTicket.type === 'Tại cơ sở' ? 'offline' : 'online',
            reason: selectedTicket.reason,
            note,
            result,
        };

        try {
            const response = await fetch('http://localhost:4323/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Gửi token trong header
                },
                body: JSON.stringify(ticketData),
            });

            if (response.ok) {
                // Cập nhật trạng thái ticket và thông báo thành công
                updateTicketStatus(selectedTicket.id, {
                    status: 'Done',
                    note,
                    result,
                });
                toast.success('Kết quả đã được gửi và ticket đánh dấu Done!');
                history.push('/tickets'); // Điều hướng về trang danh sách tickets
            } else {
                // Nếu có lỗi khi gửi dữ liệu
                toast.error('Lỗi khi tạo ticket. Vui lòng thử lại!');
            }
        } catch (error) {
            toast.error('Lỗi khi kết nối đến server. Vui lòng thử lại!');
        }

        // Reset lựa chọn và form
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

export default TicketPage;
