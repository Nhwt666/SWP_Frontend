// Detailed 500 Error Debug Script
// Run this in browser console to get detailed error information

async function debug500Detailed() {
    console.log('Detailed 500 Error Debug...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found. Please login first.');
        return;
    }
    
    // Test different scenarios
    const testScenarios = [
        {
            name: 'CIVIL SELF_TEST CONFIRMED (Current Error)',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'CONFIRMED',
                reason: 'Xac minh quan he huyet thong',
                customerId: 1,
                amount: 1500000,
                address: '123 Test Street',
                phone: '0123456789',
                email: 'test@example.com',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        },
        {
            name: 'CIVIL SELF_TEST PENDING (Test Alternative)',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'PENDING',
                reason: 'Xac minh quan he huyet thong',
                customerId: 1,
                amount: 1500000,
                address: '123 Test Street',
                phone: '0123456789',
                email: 'test@example.com',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        },
        {
            name: 'ADMINISTRATIVE AT_FACILITY PENDING (Control Test)',
            data: {
                type: 'ADMINISTRATIVE',
                method: 'AT_FACILITY',
                status: 'PENDING',
                reason: 'Xac minh danh tinh',
                customerId: 1,
                amount: 1300000,
                appointmentDate: '2024-01-15',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        }
    ];
    
    for (const scenario of testScenarios) {
        console.log(`\nTesting: ${scenario.name}`);
        console.log('-'.repeat(50));
        
        try {
            console.log('Request Data:', JSON.stringify(scenario.data, null, 2));
            
            const startTime = Date.now();
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scenario.data)
            });
            const endTime = Date.now();
            
            console.log(`Response Time: ${endTime - startTime}ms`);
            console.log(`Response Status: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            console.log(`Response Body: ${responseText}`);
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('SUCCESS!');
                console.log('Ticket ID:', responseData.id);
                console.log('Status:', responseData.status);
                console.log('Type:', responseData.type);
                console.log('Method:', responseData.method);
            } else {
                console.log('FAILED!');
                
                // Try to parse error response
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('Parsed Error:', errorData);
                    
                    if (errorData.message) {
                        console.log('Error Message:', errorData.message);
                    }
                    if (errorData.error) {
                        console.log('Error Details:', errorData.error);
                    }
                } catch (e) {
                    console.log('Raw Error Text:', responseText);
                }
            }
            
        } catch (error) {
            console.log('Network Error:', error.message);
        }
    }
}

// Test wallet balance first
async function checkWalletBeforeDetailedTest() {
    console.log('Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found.');
        return false;
    }
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            const balance = user.walletBalance || 0;
            console.log('Wallet Balance:', balance.toLocaleString() + ' VND');
            console.log('User ID:', user.id || user.userId);
            
            if (balance < 1500000) {
                console.log('Insufficient balance for CIVIL SELF_TEST (1,500,000 VND)');
                return false;
            } else {
                console.log('Sufficient balance for testing.');
                return true;
            }
        }
    } catch (error) {
        console.log('Error checking wallet:', error.message);
        return false;
    }
}

// Main debug function
async function runDetailedDebug() {
    console.log('Starting Detailed 500 Error Debug...');
    console.log('='.repeat(60));
    
    const hasBalance = await checkWalletBeforeDetailedTest();
    if (!hasBalance) {
        console.log('Cannot test due to insufficient balance.');
        return;
    }
    
    await debug500Detailed();
    
    console.log('\n' + '='.repeat(60));
    console.log('DEBUG SUMMARY');
    console.log('='.repeat(60));
    console.log('If you see 500 errors, check:');
    console.log('1. Backend logs for stacktrace');
    console.log('2. Database enum values');
    console.log('3. Java enum TicketStatus');
    console.log('4. Validation logic');
}

// Run debug
runDetailedDebug();

// Export for manual use
window.debug500Detailed = debug500Detailed;
window.runDetailedDebug = runDetailedDebug; 
// Run this in browser console to get detailed error information

async function debug500Detailed() {
    console.log('Detailed 500 Error Debug...');
    console.log('='.repeat(60));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found. Please login first.');
        return;
    }
    
    // Test different scenarios
    const testScenarios = [
        {
            name: 'CIVIL SELF_TEST CONFIRMED (Current Error)',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'CONFIRMED',
                reason: 'Xac minh quan he huyet thong',
                customerId: 1,
                amount: 1500000,
                address: '123 Test Street',
                phone: '0123456789',
                email: 'test@example.com',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        },
        {
            name: 'CIVIL SELF_TEST PENDING (Test Alternative)',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'PENDING',
                reason: 'Xac minh quan he huyet thong',
                customerId: 1,
                amount: 1500000,
                address: '123 Test Street',
                phone: '0123456789',
                email: 'test@example.com',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        },
        {
            name: 'ADMINISTRATIVE AT_FACILITY PENDING (Control Test)',
            data: {
                type: 'ADMINISTRATIVE',
                method: 'AT_FACILITY',
                status: 'PENDING',
                reason: 'Xac minh danh tinh',
                customerId: 1,
                amount: 1300000,
                appointmentDate: '2024-01-15',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        }
    ];
    
    for (const scenario of testScenarios) {
        console.log(`\nTesting: ${scenario.name}`);
        console.log('-'.repeat(50));
        
        try {
            console.log('Request Data:', JSON.stringify(scenario.data, null, 2));
            
            const startTime = Date.now();
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scenario.data)
            });
            const endTime = Date.now();
            
            console.log(`Response Time: ${endTime - startTime}ms`);
            console.log(`Response Status: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            console.log(`Response Body: ${responseText}`);
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('SUCCESS!');
                console.log('Ticket ID:', responseData.id);
                console.log('Status:', responseData.status);
                console.log('Type:', responseData.type);
                console.log('Method:', responseData.method);
            } else {
                console.log('FAILED!');
                
                // Try to parse error response
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('Parsed Error:', errorData);
                    
                    if (errorData.message) {
                        console.log('Error Message:', errorData.message);
                    }
                    if (errorData.error) {
                        console.log('Error Details:', errorData.error);
                    }
                } catch (e) {
                    console.log('Raw Error Text:', responseText);
                }
            }
            
        } catch (error) {
            console.log('Network Error:', error.message);
        }
    }
}

// Test wallet balance first
async function checkWalletBeforeDetailedTest() {
    console.log('Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('No token found.');
        return false;
    }
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            const balance = user.walletBalance || 0;
            console.log('Wallet Balance:', balance.toLocaleString() + ' VND');
            console.log('User ID:', user.id || user.userId);
            
            if (balance < 1500000) {
                console.log('Insufficient balance for CIVIL SELF_TEST (1,500,000 VND)');
                return false;
            } else {
                console.log('Sufficient balance for testing.');
                return true;
            }
        }
    } catch (error) {
        console.log('Error checking wallet:', error.message);
        return false;
    }
}

// Main debug function
async function runDetailedDebug() {
    console.log('Starting Detailed 500 Error Debug...');
    console.log('='.repeat(60));
    
    const hasBalance = await checkWalletBeforeDetailedTest();
    if (!hasBalance) {
        console.log('Cannot test due to insufficient balance.');
        return;
    }
    
    await debug500Detailed();
    
    console.log('\n' + '='.repeat(60));
    console.log('DEBUG SUMMARY');
    console.log('='.repeat(60));
    console.log('If you see 500 errors, check:');
    console.log('1. Backend logs for stacktrace');
    console.log('2. Database enum values');
    console.log('3. Java enum TicketStatus');
    console.log('4. Validation logic');
}

// Run debug
runDetailedDebug();

// Export for manual use
window.debug500Detailed = debug500Detailed;
window.runDetailedDebug = runDetailedDebug; 