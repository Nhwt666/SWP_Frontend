import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import '../styles/AdminTicketsPage.css';
import TicketEditModal from '../components/TicketEditModal';
import TicketCreateModal from '../components/TicketCreateModal';
import Header from '../components/Header';
import AdminLayout from '../components/AdminLayout';

const AdminTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const { preselectedStaffId, preselectedCustomerId, staffName, customerName } = useParams();
    const [filters, setFilters] = useState({ 
        status: '', 
        type: '', 
        date: '' 
    });
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [pendingTickets, setPendingTickets] = useState([]);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [assigningStaffId, setAssigningStaffId] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectingTicket, setRejectingTicket] = useState(null);
    const [rejectReason, setRejectReason] = useState('');


    const typeDisplayMap = {
        'CIVIL': 'Dân sự',
        'ADMINISTRATIVE': 'Hành chính', 
        'OTHER': 'Yêu cầu khác'
    };


    const statusDisplayMap = {
        'PENDING': 'Chờ xử lý',
        'IN_PROGRESS': 'Đang xử lý',
        'RECEIVED': 'Đã nhận kit',
        'CONFIRMED': 'Đã xác nhận Yêu Cầu',
        'COMPLETED': 'Đã hoàn thành',
        'CANCELLED': 'Đã hủy',
        'REJECTED': 'Đã từ chối'
    };

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error("Authentication token not found.");
            }

            const response = await fetch('/admin/tickets', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch tickets');
            }

            const data = await response.json();
            setTickets(data);
        } catch (err) {
            console.error("Error fetching tickets:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleEdit = (ticket) => {
        setEditingTicket(ticket);
        setIsEditModalOpen(true);
    };

    const handleCreateNew = () => {
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setIsCreateModalOpen(false);
        setEditingTicket(null);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const resetFilters = () => {
        setFilters({ status: '', type: '', date: '' });
        if (preselectedStaffId) {
            navigate('/admin/tickets', { replace: true, state: {} });
        }
    };

    const filteredTickets = useMemo(() => {
        const filtered = tickets.filter(ticket => {
            if (preselectedStaffId && ticket.staff?.id !== preselectedStaffId) {
                return false;
            }
            if (preselectedCustomerId && ticket.customer?.id !== preselectedCustomerId) {
                return false;
            }
            const { status, type, date } = filters;
            if (status && ticket.status !== status) return false;
            if (type && ticket.type !== type) return false;
            if (date) {
                const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
                if (ticketDate !== date) return false;
            }
            return true;
        });
        // Sort by createdAt descending (newest first)
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [tickets, filters, preselectedStaffId, preselectedCustomerId]);

    const handleSaveTicket = async (id, updatedData) => {
        const token = localStorage.getItem('token');
        const originalTicket = tickets.find(t => t.id === id);

        try {

            const newStaffId = updatedData.staffId;
            const oldStaffId = originalTicket.staff?.id;

            if (String(newStaffId || '') !== String(oldStaffId || '')) {
                if (newStaffId) {
                    const assignRes = await fetch(`/admin/tickets/${id}/assign/${newStaffId}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!assignRes.ok) {
                        const errorData = await assignRes.json();
                        throw new Error(errorData.message || 'Không thể gán nhân viên');
                    }
                } else {
                    const unassignRes = await fetch(`/admin/tickets/${id}/unassign`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                     if (!unassignRes.ok) {
                        const errorData = await unassignRes.json();
                        throw new Error(errorData.message || 'Không thể bỏ gán nhân viên');
                    }
                }
            }


            const { staffId, ...otherData } = updatedData;
            

            const dataToUpdate = { ...otherData };
            if (dataToUpdate.appointmentDate === '') dataToUpdate.appointmentDate = null;
            if (dataToUpdate.amount === '' || dataToUpdate.amount === null) {
                dataToUpdate.amount = null;
            } else {
                dataToUpdate.amount = parseFloat(dataToUpdate.amount);
            }
            
            const updateRes = await fetch(`/admin/tickets/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(dataToUpdate)
            });

            if (!updateRes.ok) {
                const errorData = await updateRes.json();
                throw new Error(errorData.message || 'Không thể cập nhật thông tin ticket');
            }
            
            alert('Cập nhật ticket thành công!');
            handleCloseModal();
            fetchTickets();

        } catch (err) {
            console.error('Error updating ticket:', err);
            alert(`Lỗi khi cập nhật: ${err.message}`);
        }
    };

    const handleCreateTicket = async (newTicketData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/admin/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newTicketData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể tạo ticket');
            }
            
            alert('Tạo ticket mới thành công!');
            handleCloseModal();
            fetchTickets();
        } catch (err) {
            console.error('Error creating ticket:', err);
            alert(`Lỗi khi tạo ticket: ${err.message}`);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ticket này không?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/admin/tickets/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 204 || response.ok) {
                    alert('Xóa ticket thành công!');
                    setTickets(tickets.filter(ticket => ticket.id !== id));
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Không thể xóa ticket.' }));
                    throw new Error(errorData.message);
                }
            } catch (err) {
                console.error('Error deleting ticket:', err);
                alert(`Lỗi khi xóa ticket: ${err.message}`);
            }
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'PENDING':
                return 'status-pending';
            case 'COMPLETED':
                return 'status-completed';
            case 'CANCELLED':
                return 'status-cancelled';
            case 'REJECTED':
                return 'status-rejected';
            case 'IN_PROGRESS':
                return 'status-in_progress';
            case 'RECEIVED':
                return 'status-received';
            case 'CONFIRMED':
                return 'status-confirmed';
            default:
                return '';
        }
    };


    const fetchPendingTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/admin/tickets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch tickets');
            const data = await response.json();
            setPendingTickets(data.filter(t => t.status === 'PENDING' && !t.staff));
        } catch (err) {
            setPendingTickets([]);
        }
    };


    const handleOpenPendingModal = () => {
        fetchPendingTickets();
        setIsPendingModalOpen(true);
    };
    const handleClosePendingModal = () => setIsPendingModalOpen(false);


    const fetchStaffList = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/admin/all-users?role=STAFF', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch staff list');
            const staffData = await response.json();
            setStaffList(staffData.map(s => s.user));
        } catch (err) {
            setStaffList([]);
        }
    };


    const handleOpenStaffModal = (ticketId) => {
        setSelectedTicketId(ticketId);
        fetchStaffList();
        setIsStaffModalOpen(true);
    };
    const handleCloseStaffModal = () => {
        setIsStaffModalOpen(false);
        setSelectedTicketId(null);
    };


    const handleAssignStaff = async (staffId) => {
        if (!selectedTicketId) return;
        setAssigningStaffId(staffId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/admin/tickets/${selectedTicketId}/assign/${staffId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Không thể gán ticket');
            handleCloseStaffModal();
            fetchTickets();
        } catch (err) {
            alert('Lỗi khi gán ticket: ' + err.message);
        } finally {
            setAssigningStaffId(null);
        }
    };

    if (loading) {
        return <div className="loading-container">⏳ Đang tải dữ liệu...</div>;
    }

    if (error) {
        return <div className="error-container">❌ Lỗi: {error}</div>;
    }

    return (
        <>
            <Header />
            <AdminLayout>
                <div className="admin-tickets-page">
                    <header className="tickets-header">
                        <div className="header-left-section">
                            <button className="back-btn" onClick={() => navigate(-1)}>&larr;</button>
                            <h1>
                                {staffName ? `Tickets cho: ${staffName}` : customerName ? `Tickets của: ${customerName}` : 'Quản lý Yêu Cầu Xét nghiệm'}
                            </h1>
                        </div>
                    </header>

                    <div className="filters-container">
                        <div className="filter-group">
                            <label htmlFor="status-filter">Lọc theo trạng thái</label>
                            <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="IN_PROGRESS">Đang xử lý</option>
                                <option value="RECEIVED">Đã nhận kit</option>
                                <option value="CONFIRMED">Đã xác nhận Yêu Cầu</option>
                                <option value="COMPLETED">Đã hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                                <option value="REJECTED">Đã từ chối</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="type-filter">Lọc theo loại</label>
                            <select id="type-filter" name="type" value={filters.type} onChange={handleFilterChange}>
                                <option value="">Tất cả các loại</option>
                                <option value="CIVIL">Dân sự</option>
                                <option value="ADMINISTRATIVE">Hành chính</option>
                                <option value="OTHER">Yêu cầu khác</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label htmlFor="date-filter">Lọc theo ngày</label>
                            <input type="date" id="date-filter" name="date" value={filters.date} onChange={handleFilterChange} />
                        </div>
                        <button className="reset-filters-btn" onClick={resetFilters}>Xóa bộ lọc</button>
                        {preselectedStaffId && (
                            <button 
                                className="reset-filters-btn" 
                                style={{ background: '#43a047', color: '#fff', marginLeft: 8 }} 
                                onClick={handleOpenPendingModal}
                            >
                                Thêm Ticket
                            </button>
                        )}
                    </div>

                    <div className="tickets-table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>KHÁCH HÀNG</th>
                                    <th>NHÂN VIÊN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th>LOẠI</th>
                                    <th>NGÀY TẠO</th>
                                    <th>HÀNH ĐỘNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.length > 0 ? (
                                    filteredTickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.customer?.fullName || 'Chưa Có Thông Tin'}</td>
                                            <td>{ticket.staff?.fullName || '—'}</td>
                                            <td><span className={`status-badge ${getStatusStyle(ticket.status)}`}>{statusDisplayMap[ticket.status] || ticket.status}</span></td>
                                            <td>{typeDisplayMap[ticket.ticketType || ticket.type] || ticket.type || '—'}</td>
                                            <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                            <td className="action-buttons">
                                                <button className="delete-btn" onClick={() => handleDelete(ticket.id)}>Xóa</button>
                                                {preselectedCustomerId && (
                                                    ticket.status === 'IN_PROGRESS' ? (
                                                        <button className="edit-btn" style={{background: '#fb8c00', color: '#fff'}} onClick={() => handleOpenStaffModal(ticket.id)}>Đổi staff</button>
                                                    ) : (
                                                        <button className="edit-btn" style={{background: '#43a047', color: '#fff'}} onClick={() => handleOpenStaffModal(ticket.id)}>Thêm staff</button>
                                                    )
                                                )}
                                                {ticket.status === 'PENDING' && (
                                                    <button
                                                        className="reject-btn"
                                                        onClick={() => {
                                                            setRejectingTicket(ticket);
                                                            setIsRejectModalOpen(true);
                                                            setRejectReason('');
                                                        }}
                                                    >
                                                        Từ chối
                                                    </button>
                                                )}

                                                {ticket.type === 'CIVIL' && ticket.method === 'SELF_TEST' && (ticket.status === 'CONFIRMED' || ticket.status === 'RECEIVED') && (
                                                    <span style={{ 
                                                        fontSize: '0.8rem', 
                                                        color: '#666', 
                                                        fontStyle: 'italic',
                                                        marginLeft: '8px'
                                                    }}>
                                                        {ticket.status === 'CONFIRMED' 
                                                            ? '⏳ Chờ member xác nhận nhận kit'
                                                            : '⏳ Chờ member gửi kit về'
                                                        }
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7">Không tìm thấy ticket nào.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {isEditModalOpen && (
                        <TicketEditModal
                            ticket={editingTicket}
                            onClose={handleCloseModal}
                            onSave={handleSaveTicket}
                        />
                    )}

                    {isPendingModalOpen && (
                        <div className="modal-overlay" onClick={handleClosePendingModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
                                <h2>Danh sách Ticket đang Chờ xử lý</h2>
                                <button className="modal-close-btn" onClick={handleClosePendingModal}>&times;</button>
                                <table style={{width: '100%', marginTop: 16}}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Khách hàng</th>
                                            <th>Loại</th>
                                            <th>Ngày tạo</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingTickets.length === 0 ? (
                                            <tr><td colSpan="5">Không có ticket nào đang chờ xử lý.</td></tr>
                                        ) : (
                                            pendingTickets.map(ticket => (
                                                <tr key={ticket.id}>
                                                    <td>{ticket.id}</td>
                                                    <td>{ticket.customer?.fullName || 'Chưa Có Thông Tin'}</td>
                                                    <td>{typeDisplayMap[ticket.ticketType || ticket.type] || ticket.type || '—'}</td>
                                                    <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                                    <td>
                                                        <button disabled={assigning} onClick={async () => {
                                                            setAssigning(true);
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                const res = await fetch(`/admin/tickets/${ticket.id}/assign/${preselectedStaffId}`, {
                                                                    method: 'PUT',
                                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                                });
                                                                if (!res.ok) throw new Error('Không thể gán ticket');
                                                                setPendingTickets(pendingTickets.filter(t => t.id !== ticket.id));
                                                                fetchTickets();
                                                            } catch (err) {
                                                                alert('Lỗi khi gán ticket: ' + err.message);
                                                            } finally {
                                                                setAssigning(false);
                                                            }
                                                        }}>+</button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isStaffModalOpen && (
                        <div className="modal-overlay" onClick={handleCloseStaffModal}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
                                <h2>Chọn nhân viên để {(() => {
                                    const ticket = tickets.find(t => t.id === selectedTicketId);
                                    return ticket && ticket.status === 'IN_PROGRESS' ? 'đổi staff' : 'gán Ticket';
                                })()}</h2>
                                <button className="modal-close-btn" onClick={handleCloseStaffModal}>&times;</button>
                                <table style={{width: '100%', marginTop: 16}}>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Họ tên</th>
                                            <th>Email</th>
                                            <th>Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffList.length === 0 ? (
                                            <tr><td colSpan="4">Không có nhân viên nào.</td></tr>
                                        ) : (
                                            staffList.map(staff => {
                                                const ticket = tickets.find(t => t.id === selectedTicketId);
                                                const isCurrent = ticket && ticket.staff && staff.id === ticket.staff.id;
                                                return (
                                                    <tr key={staff.id} style={isCurrent ? {background: '#e3f2fd'} : {}}>
                                                        <td>{staff.id}</td>
                                                        <td>{staff.fullName}</td>
                                                        <td>{staff.email}</td>
                                                        <td>
                                                            {isCurrent ? (
                                                                <button disabled style={{opacity: 0.7, cursor: 'not-allowed'}}>Đang phụ trách</button>
                                                            ) : (
                                                                <button disabled={assigningStaffId === staff.id} onClick={() => handleAssignStaff(staff.id)}>+</button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {isRejectModalOpen && (
                        <div className="modal-overlay" onClick={() => setIsRejectModalOpen(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 440, borderRadius: 16, padding: 32, boxShadow: '0 4px 32px rgba(239,68,68,0.13)'}}>
                                <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10}}>
                                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#fee2e2"/><path d="M16 10v7" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round"/><circle cx="16" cy="22" r="1.4" fill="#ef4444"/></svg>
                                    <h2 style={{color: '#ef4444', fontWeight: 800, fontSize: 20, margin: 0}}>Lý do từ chối Yêu Cầu #{rejectingTicket?.id}</h2>
                                </div>
                                <textarea
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Nhập lý do từ chối..."
                                    rows={4}
                                    style={{ width: '100%', borderRadius: 10, border: '1.5px solid #3b82f6', padding: '0.7rem 1rem', marginTop: 12, fontSize: 16, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', resize: 'vertical', minHeight: 80 }}
                                />
                                <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                    <button className="btn-cancel" style={{background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 600, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(30,58,138,0.06)', transition: 'background 0.2s'}} onClick={() => setIsRejectModalOpen(false)}>Hủy</button>
                                    <button
                                        className="reject-btn"
                                        style={{ minWidth: 120, background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 28px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 2px 8px rgba(239,68,68,0.10)', transition: 'background 0.2s'}}
                                        onClick={async () => {
                                            if (!rejectReason.trim()) {
                                                alert('Vui lòng nhập lý do từ chối.');
                                                return;
                                            }
                                            try {
                                                const token = localStorage.getItem('token');
                                                const res = await fetch(`/admin/tickets/${rejectingTicket.id}/reject`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}`
                                                    },
                                                    body: JSON.stringify({
                                                        rejectedReason: rejectReason,
                                                        status: 'REJECTED'
                                                    })
                                                });
                                                if (!res.ok) {
                                                    const err = await res.text();
                                                    throw new Error(err || 'Không thể từ chối ticket');
                                                }
                                                alert('Đã từ chối ticket thành công!');
                                                setIsRejectModalOpen(false);
                                                setRejectingTicket(null);
                                                setRejectReason('');
                                                fetchTickets();
                                            } catch (err) {
                                                alert('Lỗi khi từ chối ticket: ' + err.message);
                                            }
                                        }}
                                    >
                                        Xác nhận từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </AdminLayout>
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div>
                            <div><strong>Số Hotline:</strong> 1800.9999</div>
                            <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                            <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                        </div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default AdminTicketsPage; 