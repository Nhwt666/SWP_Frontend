import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/UpdateProfilePage.css';

const UpdateProfilePage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const profileData = { name, phone, address };
        console.log('Profile updated:', profileData);

        alert('Thông tin đã được lưu!');
        navigate(-1);
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
                    required
                />

                <label>Số điện thoại</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    required
                />

                <label>Địa chỉ</label>
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Nhập địa chỉ"
                    required
                />

                <div className="action-buttons">
                    <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>Cancel</button>
                    <button type="submit" className="save-btn">Save</button>
                </div>
            </form>
        </div>
    );
};

export default UpdateProfilePage;
