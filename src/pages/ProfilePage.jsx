import React, { useEffect, useState } from 'react';

const ProfilePage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(true);

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
                }
            } catch (err) {
                // handle error
            }
        };
        fetchUserInfo();
    }, []);

    const closeModal = () => {
        setIsModalOpen(false);
        window.history.back();
    };

    if (!userInfo) {
        return <p>Đang tải thông tin...</p>;
    }

    return (
        <>
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-container profile-modal" onClick={e => e.stopPropagation()}>
                        <div className="profile-form-card">
                            <h2 className="profile-simple-title">Thông Tin Của Tôi</h2>
                            <div className="profile-simple-form">
                                <div className="profile-simple-group">
                                    <label>Họ tên</label>
                                    <input value={userInfo.fullName || ''} disabled readOnly />
                                </div>
                                <div className="profile-simple-group">
                                    <label>Email</label>
                                    <input value={userInfo.email || ''} disabled readOnly />
                                </div>
                                <div className="profile-simple-group">
                                    <label>Số điện thoại</label>
                                    <input value={userInfo.phone || ''} disabled readOnly />
                                </div>
                                <div className="profile-simple-group">
                                    <label>Địa chỉ</label>
                                    <input value={userInfo.address || ''} disabled readOnly />
                                </div>
                                <div className="profile-simple-group">
                                    <label>Số dư ví</label>
                                    <input
                                        value={Number(userInfo.walletBalance || 0).toLocaleString('vi-VN') + ' VND'}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfilePage;
