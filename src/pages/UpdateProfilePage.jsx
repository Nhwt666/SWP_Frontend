import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UpdateProfilePage.css';

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [errors, setErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccessMsg('');

        const profileData = {};
        if (name.trim() !== '') profileData.fullName = name.trim();
        if (phone.trim() !== '') profileData.phone = phone.trim();
        if (address.trim() !== '') profileData.address = address.trim();

        if (Object.keys(profileData).length === 0) {
            setErrors({ general: 'Vui lòng nhập ít nhất một thông tin để cập nhật.' });
            return;
        }

        try {
            const res = await fetch('/customer/update_profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(profileData)
            });

            const contentType = res.headers.get('content-type');
            let data = {};

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                data = { message: text };
            }

            if (res.ok) {
                setSuccessMsg(data.message || 'Cập nhật thành công!');
                // Nếu muốn tự động quay về:
                // setTimeout(() => navigate(-1), 1500);
            } else {
                if (typeof data === 'object' && data !== null) {
                    setErrors(data);
                } else {
                    setErrors({ general: 'Đã có lỗi xảy ra' });
                }
            }
        } catch (err) {
            console.error(err);
            setErrors({ general: 'Không thể kết nối đến máy chủ' });
        }
    };

    return (
        <div className="profile-box">
            <div className="profile-header">
                <h2>My profile</h2>
                <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
                <label>Tên</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nhập tên"
                />
                {errors.fullName && <div className="error-msg">{errors.fullName}</div>}

                <label>Số điện thoại</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                />
                {errors.phone && <div className="error-msg">{errors.phone}</div>}

                <label>Địa chỉ</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                />
                {errors.address && <div className="error-msg">{errors.address}</div>}

                {errors.general && <div className="error-msg">{errors.general}</div>}
                {successMsg && <div className="success-msg">{successMsg}</div>}

                <div className="action-buttons">
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="save-btn">Save</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfilePage;
