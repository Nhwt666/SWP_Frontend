import React, { useState, useEffect } from 'react';
import NotificationService from '../services/NotificationService';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);


    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.isRead).length);
        } catch (error) {
            console.error('Lỗi lấy notifications:', error);
        } finally {
            setLoading(false);
        }
    };


    const markAsRead = async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Lỗi đánh dấu đã đọc:', error);
        }
    };


    const markAllAsRead = async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Lỗi đánh dấu tất cả đã đọc:', error);
        }
    };


    const cleanupExpiredNotifications = async () => {
        try {
            await NotificationService.cleanupExpiredNotifications();
            await fetchNotifications(); // Reload sau khi xóa
        } catch (error) {
            console.error('Lỗi xóa notification hết hạn:', error);
        }
    };


    const formatTime = (timeString) => {
        const date = new Date(timeString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'Vừa xong';
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ trước`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays} ngày trước`;
        }
    };


    const isExpired = (notification) => {
        if (!notification.expiresAt) return false;
        const expiresAt = new Date(notification.expiresAt);
        const now = new Date();
        return now > expiresAt;
    };


    const validNotifications = notifications.filter(n => !isExpired(n));

    useEffect(() => {
        fetchNotifications();
        

        const cleanupInterval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);
        
        return () => clearInterval(cleanupInterval);
    }, []);


    useEffect(() => {
        cleanupExpiredNotifications();
    }, []);

    if (loading) {
        return <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>Đang tải...</div>;
    }

    return (
        <div className="notification-manager">
            <div className="notification-header">
                <h3>Thông báo ({unreadCount} chưa đọc)</h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={markAllAsRead}
                        style={{
                            padding: '4px 12px',
                            background: '#1976d2',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                    >
                        Đánh dấu tất cả đã đọc
                    </button>
                )}
            </div>
            
            <div className="notification-list">
                {validNotifications.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                        Không có thông báo mới
                    </div>
                ) : (
                    validNotifications.map(notification => (
                        <div 
                            key={notification.id}
                            className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                            onClick={() => markAsRead(notification.id)}
                            style={{
                                padding: '12px 16px',
                                borderBottom: '1px solid #f0f4fa',
                                cursor: 'pointer',
                                background: notification.isRead ? '#f8f9fa' : '#fff5f5',
                                transition: 'background 0.2s'
                            }}
                        >
                            <div style={{ 
                                color: notification.type === 'error' ? '#e53935' : 
                                       notification.type === 'warning' ? '#fbc02d' : '#1976d2',
                                fontWeight: notification.isRead ? 500 : 700,
                                fontSize: '14px',
                                marginBottom: '4px'
                            }}>
                                {notification.message}
                            </div>
                            <div style={{ 
                                fontSize: '12px', 
                                color: '#888',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>{formatTime(notification.createdAt)}</span>
                                {notification.expiresAt && (
                                    <span style={{ fontSize: '11px', color: '#999' }}>
                                        Hết hạn: {formatTime(notification.expiresAt)}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationManager; 