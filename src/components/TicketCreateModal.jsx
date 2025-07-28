import React, { useState, useEffect } from 'react';
import './TicketCreateModal.css';

const TicketCreateModal = ({ onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customerId: '',
        type: 'CIVIL',
        method: 'AT_FACILITY',
        status: 'PENDING',
        amount: '',
        email: '',
        phone: '',
        address: '',
        sample1Name: '',
        sample2Name: '',
        reason: ''
    });
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState('');
    const [loadingCustomers, setLoadingCustomers] = useState(true);
    const [staffList, setStaffList] = useState([]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const token = localStorage.getItem('token');
                // The backend doc specifies /api/users/all, let's use that.
                const response = await fetch('/api/users/all', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Failed to fetch customer list');
                const users = await response.json();
                setCustomers(users);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoadingCustomers(false);
            }
        };
        fetchCustomers();
    }, []);
    
    useEffect(() => {
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
                // ignore
            }
        };
        fetchStaff();
    }, []);
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customerId) {
            setError("Vui lòng chọn một khách hàng.");
            return;
        }

        // Validation cho số điện thoại (chỉ bao gồm số và có 10 số)
        if (formData.phone) {
            const phoneRegex = /^\d{10}$/;
            if (!phoneRegex.test(formData.phone)) {
                setError("❌ Số điện thoại không hợp lệ! Số điện thoại phải có đúng 10 chữ số.");
                return;
            }
        }

        // Validation cho Tên Mẫu 1 (không được chứa số và ký tự đặc biệt)
        if (formData.sample1Name) {
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
            if (!nameRegex.test(formData.sample1Name)) {
                setError("❌ Tên Mẫu 1 không hợp lệ! Tên chỉ được chứa chữ cái và khoảng trắng.");
                return;
            }
        }

        // Validation cho Tên Mẫu 2 (không được chứa số và ký tự đặc biệt)
        if (formData.sample2Name) {
            const nameRegex = /^[a-zA-ZÀ-ỹ\s]+$/;
            if (!nameRegex.test(formData.sample2Name)) {
                setError("❌ Tên Mẫu 2 không hợp lệ! Tên chỉ được chứa chữ cái và khoảng trắng.");
                return;
            }
        }

        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content create-modal">
                <h2>Tạo Ticket Xét nghiệm mới</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="customerId">Khách hàng</label>
                        <select name="customerId" id="customerId" value={formData.customerId} onChange={handleChange} required>
                            <option value="" disabled>{loadingCustomers ? 'Đang tải...' : '-- Chọn khách hàng --'}</option>
                            {customers.map(customer => (
                                <option key={customer.id} value={customer.id}>{customer.fullName} (ID: {customer.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="amount">Chi phí (VND)</label>
                        <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Loại xét nghiệm</label>
                        <select name="type" id="type" value={formData.type} onChange={handleChange}>
                            <option value="CIVIL">Dân sự</option>
                            <option value="ADMINISTRATIVE">Hành chính</option>
                            <option value="OTHER">Yêu cầu khác</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="method">Phương thức</label>
                        <select name="method" id="method" value={formData.method} onChange={handleChange}>
                            <option value="AT_FACILITY">Tại cơ sở</option>
                            <option value="SELF_TEST">Tự xét nghiệm</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input 
                            type="tel" 
                            name="phone" 
                            id="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="VD: 0123456789"
                            title="Số điện thoại phải có đúng 10 chữ số"
                            required 
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            ⚠️ Số điện thoại phải có đúng 10 chữ số
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="sample1Name">Tên mẫu 1</label>
                        <input 
                            type="text" 
                            name="sample1Name" 
                            id="sample1Name" 
                            value={formData.sample1Name} 
                            onChange={handleChange} 
                            placeholder="VD: Nguyễn Văn A"
                            title="Tên chỉ được chứa chữ cái và khoảng trắng"
                            required 
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            ⚠️ Tên chỉ được chứa chữ cái và khoảng trắng
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="sample2Name">Tên mẫu 2</label>
                        <input 
                            type="text" 
                            name="sample2Name" 
                            id="sample2Name" 
                            value={formData.sample2Name} 
                            onChange={handleChange} 
                            placeholder="VD: Trần Thị B"
                            title="Tên chỉ được chứa chữ cái và khoảng trắng"
                            required 
                        />
                        <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                            ⚠️ Tên chỉ được chứa chữ cái và khoảng trắng
                        </small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="reason">Lý do xét nghiệm</label>
                        <textarea name="reason" id="reason" value={formData.reason} onChange={handleChange} rows="3"></textarea>
                    </div>
                    <div className="form-group">
                        <label htmlFor="staffId">Nhân viên (tuỳ chọn)</label>
                        <select name="staffId" id="staffId" value={formData.staffId || ''} onChange={handleChange}>
                            <option value="">-- Không gán, ticket sẽ ở trạng thái Pending --</option>
                            {staffList.map(staff => (
                                <option key={staff.id} value={staff.id}>{staff.fullName} (ID: {staff.id})</option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-save">Tạo Ticket</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TicketCreateModal; 