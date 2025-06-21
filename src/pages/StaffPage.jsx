import React, { useEffect, useState, useCallback } from 'react';
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
    const [search, setSearch] = useState('');
    const [resultOption, setResultOption] = useState('');

    const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

    const tabOptions = [
        { key: 'unassigned', label: 'Chờ nhận', endpoint: '/tickets/unassigned' },
        { key: 'inprogress', label: 'Đang nhận', endpoint: '/tickets/status/IN_PROGRESS' },
        { key: 'completed', label: 'Đã hoàn thành', endpoint: '/tickets/status/COMPLETED' },
    ];
    const [activeTab, setActiveTab] = useState('unassigned');

    const fetchTickets = useCallback(async (tabKey) => {
        setLoading(true);
        setError('');
        try {
            const tab = tabOptions.find(t => t.key === tabKey);
            const res = await fetch(tab.endpoint, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!res.ok) throw new Error('Không thể tải danh sách yêu cầu.');
            let data = await res.json();
            // Sắp xếp mới nhất đứng đầu
            data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTickets(data);
        } catch (err) {
            setError(err.message || 'Lỗi không xác định');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets(activeTab);
    }, [activeTab, fetchTickets]);

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
            // Sau khi nhận, chuyển trạng thái sang IN_PROGRESS
            const statusRes = await fetch(`${API_BASE}/tickets/${id}/status?status=IN_PROGRESS`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            if (!statusRes.ok) throw new Error('Không thể chuyển trạng thái.');
            const updated = await statusRes.json();
            setTickets((prev) => prev.map(t => t.id === id ? updated : t));
            toast.success('Đã nhận xử lý yêu cầu và chuyển sang Đang xử lý!');
        } catch (err) {
            toast.error(err.message || 'Lỗi khi nhận yêu cầu');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleUpdateStatus = async (id, newStatus) => {
        setStatusLoading(true);
        try {
            // Gán staff cho ticket trước nếu chưa có
            const ticket = tickets.find(t => t.id === id);
            if (!ticket.staff) {
                const assignRes = await fetch(`${API_BASE}/tickets/${id}/assign`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (!assignRes.ok) throw new Error('Không thể nhận yêu cầu.');
            }
            // Sau đó mới đổi trạng thái
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

    // Lọc ticket theo search
    const filteredTickets = tickets.filter(ticket => {
        if (!search.trim()) return true;
        const idMatch = ticket.id?.toString().includes(search.trim());
        const name = ticket.customer?.fullName || ticket.customer?.name || '';
        const nameMatch = name.toLowerCase().includes(search.trim().toLowerCase());
        return idMatch || nameMatch;
    });

    return (
        <StaffLayout>
            <div className="staff-page">
                <h2 className="staff-title-modern">Quản lý Yêu Cầu (Staff)</h2>
                <div className="modern-tabs-row">
                    {tabOptions.map(tab => (
                        <button
                            key={tab.key}
                            className={`modern-tab-btn${activeTab === tab.key ? ' active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <input
                        type="text"
                        className="modern-search-input"
                        placeholder="Tìm theo ID hoặc tên khách hàng..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {loading ? (
                    <div className="staff-spinner"><div className="spinner"></div></div>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : (
                    <div className="ticket-list-modern fade-in">
                        <h3 className="ticket-list-title-modern">Danh sách Ticket được giao</h3>
                        <ul className="ticket-ul-modern">
                            {filteredTickets.length === 0 && <li className="ticket-empty-modern">Không có yêu cầu nào phù hợp.</li>}
                            {filteredTickets.map((ticket) => (
                                <React.Fragment key={ticket.id}>
                                    <li
                                        className={`ticket-item-modern${selectedTicketId === ticket.id ? ' selected' : ''}`}
                                        onClick={() => setSelectedTicketId(selectedTicketId === ticket.id ? null : ticket.id)}
                                    >
                                        <span className="ticket-id-modern">#{ticket.id}</span>
                                        <span className="ticket-type-modern">{ticket.type}</span>
                                        <span className={`ticket-status-badge-list status-${ticket.status.toLowerCase()}`}>{(() => {
                                            switch(ticket.status) {
                                                case 'PENDING': return 'Chờ xử lý';
                                                case 'IN_PROGRESS': return 'Đang xử lý';
                                                case 'COMPLETED': return 'Đã hoàn thành';
                                                default: return ticket.status;
                                            }
                                        })()}</span>
                                        <span className="ticket-customer-modern">{ticket.customer?.fullName || ticket.customer?.name || ''}</span>
                                    </li>
                                    {selectedTicketId === ticket.id && (
                                        <li>
                                            <div className="ticket-detail modern-card fade-in" style={{marginTop: 8, marginBottom: 8}}>
                                                <h3 className="ticket-detail-title">Chi tiết Ticket #{ticket.id}</h3>
                                                <div className="ticket-status-row">
                                                    <span className={`ticket-status-badge status-${ticket.status.toLowerCase()}`}>{(() => {
                                                        switch(ticket.status) {
                                                            case 'PENDING': return 'Chờ xử lý';
                                                            case 'IN_PROGRESS': return 'Đang xử lý';
                                                            case 'COMPLETED': return 'Đã hoàn thành';
                                                            default: return ticket.status;
                                                        }
                                                    })()}</span>
                                                </div>
                                                <div className="ticket-info-grid">
                                                    <div><strong>Khách hàng:</strong> <span>{ticket.customer?.fullName || ticket.customer?.name || ''}</span></div>
                                                    <div><strong>Email:</strong> <span>{ticket.customer?.email || ''}</span></div>
                                                    <div><strong>SĐT:</strong> <span>{ticket.customer?.phone || ''}</span></div>
                                                    <div><strong>Địa chỉ:</strong> <span>{ticket.address || ''}</span></div>
                                                    <div><strong>Phương thức:</strong> <span>{ticket.method || ''}</span></div>
                                                    <div><strong>Lý do:</strong> <span>{ticket.reason || ''}</span></div>
                                                </div>
                                                {ticket.status === 'PENDING' && ticket.staff == null && (
                                                    <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
                                                        <button
                                                            className="btn-processing modern-btn"
                                                            onClick={e => { e.stopPropagation(); handleAssignSelf(ticket.id); }}
                                                            disabled={statusLoading}
                                                        >
                                                            Nhận xử lý
                                                        </button>
                                                    </div>
                                                )}
                                                {ticket.status === 'IN_PROGRESS' && (
                                                    <div style={{ margin: '24px 0 0 0', textAlign: 'center' }}>
                                                        <label style={{ marginRight: 10, fontWeight: 600, fontSize: 16 }}>Kết quả xử lý:</label>
                                                        <select
                                                            value={resultOption}
                                                            onChange={e => setResultOption(e.target.value)}
                                                            className="modern-select"
                                                        >
                                                            <option value="">-- Chọn kết quả --</option>
                                                            <option value="match">Thông tin trùng khớp</option>
                                                            <option value="not_match">Thông tin không trùng khớp</option>
                                                        </select>
                                                        {resultOption && (
                                                            <>
                                                                <p style={{ marginTop: 12, fontStyle: 'italic', color: '#1976d2', fontSize: 15 }}>
                                                                    {resultOption === 'match'
                                                                        ? 'Kết luận: Thông tin xác minh trùng khớp với hồ sơ.'
                                                                        : 'Kết luận: Thông tin xác minh không trùng khớp với hồ sơ.'}
                                                                </p>
                                                                <button
                                                                    className="btn-complete modern-btn"
                                                                    style={{ marginTop: 16 }}
                                                                    onClick={e => { e.stopPropagation(); handleUpdateStatusVN(ticket.id, 'COMPLETED'); }}
                                                                    disabled={statusLoading}
                                                                >
                                                                    Xác nhận Hoàn thành
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                {ticket.status === 'COMPLETED' && (
                                                    <div className="done-msg modern-done-msg">Yêu cầu đã hoàn thành.</div>
                                                )}
                                            </div>
                                        </li>
                                    )}
                                </React.Fragment>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </StaffLayout>
    );
};

export default StaffPage;
