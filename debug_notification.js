// Debug Notification System
// Chạy trong browser console để debug

const token = localStorage.getItem('token');
const userRole = localStorage.getItem('role');

console.log('🔍 Debug Notification System');
console.log('============================');
console.log('Token exists:', !!token);
console.log('User role:', userRole);
console.log('============================');

// Test 1: Kiểm tra API endpoints
async function testNotificationAPIs() {
    console.log('\n1️⃣ Testing Notification APIs...');
    
    try {
        // Test GET /notifications
        const getRes = await fetch('/notifications', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('GET /notifications:', getRes.status, getRes.statusText);
        
        if (getRes.ok) {
            const notifications = await getRes.json();
            console.log('Current notifications:', notifications);
        } else {
            const error = await getRes.text();
            console.log('Error:', error);
        }

        // Test unread count
        const countRes = await fetch('/notifications/unread-count', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('GET /notifications/unread-count:', countRes.status);
        
        if (countRes.ok) {
            const countData = await countRes.json();
            console.log('Unread count:', countData);
        }

    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Test 2: Kiểm tra ticket status change
async function testTicketStatusChange() {
    console.log('\n2️⃣ Testing Ticket Status Change...');
    
    try {
        // Lấy danh sách ticket
        const ticketsRes = await fetch('/tickets', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (ticketsRes.ok) {
            const tickets = await ticketsRes.json();
            console.log('Available tickets:', tickets.length);
            
            if (tickets.length > 0) {
                const testTicket = tickets[0];
                console.log('Test ticket:', {
                    id: testTicket.id,
                    status: testTicket.status,
                    customerName: testTicket.customer?.fullName || testTicket.customer?.name
                });
                
                // Test tạo notification thủ công
                await testCreateNotification(testTicket);
            }
        }
        
    } catch (error) {
        console.error('❌ Ticket test failed:', error);
    }
}

// Test 3: Tạo notification test
async function testCreateNotification(ticket) {
    console.log('\n3️⃣ Creating Test Notification...');
    
    try {
        const testNotification = {
            message: `Test notification - Ticket #${ticket.id} đã chuyển từ '${ticket.status}' sang 'IN_PROGRESS'`,
            type: "INFO",
            ticketId: ticket.id,
            statusChange: JSON.stringify({
                from: ticket.status,
                to: "IN_PROGRESS"
            })
        };

        console.log('Sending notification data:', testNotification);

        const res = await fetch('/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testNotification)
        });

        console.log('POST /notifications response:', res.status, res.statusText);
        
        if (res.ok) {
            const created = await res.json();
            console.log('✅ Created notification:', created);
            
            // Kiểm tra lại danh sách notification
            setTimeout(async () => {
                const getRes = await fetch('/notifications', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (getRes.ok) {
                    const notifications = await getRes.json();
                    console.log('Updated notifications:', notifications);
                }
            }, 1000);
            
        } else {
            const error = await res.text();
            console.log('❌ Failed to create notification:', error);
        }
        
    } catch (error) {
        console.error('❌ Create notification failed:', error);
    }
}

// Test 4: Kiểm tra frontend notification service
function testFrontendService() {
    console.log('\n4️⃣ Testing Frontend Notification Service...');
    
    try {
        // Import và test NotificationService
        import('../services/NotificationService.js').then(module => {
            const NotificationService = module.default;
            console.log('NotificationService loaded:', !!NotificationService);
            
            // Test getNotifications
            NotificationService.getNotifications().then(notifications => {
                console.log('Frontend notifications:', notifications);
            }).catch(error => {
                console.error('Frontend getNotifications error:', error);
            });
            
        }).catch(error => {
            console.error('❌ Cannot load NotificationService:', error);
        });
        
    } catch (error) {
        console.error('❌ Frontend service test failed:', error);
    }
}

// Test 5: Kiểm tra console errors
function checkConsoleErrors() {
    console.log('\n5️⃣ Checking Console Errors...');
    
    // Lắng nghe lỗi JavaScript
    window.addEventListener('error', (event) => {
        console.log('❌ JavaScript Error:', event.error);
    });
    
    // Lắng nghe lỗi fetch
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        return originalFetch.apply(this, args).then(response => {
            if (!response.ok) {
                console.log('❌ Fetch Error:', response.status, response.statusText, args[0]);
            }
            return response;
        });
    };
    
    console.log('✅ Error listeners added');
}

// Main debug function
async function runDebug() {
    console.log('🚀 Starting Notification Debug...');
    
    checkConsoleErrors();
    await testNotificationAPIs();
    await testTicketStatusChange();
    testFrontendService();
    
    console.log('\n=====================================');
    console.log('🔍 Debug completed. Check results above.');
    console.log('If notifications still not working:');
    console.log('1. Check backend logs for errors');
    console.log('2. Verify database has notifications table');
    console.log('3. Check if cron job is running');
    console.log('4. Verify user permissions');
}

// Export functions
window.debugNotification = {
    runDebug,
    testNotificationAPIs,
    testTicketStatusChange,
    testCreateNotification,
    testFrontendService
};

console.log('📝 Available debug functions:');
console.log('- debugNotification.runDebug()');
console.log('- debugNotification.testNotificationAPIs()');
console.log('- debugNotification.testTicketStatusChange()');
console.log('- debugNotification.testCreateNotification()');
console.log('- debugNotification.testFrontendService()'); 