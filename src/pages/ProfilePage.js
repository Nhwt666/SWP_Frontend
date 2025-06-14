import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await fetch('/auth/me', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserInfo(data);
                } else {
                    console.error("Không thể lấy thông tin người dùng");
                }
            } catch (err) {
                console.error("Lỗi khi lấy thông tin người dùng:", err);
            }
        };

        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return <p>Đang tải thông tin...</p>;
    }

    return (
        <div className="profile-container">
            <h2>Thông tin của tôi</h2>
            <div className="profile-box">
                <p><strong>Họ tên:</strong> {userInfo.fullName}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <p><strong>Số điện thoại:</strong> {userInfo.phone || 'Chưa cập nhật'}</p>
                <p><strong>Địa chỉ:</strong> {userInfo.address || 'Chưa cập nhật'}</p>
                <p><strong>Vai trò:</strong> {userInfo.role}</p>
                <p><strong>Số dư ví:</strong> {Number(userInfo.walletBalance).toLocaleString()}đ</p>
            </div>
        </div>
    );
};

export default ProfilePage;
