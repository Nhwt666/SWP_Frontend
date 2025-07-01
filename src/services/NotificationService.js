class NotificationService {
    constructor() {
        this.baseURL = '';
        this.token = localStorage.getItem('token');
    }

    // Tạo notification mới
    async createNotification(data) {
        try {
            const response = await fetch('/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({
                    ...data,
                    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 ngày
                })
            });

            if (!response.ok) {
                throw new Error('Không thể tạo thông báo');
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi tạo notification:', error);
            throw error;
        }
    }

    // Lấy danh sách notification
    async getNotifications() {
        try {
            const response = await fetch('/notifications', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể lấy thông báo');
            }

            return await response.json();
        } catch (error) {
            console.error('Lỗi lấy notifications:', error);
            return [];
        }
    }

    // Xóa notification cũ cho ticket
    async deleteOldNotifications(ticketId, newStatus) {
        try {
            const response = await fetch(`/notifications/ticket/${ticketId}/delete-old`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ newStatus })
            });

            if (!response.ok) {
                console.warn('Không thể xóa notification cũ');
            }
        } catch (error) {
            console.error('Lỗi xóa notification cũ:', error);
        }
    }

    // Đánh dấu đã đọc
    async markAsRead(notificationId) {
        try {
            const response = await fetch(`/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể đánh dấu đã đọc');
            }
        } catch (error) {
            console.error('Lỗi đánh dấu đã đọc:', error);
        }
    }

    // Đánh dấu tất cả đã đọc
    async markAllAsRead() {
        try {
            const response = await fetch('/notifications/mark-all-read', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể đánh dấu tất cả đã đọc');
            }
        } catch (error) {
            console.error('Lỗi đánh dấu tất cả đã đọc:', error);
        }
    }

    // Lấy số lượng notification chưa đọc
    async getUnreadCount() {
        try {
            const response = await fetch('/notifications/unread-count', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                throw new Error('Không thể lấy số lượng chưa đọc');
            }

            const data = await response.json();
            return data.count || 0;
        } catch (error) {
            console.error('Lỗi lấy số lượng chưa đọc:', error);
            return 0;
        }
    }

    // Tạo notification cho thay đổi trạng thái ticket
    async createStatusChangeNotification(ticketId, oldStatus, newStatus, customerName) {
        const statusMessages = {
            'PENDING': 'Chờ xử lý',
            'IN_PROGRESS': 'Đang xử lý',
            'RECEIVED': 'Đã nhận kit',
            'CONFIRMED': 'Đã xác nhận Yêu Cầu',
            'COMPLETED': 'Hoàn thành',
            'REJECTED': 'Đã từ chối'
        };

        const message = `Ticket #${ticketId} của ${customerName} đã chuyển từ "${statusMessages[oldStatus] || oldStatus}" sang "${statusMessages[newStatus] || newStatus}"`;

        // Xóa notification cũ trước khi tạo mới
        await this.deleteOldNotifications(ticketId, newStatus);

        // Tạo notification mới
        return await this.createNotification({
            message,
            type: 'INFO',
            ticketId,
            statusChange: JSON.stringify({
                from: oldStatus,
                to: newStatus
            })
        });
    }

    // Xóa notification hết hạn (được gọi bởi backend cron job)
    async cleanupExpiredNotifications() {
        try {
            const response = await fetch('/notifications/cleanup-expired', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                console.warn('Không thể xóa notification hết hạn');
            }
        } catch (error) {
            console.error('Lỗi xóa notification hết hạn:', error);
        }
    }
}

export default new NotificationService(); 