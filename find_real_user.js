// Find Real User Script
// Tim user that trong database de test ticket creation

async function findRealUsers() {
    console.log('Finding Real Users for Testing...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found. Please login first.');
        return;
    }
    
    try {
        // Test current user
        console.log('Testing current user...');
        const userResponse = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (userResponse.ok) {
            const currentUser = await userResponse.json();
            console.log('Current User:');
            console.log('- ID:', currentUser.id || currentUser.userId);
            console.log('- Email:', currentUser.email);
            console.log('- Role:', currentUser.role);
            console.log('- Wallet Balance:', (currentUser.walletBalance || 0).toLocaleString() + ' VND');
            
            if (currentUser.walletBalance >= 1500000) {
                console.log('Current user has sufficient balance for CIVIL SELF_TEST');
                return currentUser;
            } else {
                console.log('Current user has insufficient balance');
            }
        }
        
        // Try to find users with sufficient balance
        console.log('\nSearching for users with sufficient balance...');
        
        // Test common user IDs
        const testUserIds = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30];
        
        for (const userId of testUserIds) {
            try {
                console.log(`Testing user ID: ${userId}`);
                
                const response = await fetch(`/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    const balance = user.walletBalance || 0;
                    
                    console.log(`- User ${userId}: ${user.email} - Balance: ${balance.toLocaleString()} VND`);
                    
                    if (balance >= 1500000) {
                        console.log(`Found user with sufficient balance: ${user.email}`);
                        return user;
                    }
                } else {
                    console.log(`- User ${userId}: Not found (${response.status})`);
                }
            } catch (error) {
                console.log(`- User ${userId}: Error - ${error.message}`);
            }
        }
        
        console.log('\nNo users found with sufficient balance');
        console.log('Please top up wallet or create a test user with balance >= 1,500,000 VND');
        
    } catch (error) {
        console.log('Error finding users:', error.message);
    }
}

// Test ticket creation with real user
async function testTicketWithRealUser(user) {
    console.log('\nTesting Ticket Creation with Real User...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found.');
        return;
    }
    
    const ticketData = {
        type: 'CIVIL',
        method: 'SELF_TEST',
        status: 'CONFIRMED',
        reason: 'Xac minh quan he huyet thong',
        customerId: user.id || user.userId,
        amount: 1500000,
        address: '123 Test Street',
        phone: '0123456789',
        email: user.email,
        sample1Name: 'Sample 1',
        sample2Name: 'Sample 2'
    };
    
    console.log('Ticket Data:', JSON.stringify(ticketData, null, 2));
    
    try {
        const startTime = Date.now();
        const response = await fetch('/tickets/after-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ticketData)
        });
        const endTime = Date.now();
        
        console.log(`Response Time: ${endTime - startTime}ms`);
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`Response Body: ${responseText}`);
        
        if (response.ok) {
            const ticket = JSON.parse(responseText);
            console.log('SUCCESS! Ticket created successfully!');
            console.log('Ticket ID:', ticket.id);
            console.log('Status:', ticket.status);
            console.log('Type:', ticket.type);
            console.log('Method:', ticket.method);
            console.log('Customer ID:', ticket.customerId);
            console.log('Amount:', ticket.amount);
            console.log('Created At:', ticket.createdAt);
        } else {
            console.log('FAILED!');
            
            try {
                const errorData = JSON.parse(responseText);
                console.log('Error Details:', errorData);
            } catch (e) {
                console.log('Raw Error:', responseText);
            }
        }
        
    } catch (error) {
        console.log('Network Error:', error.message);
    }
}

// Main function
async function findAndTestWithRealUser() {
    console.log('Finding Real User and Testing Ticket Creation...');
    console.log('='.repeat(60));
    
    const user = await findRealUsers();
    
    if (user) {
        console.log(`\nUsing user: ${user.email} (ID: ${user.id || user.userId})`);
        await testTicketWithRealUser(user);
    } else {
        console.log('\nNo suitable user found for testing');
        console.log('Solutions:');
        console.log('1. Top up current user wallet to >= 1,500,000 VND');
        console.log('2. Create a test user with sufficient balance');
        console.log('3. Use a different user account');
    }
}

// Export functions
window.findRealUsers = findRealUsers;
window.testTicketWithRealUser = testTicketWithRealUser;
window.findAndTestWithRealUser = findAndTestWithRealUser;

// Auto-run
findAndTestWithRealUser(); 
// Tim user that trong database de test ticket creation

async function findRealUsers() {
    console.log('Finding Real Users for Testing...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found. Please login first.');
        return;
    }
    
    try {
        // Test current user
        console.log('Testing current user...');
        const userResponse = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (userResponse.ok) {
            const currentUser = await userResponse.json();
            console.log('Current User:');
            console.log('- ID:', currentUser.id || currentUser.userId);
            console.log('- Email:', currentUser.email);
            console.log('- Role:', currentUser.role);
            console.log('- Wallet Balance:', (currentUser.walletBalance || 0).toLocaleString() + ' VND');
            
            if (currentUser.walletBalance >= 1500000) {
                console.log('Current user has sufficient balance for CIVIL SELF_TEST');
                return currentUser;
            } else {
                console.log('Current user has insufficient balance');
            }
        }
        
        // Try to find users with sufficient balance
        console.log('\nSearching for users with sufficient balance...');
        
        // Test common user IDs
        const testUserIds = [1, 2, 3, 4, 5, 10, 15, 20, 25, 30];
        
        for (const userId of testUserIds) {
            try {
                console.log(`Testing user ID: ${userId}`);
                
                const response = await fetch(`/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const user = await response.json();
                    const balance = user.walletBalance || 0;
                    
                    console.log(`- User ${userId}: ${user.email} - Balance: ${balance.toLocaleString()} VND`);
                    
                    if (balance >= 1500000) {
                        console.log(`Found user with sufficient balance: ${user.email}`);
                        return user;
                    }
                } else {
                    console.log(`- User ${userId}: Not found (${response.status})`);
                }
            } catch (error) {
                console.log(`- User ${userId}: Error - ${error.message}`);
            }
        }
        
        console.log('\nNo users found with sufficient balance');
        console.log('Please top up wallet or create a test user with balance >= 1,500,000 VND');
        
    } catch (error) {
        console.log('Error finding users:', error.message);
    }
}

// Test ticket creation with real user
async function testTicketWithRealUser(user) {
    console.log('\nTesting Ticket Creation with Real User...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found.');
        return;
    }
    
    const ticketData = {
        type: 'CIVIL',
        method: 'SELF_TEST',
        status: 'CONFIRMED',
        reason: 'Xac minh quan he huyet thong',
        customerId: user.id || user.userId,
        amount: 1500000,
        address: '123 Test Street',
        phone: '0123456789',
        email: user.email,
        sample1Name: 'Sample 1',
        sample2Name: 'Sample 2'
    };
    
    console.log('Ticket Data:', JSON.stringify(ticketData, null, 2));
    
    try {
        const startTime = Date.now();
        const response = await fetch('/tickets/after-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(ticketData)
        });
        const endTime = Date.now();
        
        console.log(`Response Time: ${endTime - startTime}ms`);
        console.log(`Response Status: ${response.status} ${response.statusText}`);
        
        const responseText = await response.text();
        console.log(`Response Body: ${responseText}`);
        
        if (response.ok) {
            const ticket = JSON.parse(responseText);
            console.log('SUCCESS! Ticket created successfully!');
            console.log('Ticket ID:', ticket.id);
            console.log('Status:', ticket.status);
            console.log('Type:', ticket.type);
            console.log('Method:', ticket.method);
            console.log('Customer ID:', ticket.customerId);
            console.log('Amount:', ticket.amount);
            console.log('Created At:', ticket.createdAt);
        } else {
            console.log('FAILED!');
            
            try {
                const errorData = JSON.parse(responseText);
                console.log('Error Details:', errorData);
            } catch (e) {
                console.log('Raw Error:', responseText);
            }
        }
        
    } catch (error) {
        console.log('Network Error:', error.message);
    }
}

// Main function
async function findAndTestWithRealUser() {
    console.log('Finding Real User and Testing Ticket Creation...');
    console.log('='.repeat(60));
    
    const user = await findRealUsers();
    
    if (user) {
        console.log(`\nUsing user: ${user.email} (ID: ${user.id || user.userId})`);
        await testTicketWithRealUser(user);
    } else {
        console.log('\nNo suitable user found for testing');
        console.log('Solutions:');
        console.log('1. Top up current user wallet to >= 1,500,000 VND');
        console.log('2. Create a test user with sufficient balance');
        console.log('3. Use a different user account');
    }
}

// Export functions
window.findRealUsers = findRealUsers;
window.testTicketWithRealUser = testTicketWithRealUser;
window.findAndTestWithRealUser = findAndTestWithRealUser;

// Auto-run
findAndTestWithRealUser(); 