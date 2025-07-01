import { useState, useEffect, useCallback } from 'react';
import NotificationService from '../services/NotificationService';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách notification
    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const data = await NotificationService.getNotifications();
            // Backend đã lọc notification không hết hạn
            setNotifications(data);
            
            // Lấy số lượng chưa đọc từ API riêng
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('Lỗi lấy notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Đánh dấu đã đọc
    const markAsRead = useCallback(async (notificationId) => {
        try {
            await NotificationService.markAsRead(notificationId);
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Lỗi đánh dấu đã đọc:', error);
        }
    }, []);

    // Đánh dấu tất cả đã đọc
    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Lỗi đánh dấu tất cả đã đọc:', error);
        }
    }, []);

    // Xóa notification hết hạn
    const cleanupExpiredNotifications = useCallback(async () => {
        try {
            await NotificationService.cleanupExpiredNotifications();
            await fetchNotifications(); // Reload sau khi xóa
        } catch (error) {
            console.error('Lỗi xóa notification hết hạn:', error);
        }
    }, [fetchNotifications]);

    // Tạo notification cho thay đổi trạng thái ticket
    const createStatusChangeNotification = useCallback(async (ticketId, oldStatus, newStatus, customerName) => {
        try {
            await NotificationService.createStatusChangeNotification(ticketId, oldStatus, newStatus, customerName);
            // Reload notifications sau khi tạo mới
            await fetchNotifications();
        } catch (error) {
            console.error('Lỗi tạo notification:', error);
        }
    }, [fetchNotifications]);

    // Format thời gian
    const formatTime = useCallback((timeString) => {
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
    }, []);

    // Kiểm tra notification có hết hạn chưa (backend đã lọc, nhưng vẫn check để đảm bảo)
    const isExpired = useCallback((notification) => {
        if (!notification.expiresAt) return false;
        const expiresAt = new Date(notification.expiresAt);
        const now = new Date();
        return now > expiresAt;
    }, []);

    // Lọc notification không hết hạn (double check)
    const validNotifications = notifications.filter(n => !isExpired(n));

    useEffect(() => {
        fetchNotifications();
        
        // Cleanup expired notifications mỗi giờ
        const cleanupInterval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000);
        
        return () => clearInterval(cleanupInterval);
    }, [fetchNotifications, cleanupExpiredNotifications]);

    // Auto cleanup khi component mount
    useEffect(() => {
        cleanupExpiredNotifications();
    }, [cleanupExpiredNotifications]);

    return {
        notifications: validNotifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        createStatusChangeNotification,
        formatTime,
        isExpired
    };
}; 