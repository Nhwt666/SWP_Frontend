import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/AdminTicketsPage.css';
import TicketEditModal from '../components/TicketEditModal';
import TicketCreateModal from '../components/TicketCreateModal';

const AdminTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const [filters, setFilters] = useState({ 
        status: location.state?.filterStatus || '', 
        type: '', 
        date: '' 
    });
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const preselectedStaffId = location.state?.staffId;
    const staffName = location.state?.staffName;
    const preselectedCustomerId = location.state?.customerId;
    const customerName = location.state?.customerName;
    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [pendingTickets, setPendingTickets] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
    const [staffList, setStaffList] = useState([]);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [assigningStaffId, setAssigningStaffId] = useState(null);

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
        return tickets.filter(ticket => {
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
    }, [tickets, filters, preselectedStaffId, preselectedCustomerId]);

    const handleSaveTicket = async (id, updatedData) => {
        const token = localStorage.getItem('token');
        const originalTicket = tickets.find(t => t.id === id);

        try {
            // 1. Handle staff assignment/unassignment
            const newStaffId = updatedData.staffId;
            const oldStaffId = originalTicket.staff?.id;

            if (String(newStaffId || '') !== String(oldStaffId || '')) {
                if (newStaffId) { // Assign or re-assign
                    const assignRes = await fetch(`/admin/tickets/${id}/assign/${newStaffId}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (!assignRes.ok) {
                        const errorData = await assignRes.json();
                        throw new Error(errorData.message || 'Không thể gán nhân viên');
                    }
                } else { // Unassign
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

            // 2. Handle other data updates
            const { staffId, ...otherData } = updatedData;
            
            // Prepare data for submission
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
            default:
                return '';
        }
    };

    // Fetch all pending tickets (not assigned to any staff)
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

    // Open modal and fetch pending tickets
    const handleOpenPendingModal = () => {
        fetchPendingTickets();
        setIsPendingModalOpen(true);
    };
    const handleClosePendingModal = () => setIsPendingModalOpen(false);

    // Fetch staff list
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

    // Open staff modal for a ticket
    const handleOpenStaffModal = (ticketId) => {
        setSelectedTicketId(ticketId);
        fetchStaffList();
        setIsStaffModalOpen(true);
    };
    const handleCloseStaffModal = () => {
        setIsStaffModalOpen(false);
        setSelectedTicketId(null);
    };

    // Assign staff to ticket
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
        <div className="admin-tickets-page">
            <header className="tickets-header">
                <div className="header-left-section">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        &larr;
                    </button>
                    <h1>
                        {staffName ? `Tickets cho: ${staffName}` : customerName ? `Tickets của: ${customerName}` : 'Quản lý Ticket Xét nghiệm'}
                    </h1>
                </div>
            </header>

            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="status-filter">Lọc theo trạng thái</label>
                    <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label htmlFor="type-filter">Lọc theo loại</label>
                    <select id="type-filter" name="type" value={filters.type} onChange={handleFilterChange}>
                        <option value="">Tất cả các loại</option>
                        <option value="CIVIL">Civil</option>
                        <option value="ADMINISTRATIVE">Administrative</option>
                        <option value="OTHER">Other</option>
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
                                    <td>{ticket.customer?.fullName || 'N/A'}</td>
                                    <td>{ticket.staff?.fullName || '—'}</td>
                                    <td><span className={`status-badge status-${ticket.status?.toLowerCase()}`}>{ticket.status}</span></td>
                                    <td>{ticket.ticketType || ticket.type || '—'}</td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td>
                                        <button className="delete-btn" onClick={() => handleDelete(ticket.id)}>Xóa</button>
                                        {preselectedCustomerId && (
                                            ticket.status === 'IN_PROGRESS' ? (
                                                <button className="edit-btn" style={{background: '#fb8c00', color: '#fff'}} onClick={() => handleOpenStaffModal(ticket.id)}>Đổi staff</button>
                                            ) : (
                                                <button className="edit-btn" style={{background: '#43a047', color: '#fff'}} onClick={() => handleOpenStaffModal(ticket.id)}>Thêm staff</button>
                                            )
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
            {isCreateModalOpen && (
                <TicketCreateModal
                    onClose={handleCloseModal}
                    onSave={handleCreateTicket}
                />
            )}
            {/* Pending Tickets Modal */}
            {isPendingModalOpen && (
                <div className="modal-overlay" onClick={handleClosePendingModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: 600}}>
                        <h2>Danh sách Ticket đang PENDING</h2>
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
                                    <tr><td colSpan="5">Không có ticket nào đang pending.</td></tr>
                                ) : (
                                    pendingTickets.map(ticket => (
                                        <tr key={ticket.id}>
                                            <td>{ticket.id}</td>
                                            <td>{ticket.customer?.fullName || 'N/A'}</td>
                                            <td>{ticket.ticketType || ticket.type || '—'}</td>
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
            {/* Staff Assign Modal for customer tickets */}
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
        </div>
    );
};

export default AdminTicketsPage; 