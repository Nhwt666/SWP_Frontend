import React, { useState, useEffect } from 'react';
import './TicketEditModal.css';

const TicketEditModal = ({ ticket, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [staffList, setStaffList] = useState([]);
    const [error, setError] = useState('');
    
    useEffect(() => {
        // Initialize form with ticket data
        if (ticket) {
            setFormData({
                status: ticket.status || 'PENDING',
                staffId: ticket.staff ? ticket.staff.id : '',
                resultString: (ticket.resultString || '').replace(/\\n/g, '\n'),
            });
        }

        // Fetch staff list
        const fetchStaff = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/admin/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch staff list');
                const users = await response.json();
                const staff = users.filter(user => user.role === 'STAFF');
                setStaffList(staff);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchStaff();
    }, [ticket]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(ticket.id, formData);
    };

    if (!ticket) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Chỉnh sửa Ticket #{ticket.id}</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="status">Trạng thái</label>
                        <select name="status" id="status" value={formData.status} onChange={handleChange}>
                            <option value="PENDING">Pending</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="staffId">Nhân viên phụ trách</label>
                        <select name="staffId" id="staffId" value={formData.staffId} onChange={handleChange}>
                            <option value="">-- Chọn nhân viên --</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.fullName} (ID: {staff.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="resultString">Kết quả</label>
                        <textarea
                            name="resultString"
                            id="resultString"
                            rows="4"
                            value={formData.resultString}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-save">Lưu thay đổi</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketEditModal; 