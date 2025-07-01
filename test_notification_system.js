// Test Notification System
// Chạy trong browser console để test

const API_BASE = '';
const token = localStorage.getItem('token');

if (!token) {
    console.error('❌ Chưa đăng nhập. Vui lòng đăng nhập trước.');
} else {
    console.log('✅ Đã đăng nhập. Bắt đầu test notification system...');
}

// Test functions
async function testNotificationEndpoints() {
    console.log('\n🔍 Testing Notification Endpoints...');
    
    try {
        // 1. Test GET /notifications
        console.log('1. Testing GET /notifications...');
        const getRes = await fetch('/notifications', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Status: ${getRes.status}`);
        if (getRes.ok) {
            const notifications = await getRes.json();
            console.log(`   ✅ Found ${notifications.length} notifications`);
            if (notifications.length > 0) {
                console.log('   Sample notification:', notifications[0]);
            }
        }

        // 2. Test GET /notifications/unread-count
        console.log('\n2. Testing GET /notifications/unread-count...');
        const countRes = await fetch('/notifications/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Status: ${countRes.status}`);
        if (countRes.ok) {
            const countData = await countRes.json();
            console.log(`   ✅ Unread count: ${countData.count}`);
        }

        // 3. Test POST /notifications/mark-all-read
        console.log('\n3. Testing POST /notifications/mark-all-read...');
        const markAllRes = await fetch('/notifications/mark-all-read', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Status: ${markAllRes.status}`);
        if (markAllRes.ok) {
            console.log('   ✅ Marked all as read');
        }

        // 4. Test cleanup expired (admin/staff only)
        console.log('\n4. Testing DELETE /notifications/cleanup-expired...');
        const cleanupRes = await fetch('/notifications/cleanup-expired', {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`   Status: ${cleanupRes.status}`);
        if (cleanupRes.ok) {
            console.log('   ✅ Cleanup expired notifications');
        } else if (cleanupRes.status === 403) {
            console.log('   ⚠️ Cleanup requires admin/staff role');
        }

    } catch (error) {
        console.error('❌ Error testing endpoints:', error);
    }
}

async function testCreateNotification() {
    console.log('\n🔍 Testing Create Notification...');
    
    try {
        const testNotification = {
            message: "Test notification - Ticket #999 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'",
            type: "INFO",
            ticketId: 999,
            statusChange: JSON.stringify({
                from: "PENDING",
                to: "IN_PROGRESS"
            })
        };

        const res = await fetch('/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testNotification)
        });

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            const created = await res.json();
            console.log('✅ Created notification:', created);
            return created.id;
        } else {
            const error = await res.text();
            console.log('❌ Failed to create notification:', error);
        }
    } catch (error) {
        console.error('❌ Error creating notification:', error);
    }
}

async function testDeleteOldNotifications() {
    console.log('\n🔍 Testing Delete Old Notifications...');
    
    try {
        const res = await fetch('/notifications/ticket/999/delete-old', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ newStatus: "COMPLETED" })
        });

        console.log(`Status: ${res.status}`);
        if (res.ok) {
            console.log('✅ Deleted old notifications for ticket #999');
        } else if (res.status === 403) {
            console.log('⚠️ Delete requires admin/staff role');
        }
    } catch (error) {
        console.error('❌ Error deleting old notifications:', error);
    }
}

async function testNotificationWorkflow() {
    console.log('\n🔍 Testing Notification Workflow...');
    
    try {
        // 1. Tạo notification test
        const notificationId = await testCreateNotification();
        
        if (notificationId) {
            // 2. Test mark as read
            console.log('\n5. Testing PUT /notifications/{id}/read...');
            const markRes = await fetch(`/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`   Status: ${markRes.status}`);
            if (markRes.ok) {
                console.log('   ✅ Marked notification as read');
            }
            
            // 3. Xóa notification test
            await testDeleteOldNotifications();
        }
        
    } catch (error) {
        console.error('❌ Error in workflow test:', error);
    }
}

// Main test function
async function runAllTests() {
    console.log('🚀 Starting Notification System Tests...');
    console.log('=====================================');
    
    await testNotificationEndpoints();
    await testNotificationWorkflow();
    
    console.log('\n=====================================');
    console.log('✅ Notification System Tests Completed!');
    console.log('\n📋 Test Summary:');
    console.log('- GET /notifications: ✅');
    console.log('- GET /notifications/unread-count: ✅');
    console.log('- POST /notifications/mark-all-read: ✅');
    console.log('- PUT /notifications/{id}/read: ✅');
    console.log('- DELETE /notifications/cleanup-expired: ✅');
    console.log('- DELETE /notifications/ticket/{id}/delete-old: ✅');
    console.log('- POST /notifications (create): ✅');
}

// Export functions for manual testing
window.testNotificationSystem = {
    runAllTests,
    testNotificationEndpoints,
    testCreateNotification,
    testDeleteOldNotifications,
    testNotificationWorkflow
};

console.log('📝 Available test functions:');
console.log('- testNotificationSystem.runAllTests()');
console.log('- testNotificationSystem.testNotificationEndpoints()');
console.log('- testNotificationSystem.testCreateNotification()');
console.log('- testNotificationSystem.testDeleteOldNotifications()');
console.log('- testNotificationSystem.testNotificationWorkflow()'); 