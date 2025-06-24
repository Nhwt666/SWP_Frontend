import React, { useState, useEffect } from 'react';
import './TicketEditModal.css';

const TicketEditModal = ({ ticket, onClose, onSave, error }) => {
    const [formData, setFormData] = useState({});
    const [staffList, setStaffList] = useState([]);
    
    useEffect(() => {
        if (ticket) {
            const aDate = ticket.appointmentDate ? new Date(ticket.appointmentDate) : null;
            if (aDate) {
                aDate.setMinutes(aDate.getMinutes() - aDate.getTimezoneOffset());
            }
            const formattedDate = aDate ? aDate.toISOString().slice(0, 16) : '';

            setFormData({
                staffId: ticket.staff?.id || '',
                ticketType: ticket.ticketType || 'OTHER',
                method: ticket.method || '',
                reason: ticket.reason || '',
                phone: ticket.phone || '',
                email: ticket.email || '',
                address: ticket.address || '',
                appointmentDate: formattedDate,
                amount: ticket.amount ?? '',
            });
        }

        const fetchStaff = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/admin/all-users?role=STAFF', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch staff list');
                const staffData = await response.json();
                setStaffList(staffData.map(s => s.user));
            } catch (err) {
                console.error("Error fetching staff:", err);
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
                
                <form onSubmit={handleSubmit} className="edit-ticket-form">
                    <div className="form-grid">
                        <div className="form-group info-only">
                            <label>Khách hàng</label>
                            <span>{ticket.customer?.fullName || 'Chưa Có Thông Tin'}</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="staffId">Nhân viên</label>
                            <select name="staffId" id="staffId" value={formData.staffId} onChange={handleChange}>
                                <option value="">-- Bỏ gán / Chọn nhân viên --</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.fullName} (ID: {staff.id})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="ticketType">Loại Ticket</label>
                            <select name="ticketType" id="ticketType" value={formData.ticketType} onChange={handleChange}>
                                <option value="CIVIL">Dân sự</option>
                                <option value="ADMINISTRATIVE">Hành chính</option>
                                <option value="OTHER">Yêu cầu khác</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="method">Phương thức</label>
                            <input type="text" id="method" name="method" value={formData.method} onChange={handleChange} />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="reason">Lý do</label>
                            <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows="3" />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="phone">SĐT Khách hàng</label>
                            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Khách hàng</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="address">Địa chỉ</label>
                            <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="appointmentDate">Ngày hẹn</label>
                            <input type="datetime-local" id="appointmentDate" name="appointmentDate" value={formData.appointmentDate} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label htmlFor="amount">Thanh toán (VNĐ)</label>
                            <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} placeholder="Nhập số tiền" />
                        </div>
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