// Debug 500 Error Script
// Run this in browser console to debug the 500 error

async function debug500Error() {
    console.log('🔍 Debugging 500 Error...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }
    
    // Test data
    const testCases = [
        {
            name: 'CIVIL SELF_TEST CONFIRMED',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'CONFIRMED',
                reason: 'Xác minh quan hệ huyết thống',
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
            name: 'CIVIL SELF_TEST PENDING',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'PENDING',
                reason: 'Xác minh quan hệ huyết thống',
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
            name: 'ADMINISTRATIVE AT_FACILITY PENDING',
            data: {
                type: 'ADMINISTRATIVE',
                method: 'AT_FACILITY',
                status: 'PENDING',
                reason: 'Xác minh danh tính',
                customerId: 1,
                amount: 1300000,
                appointmentDate: '2024-01-15',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log('='.repeat(50));
        
        try {
            console.log('📄 Request Data:', JSON.stringify(testCase.data, null, 2));
            
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCase.data)
            });
            
            console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
            console.log(`📄 Response Headers:`, Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log(`📄 Response Body: ${responseText}`);
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('✅ Success!');
                console.log('🎯 Ticket ID:', responseData.id);
                console.log('🎯 Status:', responseData.status);
                console.log('🎯 Type:', responseData.type);
                console.log('🎯 Method:', responseData.method);
            } else {
                console.log('❌ Failed!');
                console.log('📄 Error Details:', responseText);
                
                // Try to parse error response
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('📋 Parsed Error:', errorData);
                } catch (e) {
                    console.log('📋 Raw Error Text:', responseText);
                }
            }
            
        } catch (error) {
            console.log('❌ Network Error:', error.message);
            console.log('📋 Error Stack:', error.stack);
        }
    }
}

// Test wallet balance first
async function checkWalletBeforeTest() {
    console.log('💰 Checking Wallet Balance First...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found.');
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
            console.log('💰 Wallet Balance:', balance.toLocaleString() + ' VND');
            
            if (balance < 1500000) {
                console.log('❌ Insufficient balance for CIVIL SELF_TEST (1,500,000 VND)');
                console.log('💡 Please top up your wallet first.');
                return false;
            } else {
                console.log('✅ Sufficient balance for testing.');
                return true;
            }
        }
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
        return false;
    }
}

// Main debug function
async function runDebug() {
    console.log('🚀 Starting 500 Error Debug...');
    console.log('='.repeat(60));
    
    const hasBalance = await checkWalletBeforeTest();
    
    if (hasBalance) {
        await debug500Error();
    } else {
        console.log('\n⚠️  Cannot test ticket creation due to insufficient balance.');
        console.log('💡 Please top up your wallet and try again.');
    }
}

// Run debug
runDebug();

// Export functions for manual use
window.debug500Error = debug500Error;
window.checkWalletBeforeTest = checkWalletBeforeTest;
window.runDebug = runDebug; 
// Run this in browser console to debug the 500 error

async function debug500Error() {
    console.log('🔍 Debugging 500 Error...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }
    
    // Test data
    const testCases = [
        {
            name: 'CIVIL SELF_TEST CONFIRMED',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'CONFIRMED',
                reason: 'Xác minh quan hệ huyết thống',
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
            name: 'CIVIL SELF_TEST PENDING',
            data: {
                type: 'CIVIL',
                method: 'SELF_TEST',
                status: 'PENDING',
                reason: 'Xác minh quan hệ huyết thống',
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
            name: 'ADMINISTRATIVE AT_FACILITY PENDING',
            data: {
                type: 'ADMINISTRATIVE',
                method: 'AT_FACILITY',
                status: 'PENDING',
                reason: 'Xác minh danh tính',
                customerId: 1,
                amount: 1300000,
                appointmentDate: '2024-01-15',
                sample1Name: 'Sample 1',
                sample2Name: 'Sample 2'
            }
        }
    ];
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log('='.repeat(50));
        
        try {
            console.log('📄 Request Data:', JSON.stringify(testCase.data, null, 2));
            
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCase.data)
            });
            
            console.log(`📊 Response Status: ${response.status} ${response.statusText}`);
            console.log(`📄 Response Headers:`, Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log(`📄 Response Body: ${responseText}`);
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('✅ Success!');
                console.log('🎯 Ticket ID:', responseData.id);
                console.log('🎯 Status:', responseData.status);
                console.log('🎯 Type:', responseData.type);
                console.log('🎯 Method:', responseData.method);
            } else {
                console.log('❌ Failed!');
                console.log('📄 Error Details:', responseText);
                
                // Try to parse error response
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('📋 Parsed Error:', errorData);
                } catch (e) {
                    console.log('📋 Raw Error Text:', responseText);
                }
            }
            
        } catch (error) {
            console.log('❌ Network Error:', error.message);
            console.log('📋 Error Stack:', error.stack);
        }
    }
}

// Test wallet balance first
async function checkWalletBeforeTest() {
    console.log('💰 Checking Wallet Balance First...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found.');
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
            console.log('💰 Wallet Balance:', balance.toLocaleString() + ' VND');
            
            if (balance < 1500000) {
                console.log('❌ Insufficient balance for CIVIL SELF_TEST (1,500,000 VND)');
                console.log('💡 Please top up your wallet first.');
                return false;
            } else {
                console.log('✅ Sufficient balance for testing.');
                return true;
            }
        }
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
        return false;
    }
}

// Main debug function
async function runDebug() {
    console.log('🚀 Starting 500 Error Debug...');
    console.log('='.repeat(60));
    
    const hasBalance = await checkWalletBeforeTest();
    
    if (hasBalance) {
        await debug500Error();
    } else {
        console.log('\n⚠️  Cannot test ticket creation due to insufficient balance.');
        console.log('💡 Please top up your wallet and try again.');
    }
}

// Run debug
runDebug();

// Export functions for manual use
window.debug500Error = debug500Error;
window.checkWalletBeforeTest = checkWalletBeforeTest;
window.runDebug = runDebug; 