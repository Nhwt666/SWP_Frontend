import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StaffLayout from '../components/StaffLayout';
import '../styles/StaffPage.css';
import { toast } from 'react-toastify';

const API_BASE = '';

const StaffPage = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);
    const navigate = useNavigate();

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

    // Fetch assigned tickets on mount
    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`${API_BASE}/tickets/assigned`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu.');
                const data = await res.json();
                setTickets(data);
            } catch (err) {
                setError(err.message || 'Lỗi không xác định');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, []);

    const handleSelectTicket = (id) => {
        setSelectedTicketId(id);
    };

    const handleAssignSelf = async (id) => {
        setStatusLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tickets/${id}/assign`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể nhận yêu cầu.');
            const updated = await res.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Đã nhận xử lý yêu cầu!');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi nhận yêu cầu');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setStatusLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tickets/${id}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái.');
            const updated = await res.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Cập nhật trạng thái thành công!');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleUpdateStatusVN = async (id, newStatus) => {
        setStatusLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tickets/${id}/status?status=${newStatus}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể cập nhật trạng thái.');
            const updated = await res.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Cập nhật trạng thái thành công!');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleUpdateType = async (id, newType) => {
        setStatusLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tickets/${id}/type?type=${newType}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể cập nhật loại yêu cầu.');
            const updated = await res.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Cập nhật loại yêu cầu thành công!');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi cập nhật loại yêu cầu');
        } finally {
            setStatusLoading(false);
        }
    };

    return (
        <StaffLayout>
            <div className="staff-page">
                <h2>Quản lý Yêu Cầu (Staff)</h2>
                {loading ? (
                    <p>Đang tải danh sách...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div className="ticket-list">
                        <h3>Danh sách Ticket được giao</h3>
                        <ul>
                            {tickets.length === 0 && <li>Không có yêu cầu nào được giao.</li>}
                            {tickets.map((ticket) => (
                                <li
                                    key={ticket.id}
                                    className={`ticket-item ${selectedTicketId === ticket.id ? 'selected' : ''} ${ticket.status === 'DONE' ? 'done' : ''}`}
                                    onClick={() => handleSelectTicket(ticket.id)}
                                >
                                    #{ticket.id} - {ticket.type} - Trạng thái: {ticket.status}
                                    {ticket.staff == null && (
                                        <button
                                            style={{ marginLeft: 12, fontSize: 13, padding: '4px 10px' }}
                                            onClick={e => { e.stopPropagation(); handleAssignSelf(ticket.id); }}
                                            disabled={statusLoading}
                                        >Nhận xử lý</button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedTicket && (
                    <div className="ticket-detail">
                        <h3>Chi tiết Ticket #{selectedTicket.id}</h3>
                        <p><strong>Trạng thái:</strong> {(() => {
                            switch(selectedTicket.status) {
                                case 'PENDING': return 'Chờ xử lý';
                                case 'IN_PROGRESS': return 'Đang xử lý';
                                case 'COMPLETED': return 'Đã hoàn thành';
                                default: return selectedTicket.status;
                            }
                        })()}</p>
                        <div style={{ display: 'flex', gap: 10, margin: '8px 0 18px 0' }}>
                            {[
                                { value: 'PENDING', label: 'Chờ xử lý' },
                                { value: 'IN_PROGRESS', label: 'Đang xử lý' },
                                { value: 'COMPLETED', label: 'Đã hoàn thành' },
                            ].map(st => (
                                selectedTicket.status !== st.value && (
                                    <button
                                        key={st.value}
                                        className="btn-processing"
                                        style={{ padding: '6px 16px', fontSize: 14 }}
                                        onClick={() => handleUpdateStatusVN(selectedTicket.id, st.value)}
                                        disabled={statusLoading}
                                    >
                                        Xác nhận trạng thái: {st.label}
                                    </button>
                                )
                            ))}
                        </div>
                        <p><strong>Khách hàng:</strong> {selectedTicket.customer?.fullName || selectedTicket.customer?.name || ''}</p>
                        <p><strong>Email:</strong> {selectedTicket.customer?.email || ''}</p>
                        <p><strong>SĐT:</strong> {selectedTicket.customer?.phone || ''}</p>
                        <p><strong>Địa chỉ:</strong> {selectedTicket.address || ''}</p>
                        <p><strong>Phương thức:</strong> {selectedTicket.method || ''}</p>
                        <p><strong>Lý do:</strong> {selectedTicket.reason || ''}</p>
                        <div style={{ marginTop: 18 }}>
                            {selectedTicket.status === 'PENDING' && (
                                <button
                                    className="btn-processing"
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'PROCESSING')}
                                    disabled={statusLoading}
                                >
                                    Đánh dấu Đang xử lý
                                </button>
                            )}
                            {selectedTicket.status === 'PROCESSING' && (
                                <button
                                    className="btn-submit-result"
                                    onClick={() => handleUpdateStatus(selectedTicket.id, 'DONE')}
                                    disabled={statusLoading}
                                >
                                    Đánh dấu Hoàn thành
                                </button>
                            )}
                            {selectedTicket.status === 'DONE' && (
                                <p className="done-msg">Ticket đã hoàn thành.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffPage;
