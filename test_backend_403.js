const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';

// Test data
const testTicketData = {
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
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        console.log(`🌐 Making ${requestOptions.method} request to: ${url}`);
        console.log(`📋 Headers:`, requestOptions.headers);
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`📊 Response: ${res.statusCode} ${res.statusMessage}`);
                console.log(`📄 Response headers:`, res.headers);
                console.log(`📄 Response body: ${data}`);
                
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Request error: ${err.message}`);
            reject(err);
        });
        
        if (options.body) {
            console.log(`📄 Request body: ${options.body}`);
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test functions
async function testBackendHealth() {
    console.log('\n🔍 Testing backend health...');
    try {
        const response = await makeRequest(`${BASE_URL}/actuator/health`);
        return response.status === 200;
    } catch (error) {
        console.log(`❌ Backend health check failed: ${error.message}`);
        return false;
    }
}

async function testAuthEndpoint() {
    console.log('\n🔍 Testing auth endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/auth/test`);
        return response.status < 500;
    } catch (error) {
        console.log(`❌ Auth endpoint failed: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithoutToken() {
    console.log('\n🔍 Testing ticket creation WITHOUT token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Expected 401/403, got: ${response.status}`);
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ No-token test error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithInvalidToken() {
    console.log('\n🔍 Testing ticket creation with INVALID token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_here'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Expected 401/403, got: ${response.status}`);
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ Invalid token test error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithValidToken(token) {
    console.log('\n🔍 Testing ticket creation with VALID token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testTicketData)
        });
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Ticket created successfully!');
            return true;
        } else if (response.status === 403) {
            console.log('❌ 403 Forbidden - Authorization issue');
            console.log('📄 Error details:', response.data);
            return false;
        } else {
            console.log(`❌ Unexpected status: ${response.status}`);
            console.log('📄 Error details:', response.data);
            return false;
        }
    } catch (error) {
        console.log(`❌ Valid token test error: ${error.message}`);
        return false;
    }
}

async function testAuthMeEndpoint(token) {
    console.log('\n🔍 Testing /auth/me endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ /auth/me successful - token is valid');
            return true;
        } else {
            console.log(`❌ /auth/me failed: ${response.status}`);
            console.log('📄 Error details:', response.data);
            return false;
        }
    } catch (error) {
        console.log(`❌ /auth/me error: ${error.message}`);
        return false;
    }
}

// Main test function
async function run403DebugTests(token = null) {
    console.log('🚀 Starting 403 Error Debug Tests...\n');
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Auth Endpoint', fn: testAuthEndpoint },
        { name: 'Ticket Creation (No Token)', fn: testTicketCreationWithoutToken },
        { name: 'Ticket Creation (Invalid Token)', fn: testTicketCreationWithInvalidToken }
    ];
    
    // Add token-dependent tests if token provided
    if (token) {
        tests.push({ name: 'Auth Me Endpoint', fn: () => testAuthMeEndpoint(token) });
        tests.push({ name: 'Ticket Creation (Valid Token)', fn: () => testTicketCreationWithValidToken(token) });
    }
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n📋 Running: ${test.name}`);
        console.log('='.repeat(60));
        
        try {
            const result = await test.fn();
            results.push({ name: test.name, success: result });
            console.log(`\n${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
            console.log(`\n❌ ${test.name}: ERROR - ${error.message}`);
            results.push({ name: test.name, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 403 ERROR DEBUG SUMMARY');
    console.log('='.repeat(70));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    // Analysis
    console.log('\n🔍 ANALYSIS:');
    if (results.find(r => r.name === 'Ticket Creation (No Token)' && r.success)) {
        console.log('✅ Backend correctly rejects requests without token');
    }
    if (results.find(r => r.name === 'Ticket Creation (Invalid Token)' && r.success)) {
        console.log('✅ Backend correctly rejects requests with invalid token');
    }
    if (token && results.find(r => r.name === 'Auth Me Endpoint' && !r.success)) {
        console.log('❌ Token validation failed - token may be expired or invalid');
    }
    if (token && results.find(r => r.name === 'Ticket Creation (Valid Token)' && !r.success)) {
        console.log('❌ 403 on valid token - check user permissions or backend configuration');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const token = process.argv[2];
    
    if (token) {
        console.log(`🔑 Using provided token: ${token.substring(0, 20)}...`);
        run403DebugTests(token).catch(console.error);
    } else {
        console.log('⚠️  No token provided. Running tests without token validation.');
        console.log('   Usage: node test_backend_403.js <your_jwt_token>');
        run403DebugTests().catch(console.error);
    }
}

module.exports = { run403DebugTests }; 
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';

// Test data
const testTicketData = {
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
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const requestOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: options.headers || {}
        };
        
        console.log(`🌐 Making ${requestOptions.method} request to: ${url}`);
        console.log(`📋 Headers:`, requestOptions.headers);
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                console.log(`📊 Response: ${res.statusCode} ${res.statusMessage}`);
                console.log(`📄 Response headers:`, res.headers);
                console.log(`📄 Response body: ${data}`);
                
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ Request error: ${err.message}`);
            reject(err);
        });
        
        if (options.body) {
            console.log(`📄 Request body: ${options.body}`);
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test functions
async function testBackendHealth() {
    console.log('\n🔍 Testing backend health...');
    try {
        const response = await makeRequest(`${BASE_URL}/actuator/health`);
        return response.status === 200;
    } catch (error) {
        console.log(`❌ Backend health check failed: ${error.message}`);
        return false;
    }
}

async function testAuthEndpoint() {
    console.log('\n🔍 Testing auth endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/auth/test`);
        return response.status < 500;
    } catch (error) {
        console.log(`❌ Auth endpoint failed: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithoutToken() {
    console.log('\n🔍 Testing ticket creation WITHOUT token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Expected 401/403, got: ${response.status}`);
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ No-token test error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithInvalidToken() {
    console.log('\n🔍 Testing ticket creation with INVALID token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid_token_here'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Expected 401/403, got: ${response.status}`);
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ Invalid token test error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithValidToken(token) {
    console.log('\n🔍 Testing ticket creation with VALID token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(testTicketData)
        });
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Ticket created successfully!');
            return true;
        } else if (response.status === 403) {
            console.log('❌ 403 Forbidden - Authorization issue');
            console.log('📄 Error details:', response.data);
            return false;
        } else {
            console.log(`❌ Unexpected status: ${response.status}`);
            console.log('📄 Error details:', response.data);
            return false;
        }
    } catch (error) {
        console.log(`❌ Valid token test error: ${error.message}`);
        return false;
    }
}

async function testAuthMeEndpoint(token) {
    console.log('\n🔍 Testing /auth/me endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/auth/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ /auth/me successful - token is valid');
            return true;
        } else {
            console.log(`❌ /auth/me failed: ${response.status}`);
            console.log('📄 Error details:', response.data);
            return false;
        }
    } catch (error) {
        console.log(`❌ /auth/me error: ${error.message}`);
        return false;
    }
}

// Main test function
async function run403DebugTests(token = null) {
    console.log('🚀 Starting 403 Error Debug Tests...\n');
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Auth Endpoint', fn: testAuthEndpoint },
        { name: 'Ticket Creation (No Token)', fn: testTicketCreationWithoutToken },
        { name: 'Ticket Creation (Invalid Token)', fn: testTicketCreationWithInvalidToken }
    ];
    
    // Add token-dependent tests if token provided
    if (token) {
        tests.push({ name: 'Auth Me Endpoint', fn: () => testAuthMeEndpoint(token) });
        tests.push({ name: 'Ticket Creation (Valid Token)', fn: () => testTicketCreationWithValidToken(token) });
    }
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n📋 Running: ${test.name}`);
        console.log('='.repeat(60));
        
        try {
            const result = await test.fn();
            results.push({ name: test.name, success: result });
            console.log(`\n${result ? '✅' : '❌'} ${test.name}: ${result ? 'PASSED' : 'FAILED'}`);
        } catch (error) {
            console.log(`\n❌ ${test.name}: ERROR - ${error.message}`);
            results.push({ name: test.name, success: false, error: error.message });
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 403 ERROR DEBUG SUMMARY');
    console.log('='.repeat(70));
    
    const passed = results.filter(r => r.success).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} ${result.name}`);
        if (result.error) {
            console.log(`   Error: ${result.error}`);
        }
    });
    
    console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
    
    // Analysis
    console.log('\n🔍 ANALYSIS:');
    if (results.find(r => r.name === 'Ticket Creation (No Token)' && r.success)) {
        console.log('✅ Backend correctly rejects requests without token');
    }
    if (results.find(r => r.name === 'Ticket Creation (Invalid Token)' && r.success)) {
        console.log('✅ Backend correctly rejects requests with invalid token');
    }
    if (token && results.find(r => r.name === 'Auth Me Endpoint' && !r.success)) {
        console.log('❌ Token validation failed - token may be expired or invalid');
    }
    if (token && results.find(r => r.name === 'Ticket Creation (Valid Token)' && !r.success)) {
        console.log('❌ 403 on valid token - check user permissions or backend configuration');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const token = process.argv[2];
    
    if (token) {
        console.log(`🔑 Using provided token: ${token.substring(0, 20)}...`);
        run403DebugTests(token).catch(console.error);
    } else {
        console.log('⚠️  No token provided. Running tests without token validation.');
        console.log('   Usage: node test_backend_403.js <your_jwt_token>');
        run403DebugTests().catch(console.error);
    }
}

module.exports = { run403DebugTests }; 