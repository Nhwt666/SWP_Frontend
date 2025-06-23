import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UpdateProfilePage.css';
import { UserContext } from '../UserContext';

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const { email: userEmail, fullName: currentFullName, phone: currentPhone, address: currentAddress, dob: currentDob, gender: currentGender, updateFullName } = useContext(UserContext);

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
        if (name.trim()) profileData.fullName = name.trim();
        if (phone.trim()) profileData.phone = phone.trim();
        if (address.trim()) profileData.address = address.trim();

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

            if (res.ok) {
                // Sau khi update thành công, lấy lại profile mới
                const meRes = await fetch('/auth/me', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (meRes.ok) {
                    const user = await meRes.json();
                    updateFullName(user.fullName);
                }
                setSuccessMsg('Cập nhật thành công!');
                // Reset input form
                setName('');
                setPhone('');
                setAddress('');
            } else {
                const data = await res.json();
                setErrors(data || { general: 'Đã có lỗi xảy ra' });
            }
        } catch (err) {
            console.error(err);
            setErrors({ general: 'Không thể kết nối đến máy chủ' });
        }
    };

    return (
        <div className="profile-box">
            <div className="profile-header">
                <h2>Cập Nhập Thông Tin</h2>
                <button className="close-btn" onClick={() => navigate(-1)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
                <label>Tên</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nhập tên" />
                {errors.fullName && <div className="error-msg">{errors.fullName}</div>}

                <label>Số điện thoại</label>
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Nhập số điện thoại" />
                {errors.phone && <div className="error-msg">{errors.phone}</div>}

                <label>Địa chỉ</label>
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Nhập địa chỉ" />
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
