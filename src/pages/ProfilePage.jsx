import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/ProfilePage.css';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaWallet } from 'react-icons/fa';

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
                    console.error("Failed to fetch user info");
                }
            } catch (err) {
                console.error("Error fetching user info:", err);
            }
        };
        fetchUserInfo();
    }, []);

    if (!userInfo) {
        return <p className="loading-text">Đang tải thông tin...</p>;
    }

    return (
        <>
            <div className="profile-page-container">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <div className="avatar-container">
                            <FaUserCircle className="avatar-icon" />
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
            
            {/* Footer with Map */}
            <footer className="member-footer">
                <div className="member-footer-content">
                    <div className="member-footer-info">
                        <div><strong>Số Hotline:</strong> 1800.9999</div>
                        <div><strong>Email:</strong> trungtamxetnghiem@gmail.com</div>
                        <div><strong>Địa chỉ:</strong> 643 Điện Biên Phủ, Phường 1, Quận 3, TPHCM</div>
                    </div>
                    <div className="member-footer-map">
                        <iframe
                            title="Bản đồ Trung tâm xét nghiệm ADN"
                            src="https://www.google.com/maps?q=643+Điện+Biên+Phủ,+Phường+1,+Quận+3,+TPHCM&output=embed"
                            width="250"
                            height="140"
                            style={{ border: 0, borderRadius: 10 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ProfilePage;
