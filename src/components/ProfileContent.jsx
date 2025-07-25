import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfilePage.css';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaWallet, FaBell } from 'react-icons/fa';

const ProfileContent = ({ userInfo, hasNotification }) => {
    return (
        <>
            <div className="profile-page-container">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="avatar-container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <FaUserCircle className="avatar-icon" />
                            <div className="noti-bell-container" style={{ position: 'relative' }}>
                                <FaBell className="noti-bell-icon" style={{ fontSize: 28, cursor: 'pointer' }} />
                                {hasNotification && (
                                    <span className="noti-dot" style={{
                                        position: 'absolute',
                                        top: 2,
                                        right: 2,
                                        width: 10,
                                        height: 10,
                                        background: '#e53935',
                                        borderRadius: '50%',
                                        border: '2px solid #fff',
                                        display: 'inline-block'
                                    }}></span>
                                )}
                            </div>
                        </div>
                        <div className="user-info-header">
                            <h2 className="user-name">{userInfo.fullName || 'Tên người dùng'}</h2>
                            <p className="user-email-header">{userInfo.email}</p>
                        </div>
                    </div>

                    <div className="profile-card-body">
                        <h3 className="section-title">Thông tin chi tiết</h3>
                        <div className="info-grid">
                            <div className="info-item">
                                <FaPhone className="info-icon" />
                                <div className="info-text">
                                    <label>Số điện thoại</label>
                                    <span>{userInfo.phone || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaMapMarkerAlt className="info-icon" />
                                <div className="info-text">
                                    <label>Địa chỉ</label>
                                    <span>{userInfo.address || 'Chưa cập nhật'}</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <FaWallet className="info-icon" />
                                <div className="info-text">
                                    <label>Số dư ví</label>
                                    <span className="wallet-balance">
                                        {Number(userInfo.walletBalance || 0).toLocaleString('vi-VN')} VND
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card-footer">
                        <Link to="/update-profile" className="btn-update-profile">
                            Chỉnh sửa thông tin
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfileContent; 