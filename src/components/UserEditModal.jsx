import React, { useState, useEffect } from 'react';
import './UserEditModal.css';

const UserEditModal = ({ user, onClose, onSave, error }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        role: '',
        phone: '',
        address: '',
        walletBalance: 0
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                role: user.role || 'CUSTOMER',
                phone: user.phone || '',
                address: user.address || '',
                walletBalance: user.walletBalance || 0
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(user.id, formData);
    };

    if (!user) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content edit-user-modal">
                <h2>Chỉnh sửa người dùng</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label>Email (Không thể thay đổi)</label>
                        <input type="email" value={user.email} disabled />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fullName">Họ và tên</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Số điện thoại</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Địa chỉ</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="walletBalance">Số dư (VND)</label>
                        <input
                            type="number"
                            id="walletBalance"
                            name="walletBalance"
                            value={formData.walletBalance}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="role">Vai trò</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
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

export default UserEditModal; 