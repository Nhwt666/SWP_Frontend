const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // Replace with actual token

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
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test functions
async function testBackendHealth() {
    console.log('🔍 Testing backend health...');
    try {
        const response = await makeRequest(`${BASE_URL}/actuator/health`);
        console.log(`✅ Backend health check: ${response.status}`);
        return response.status === 200;
    } catch (error) {
        console.log(`❌ Backend health check failed: ${error.message}`);
        return false;
    }
}

async function testAuthEndpoint() {
    console.log('🔍 Testing auth endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/auth/test`);
        console.log(`✅ Auth endpoint: ${response.status}`);
        return response.status < 500; // Accept 403/401 as backend is running
    } catch (error) {
        console.log(`❌ Auth endpoint failed: ${error.message}`);
        return false;
    }
}

async function testTicketCreation() {
    console.log('🔍 Testing ticket creation...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Ticket creation response: ${response.status}`);
        console.log(`📄 Response data: ${response.data}`);
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Ticket created successfully!');
            return true;
        } else {
            console.log(`❌ Ticket creation failed with status: ${response.status}`);
            console.log(`📄 Error details: ${response.data}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ticket creation error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithoutToken() {
    console.log('🔍 Testing ticket creation without token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 No-token response: ${response.status}`);
        console.log(`📄 Response data: ${response.data}`);
        
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ No-token test error: ${error.message}`);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Backend Tests...\n');
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Auth Endpoint', fn: testAuthEndpoint },
        { name: 'Ticket Creation (No Token)', fn: testTicketCreationWithoutToken },
        { name: 'Ticket Creation (With Token)', fn: testTicketCreation }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n📋 Running: ${test.name}`);
        console.log('='.repeat(50));
        
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
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
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
    
    if (passed === total) {
        console.log('🎉 All tests passed! Backend is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    if (TEST_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
        console.log('⚠️  Please set TEST_TOKEN to a valid JWT token before running tests.');
        console.log('   You can get a token by logging in through the frontend.');
        process.exit(1);
    }
    
    runTests().catch(console.error);
}

module.exports = { runTests, testBackendHealth, testTicketCreation }; 
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8080';
const TEST_TOKEN = 'YOUR_TEST_TOKEN_HERE'; // Replace with actual token

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
        
        const req = client.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Test functions
async function testBackendHealth() {
    console.log('🔍 Testing backend health...');
    try {
        const response = await makeRequest(`${BASE_URL}/actuator/health`);
        console.log(`✅ Backend health check: ${response.status}`);
        return response.status === 200;
    } catch (error) {
        console.log(`❌ Backend health check failed: ${error.message}`);
        return false;
    }
}

async function testAuthEndpoint() {
    console.log('🔍 Testing auth endpoint...');
    try {
        const response = await makeRequest(`${BASE_URL}/api/auth/test`);
        console.log(`✅ Auth endpoint: ${response.status}`);
        return response.status < 500; // Accept 403/401 as backend is running
    } catch (error) {
        console.log(`❌ Auth endpoint failed: ${error.message}`);
        return false;
    }
}

async function testTicketCreation() {
    console.log('🔍 Testing ticket creation...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TEST_TOKEN}`
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 Ticket creation response: ${response.status}`);
        console.log(`📄 Response data: ${response.data}`);
        
        if (response.status === 200 || response.status === 201) {
            console.log('✅ Ticket created successfully!');
            return true;
        } else {
            console.log(`❌ Ticket creation failed with status: ${response.status}`);
            console.log(`📄 Error details: ${response.data}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ticket creation error: ${error.message}`);
        return false;
    }
}

async function testTicketCreationWithoutToken() {
    console.log('🔍 Testing ticket creation without token...');
    try {
        const response = await makeRequest(`${BASE_URL}/tickets/after-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testTicketData)
        });
        
        console.log(`📊 No-token response: ${response.status}`);
        console.log(`📄 Response data: ${response.data}`);
        
        return response.status === 401 || response.status === 403;
    } catch (error) {
        console.log(`❌ No-token test error: ${error.message}`);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Backend Tests...\n');
    
    const tests = [
        { name: 'Backend Health', fn: testBackendHealth },
        { name: 'Auth Endpoint', fn: testAuthEndpoint },
        { name: 'Ticket Creation (No Token)', fn: testTicketCreationWithoutToken },
        { name: 'Ticket Creation (With Token)', fn: testTicketCreation }
    ];
    
    const results = [];
    
    for (const test of tests) {
        console.log(`\n📋 Running: ${test.name}`);
        console.log('='.repeat(50));
        
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
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
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
    
    if (passed === total) {
        console.log('🎉 All tests passed! Backend is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the details above.');
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    if (TEST_TOKEN === 'YOUR_TEST_TOKEN_HERE') {
        console.log('⚠️  Please set TEST_TOKEN to a valid JWT token before running tests.');
        console.log('   You can get a token by logging in through the frontend.');
        process.exit(1);
    }
    
    runTests().catch(console.error);
}

module.exports = { runTests, testBackendHealth, testTicketCreation }; 