// Check Wallet Balance Script
// Run this in browser console to check your wallet balance

async function checkWalletBalance() {
    console.log('💰 Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
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
            console.log('👤 User Info:', user);
            console.log('💰 Wallet Balance:', user.walletBalance?.toLocaleString() + ' VND');
            console.log('📧 Email:', user.email);
            console.log('🆔 User ID:', user.id || user.userId);
            
            // Check if balance is sufficient for CIVIL SELF_TEST
            const requiredAmount = 1500000;
            const balance = user.walletBalance || 0;
            
            console.log('🎯 Required for CIVIL SELF_TEST:', requiredAmount.toLocaleString() + ' VND');
            
            if (balance >= requiredAmount) {
                console.log('✅ Sufficient balance! You can create CIVIL SELF_TEST ticket.');
            } else {
                console.log('❌ Insufficient balance!');
                console.log('📊 Shortage:', (requiredAmount - balance).toLocaleString() + ' VND');
                console.log('💡 Please top up your wallet first.');
            }
            
            // Show other ticket prices for reference
            console.log('\n📋 Ticket Prices Reference:');
            console.log('- CIVIL SELF_TEST: 1,500,000 VND');
            console.log('- CIVIL AT_FACILITY: 1,200,000 VND');
            console.log('- ADMINISTRATIVE: 1,300,000 VND');
            console.log('- OTHER: 900,000 VND');
            
        } else {
            console.log('❌ Failed to get user info:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
    }
}

// Run the check
checkWalletBalance();

// Export for manual use
window.checkWalletBalance = checkWalletBalance; 
// Run this in browser console to check your wallet balance

async function checkWalletBalance() {
    console.log('💰 Checking Wallet Balance...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token found. Please login first.');
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
            console.log('👤 User Info:', user);
            console.log('💰 Wallet Balance:', user.walletBalance?.toLocaleString() + ' VND');
            console.log('📧 Email:', user.email);
            console.log('🆔 User ID:', user.id || user.userId);
            
            // Check if balance is sufficient for CIVIL SELF_TEST
            const requiredAmount = 1500000;
            const balance = user.walletBalance || 0;
            
            console.log('🎯 Required for CIVIL SELF_TEST:', requiredAmount.toLocaleString() + ' VND');
            
            if (balance >= requiredAmount) {
                console.log('✅ Sufficient balance! You can create CIVIL SELF_TEST ticket.');
            } else {
                console.log('❌ Insufficient balance!');
                console.log('📊 Shortage:', (requiredAmount - balance).toLocaleString() + ' VND');
                console.log('💡 Please top up your wallet first.');
            }
            
            // Show other ticket prices for reference
            console.log('\n📋 Ticket Prices Reference:');
            console.log('- CIVIL SELF_TEST: 1,500,000 VND');
            console.log('- CIVIL AT_FACILITY: 1,200,000 VND');
            console.log('- ADMINISTRATIVE: 1,300,000 VND');
            console.log('- OTHER: 900,000 VND');
            
        } else {
            console.log('❌ Failed to get user info:', response.status);
        }
        
    } catch (error) {
        console.log('❌ Error checking wallet:', error.message);
    }
}

// Run the check
checkWalletBalance();

// Export for manual use
window.checkWalletBalance = checkWalletBalance; 