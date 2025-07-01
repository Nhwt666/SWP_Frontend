// Test After Backend Fix
// Run this in browser console after backend restart

async function testAfterFix() {
    console.log('🚀 Testing After Backend Fix...');
    console.log('='.repeat(50));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }
    
    // Test cases
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
            },
            expectedStatus: 'CONFIRMED'
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
            },
            expectedStatus: 'PENDING'
        }
    ];
    
    let successCount = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log('─'.repeat(40));
        
        try {
            console.log('📄 Sending request...');
            
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCase.data)
            });
            
            console.log(`📊 Response: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('✅ SUCCESS!');
                console.log('🎯 Ticket ID:', responseData.id);
                console.log('🎯 Actual Status:', responseData.status);
                console.log('🎯 Expected Status:', testCase.expectedStatus);
                
                if (responseData.status === testCase.expectedStatus) {
                    console.log('✅ Status matches expected!');
                    successCount++;
                } else {
                    console.log('❌ Status mismatch!');
                }
                
                console.log('🎯 Type:', responseData.type);
                console.log('🎯 Method:', responseData.method);
                
            } else {
                console.log('❌ FAILED!');
                console.log('📄 Error Response:', responseText);
                
                // Try to parse error
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('📋 Parsed Error:', errorData);
                } catch (e) {
                    console.log('📋 Raw Error:', responseText);
                }
            }
            
        } catch (error) {
            console.log('❌ Network Error:', error.message);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Backend fix is working correctly.');
        console.log('\n✅ 500 Error: FIXED');
        console.log('✅ Database Constraint: UPDATED');
        console.log('✅ Ticket Status Logic: WORKING');
        console.log('✅ CIVIL SELF_TEST → CONFIRMED: WORKING');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
}

// Check wallet balance first
async function checkWalletAndTest() {
    console.log('💰 Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found.');
        return;
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
                console.log('💡 Or test with ADMINISTRATIVE ticket (1,300,000 VND)');
            } else {
                console.log('✅ Sufficient balance for testing.');
                await testAfterFix();
            }
        }
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
    }
}

// Run the test
checkWalletAndTest();

// Export for manual use
window.testAfterFix = testAfterFix;
window.checkWalletAndTest = checkWalletAndTest; 
// Run this in browser console after backend restart

async function testAfterFix() {
    console.log('🚀 Testing After Backend Fix...');
    console.log('='.repeat(50));
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
        return;
    }
    
    // Test cases
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
            },
            expectedStatus: 'CONFIRMED'
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
            },
            expectedStatus: 'PENDING'
        }
    ];
    
    let successCount = 0;
    let totalTests = testCases.length;
    
    for (const testCase of testCases) {
        console.log(`\n📋 Testing: ${testCase.name}`);
        console.log('─'.repeat(40));
        
        try {
            console.log('📄 Sending request...');
            
            const response = await fetch('/tickets/after-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCase.data)
            });
            
            console.log(`📊 Response: ${response.status} ${response.statusText}`);
            
            const responseText = await response.text();
            
            if (response.ok) {
                const responseData = JSON.parse(responseText);
                console.log('✅ SUCCESS!');
                console.log('🎯 Ticket ID:', responseData.id);
                console.log('🎯 Actual Status:', responseData.status);
                console.log('🎯 Expected Status:', testCase.expectedStatus);
                
                if (responseData.status === testCase.expectedStatus) {
                    console.log('✅ Status matches expected!');
                    successCount++;
                } else {
                    console.log('❌ Status mismatch!');
                }
                
                console.log('🎯 Type:', responseData.type);
                console.log('🎯 Method:', responseData.method);
                
            } else {
                console.log('❌ FAILED!');
                console.log('📄 Error Response:', responseText);
                
                // Try to parse error
                try {
                    const errorData = JSON.parse(responseText);
                    console.log('📋 Parsed Error:', errorData);
                } catch (e) {
                    console.log('📋 Raw Error:', responseText);
                }
            }
            
        } catch (error) {
            console.log('❌ Network Error:', error.message);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${successCount}/${totalTests}`);
    
    if (successCount === totalTests) {
        console.log('🎉 ALL TESTS PASSED! Backend fix is working correctly.');
        console.log('\n✅ 500 Error: FIXED');
        console.log('✅ Database Constraint: UPDATED');
        console.log('✅ Ticket Status Logic: WORKING');
        console.log('✅ CIVIL SELF_TEST → CONFIRMED: WORKING');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
}

// Check wallet balance first
async function checkWalletAndTest() {
    console.log('💰 Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found.');
        return;
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
                console.log('💡 Or test with ADMINISTRATIVE ticket (1,300,000 VND)');
            } else {
                console.log('✅ Sufficient balance for testing.');
                await testAfterFix();
            }
        }
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
    }
}

// Run the test
checkWalletAndTest();

// Export for manual use
window.testAfterFix = testAfterFix;
window.checkWalletAndTest = checkWalletAndTest; 