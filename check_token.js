// Simple JWT Token Checker
// Run this in browser console to check your token

function checkToken() {
    console.log('🔍 Checking JWT Token...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No token found in localStorage');
        return;
    }
    
    console.log('📄 Token found:', token.substring(0, 50) + '...');
    
    // Decode JWT (without verification)
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format (should have 3 parts)');
            return;
        }
        
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        console.log('📋 Token Header:', header);
        console.log('📋 Token Payload:', payload);
        
        // Check expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const isExpired = now > exp;
            
            console.log(`⏰ Token expiration: ${new Date(exp * 1000).toLocaleString()}`);
            console.log(`⏰ Current time: ${new Date(now * 1000).toLocaleString()}`);
            console.log(`⏰ Is expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
            
            if (isExpired) {
                console.log('⚠️  Token has expired! Please login again.');
            }
        }
        
        // Check user info
        if (payload.sub) {
            console.log(`👤 User ID: ${payload.sub}`);
        }
        if (payload.role) {
            console.log(`🔑 Role: ${payload.role}`);
        }
        
    } catch (error) {
        console.log('❌ Error decoding token:', error.message);
    }
}

// Test token with backend
async function testTokenWithBackend() {
    console.log('\n🔍 Testing token with backend...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token to test');
        return;
    }
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`📊 Auth test response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const user = await response.json();
            console.log('✅ Token is valid! User info:', user);
        } else {
            const errorText = await response.text();
            console.log('❌ Token validation failed:', errorText);
        }
        
    } catch (error) {
        console.log('❌ Network error testing token:', error.message);
    }
}

// Run both checks
console.log('🚀 JWT Token Analysis');
console.log('='.repeat(50));
checkToken();
testTokenWithBackend();

// Export functions for manual use
window.checkToken = checkToken;
window.testTokenWithBackend = testTokenWithBackend; 
// Run this in browser console to check your token

function checkToken() {
    console.log('🔍 Checking JWT Token...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No token found in localStorage');
        return;
    }
    
    console.log('📄 Token found:', token.substring(0, 50) + '...');
    
    // Decode JWT (without verification)
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format (should have 3 parts)');
            return;
        }
        
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        console.log('📋 Token Header:', header);
        console.log('📋 Token Payload:', payload);
        
        // Check expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const isExpired = now > exp;
            
            console.log(`⏰ Token expiration: ${new Date(exp * 1000).toLocaleString()}`);
            console.log(`⏰ Current time: ${new Date(now * 1000).toLocaleString()}`);
            console.log(`⏰ Is expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
            
            if (isExpired) {
                console.log('⚠️  Token has expired! Please login again.');
            }
        }
        
        // Check user info
        if (payload.sub) {
            console.log(`👤 User ID: ${payload.sub}`);
        }
        if (payload.role) {
            console.log(`🔑 Role: ${payload.role}`);
        }
        
    } catch (error) {
        console.log('❌ Error decoding token:', error.message);
    }
}

// Test token with backend
async function testTokenWithBackend() {
    console.log('\n🔍 Testing token with backend...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        console.log('❌ No token to test');
        return;
    }
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log(`📊 Auth test response: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const user = await response.json();
            console.log('✅ Token is valid! User info:', user);
        } else {
            const errorText = await response.text();
            console.log('❌ Token validation failed:', errorText);
        }
        
    } catch (error) {
        console.log('❌ Network error testing token:', error.message);
    }
}

// Run both checks
console.log('🚀 JWT Token Analysis');
console.log('='.repeat(50));
checkToken();
testTokenWithBackend();

// Export functions for manual use
window.checkToken = checkToken;
window.testTokenWithBackend = testTokenWithBackend; 