import React, { useEffect, useState } from 'react';
import '../styles/ProfilePage.css';
import Header from '../components/Header';
import StaffLayout from '../components/StaffLayout';
import ProfileContent from '../components/ProfileContent';
import ProfileFooter from '../components/ProfileFooter';

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

    // Lấy role từ localStorage
    const role = localStorage.getItem('role');

    return (
        <>
            <Header />
            {role === 'STAFF' ? (
                <StaffLayout>
                    <ProfileContent userInfo={userInfo} />
                </StaffLayout>
            ) : (
                <ProfileContent userInfo={userInfo} />
            )}
            <ProfileFooter />
        </>
    );
};

export default ProfilePage;
