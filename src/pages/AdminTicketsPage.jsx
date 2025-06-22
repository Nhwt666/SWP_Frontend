import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminTicketsPage.css';
import TicketEditModal from '../components/TicketEditModal';
import TicketCreateModal from '../components/TicketCreateModal';

const AdminTicketsPage = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({ status: '', type: '', date: '' });
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);

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
    };

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const { status, type, date } = filters;
            if (status && ticket.status !== status) return false;
            if (type && ticket.type !== type) return false;
            if (date) {
                const ticketDate = new Date(ticket.createdAt).toISOString().split('T')[0];
                if (ticketDate !== date) return false;
            }
            return true;
        });
    }, [tickets, filters]);

    const handleSaveTicket = async (id, updatedData) => {
        try {
            const token = localStorage.getItem('token');
            const dataToSend = Object.fromEntries(
                Object.entries(updatedData).filter(([_, v]) => v !== '' && v !== null)
            );

            const response = await fetch(`/admin/tickets/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Không thể cập nhật ticket');
            }

            alert('Cập nhật ticket thành công!');
            handleCloseModal();
            fetchTickets();
        } catch (err) {
            console.error('Error updating ticket:', err);
            alert(`Lỗi khi cập nhật ticket: ${err.message}`);
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
            fetchTickets(); // Refresh the list
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
                    <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
                        &larr;
                    </button>
                    <h1>Quản lý Ticket Xét nghiệm</h1>
                </div>
                <button className="add-ticket-btn" onClick={handleCreateNew}>
                    + Thêm Ticket mới
                </button>
            </header>

            <div className="filters-container">
                <div className="filter-group">
                    <label htmlFor="status-filter">Lọc theo trạng thái</label>
                    <select id="status-filter" name="status" value={filters.status} onChange={handleFilterChange}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
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
            </div>

            <div className="tickets-table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Trạng thái</th>
                            <th>Loại</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTickets.length > 0 ? filteredTickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.customer ? ticket.customer.fullName : 'N/A'}</td>
                                <td>
                                    <span className={`status-badge ${getStatusStyle(ticket.status)}`}>
                                        {ticket.status}
                                    </span>
                                </td>
                                <td>{ticket.type}</td>
                                <td>{new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="action-buttons">
                                    <button className="edit-btn" onClick={() => handleEdit(ticket)}>Sửa</button>
                                    <button className="delete-btn" onClick={() => handleDelete(ticket.id)}>Xóa</button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="6">Không tìm thấy ticket nào.</td>
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
        </div>
    );
};

export default AdminTicketsPage; 