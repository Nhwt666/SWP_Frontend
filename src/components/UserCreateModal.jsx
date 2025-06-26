import React, { useState } from 'react';
import './UserCreateModal.css';
import { IoPersonAddSharp } from 'react-icons/io5';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UserCreateModal = ({ onClose, onSave, error }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'CUSTOMER'
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.password) {
            alert("Vui lòng điền đầy đủ các trường bắt buộc.");
            return;
        }
        onSave(formData);
    };

    return (
        <div className="modal-overlay user-create-overlay">
            <div className="modal-content user-create-brand-popin">
                <div className="user-create-avatar">
                    <IoPersonAddSharp size={56} color="#6c47d8" />
                </div>
                <h2 className="user-create-title">Tạo người dùng mới</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit} className="user-form user-form-modern">
                    <div className="form-group">
                        <label htmlFor="fullName" className="user-form-label">Họ Tên</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email" className="user-form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                    </div>
                    <div className="form-group password-group">
                        <label htmlFor="password" className="user-form-label">Mật Khẩu</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                        />
                        <span className="password-eye" onClick={() => setShowPassword(v => !v)}>
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </span>
                    </div>
                    <div className="form-group">
                        <label htmlFor="role" className="user-form-label">Vai trò</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            required
                        >
                            <option value="CUSTOMER">Customer</option>
                            <option value="STAFF">Staff</option>
                            <option value="ADMIN">Admin</option>
                        </select>
                    </div>
                    <div className="form-actions user-create-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>Hủy</button>
                        <button type="submit" className="btn-save">Tạo người dùng</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserCreateModal; 