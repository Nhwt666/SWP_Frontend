# 🔍 **Debug Guide: 403 Forbidden Error khi tạo Ticket**

## 📋 **Vấn đề hiện tại**
- ❌ Status: 403 Forbidden
- ❌ Type: CIVIL
- ❌ Method: SELF_TEST  
- ❌ Status: CONFIRMED
- 🔍 Nguyên nhân: Authentication/Authorization issue

## 🚨 **Nguyên nhân 403 Forbidden**

### **1. JWT Token Issues**
- ❌ Token expired
- ❌ Token invalid/ corrupted
- ❌ Token format không đúng
- ❌ Token không được gửi đúng cách

### **2. User Permission Issues**
- ❌ User không có quyền tạo ticket
- ❌ User role không đúng
- ❌ User account bị disabled

### **3. Backend Security Issues**
- ❌ Security configuration sai
- ❌ CORS issues
- ❌ Authentication filter problems

## 🛠️ **Debug Steps**

### **Step 1: Kiểm tra JWT Token trong Browser**

**Mở Developer Tools (F12) → Console và chạy:**

```javascript
// Copy và paste code từ check_token.js
function checkToken() {
    console.log('🔍 Checking JWT Token...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No token found in localStorage');
        return;
    }
    
    console.log('📄 Token found:', token.substring(0, 50) + '...');
    
    // Decode JWT
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format');
            return;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log('📋 Token Payload:', payload);
        
        // Check expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const isExpired = now > exp;
            
            console.log(`⏰ Token expiration: ${new Date(exp * 1000).toLocaleString()}`);
            console.log(`⏰ Current time: ${new Date(now * 1000).toLocaleString()}`);
            console.log(`⏰ Is expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
        }
        
        // Check user info
        if (payload.sub) console.log(`👤 User ID: ${payload.sub}`);
        if (payload.role) console.log(`🔑 Role: ${payload.role}`);
        
    } catch (error) {
        console.log('❌ Error decoding token:', error.message);
    }
}

checkToken();
```

**Expected Output:**
```
🔍 Checking JWT Token...
📄 Token found: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📋 Token Payload: {sub: "1", role: "MEMBER", exp: 1234567890, ...}
⏰ Token expiration: 12/31/2023, 11:59:59 PM
⏰ Current time: 12/31/2023, 10:00:00 PM
⏰ Is expired: ✅ NO
👤 User ID: 1
🔑 Role: MEMBER
```

### **Step 2: Test Token với Backend**

**Trong browser console:**

```javascript
async function testTokenWithBackend() {
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

testTokenWithBackend();
```

### **Step 3: Test Backend với Node.js Script**

**Chạy script test:**

```bash
# Lấy token từ browser console
# localStorage.getItem('token')

# Chạy test script
node test_backend_403.js YOUR_JWT_TOKEN_HERE
```

**Expected Output:**
```
🚀 Starting 403 Error Debug Tests...

📋 Running: Backend Health
✅ Backend Health: PASSED

📋 Running: Auth Me Endpoint
✅ /auth/me successful - token is valid

📋 Running: Ticket Creation (Valid Token)
❌ 403 Forbidden - Authorization issue
📄 Error details: {"message":"Access denied","error":"Insufficient permissions"}

📊 403 ERROR DEBUG SUMMARY
❌ FAIL Ticket Creation (Valid Token)
❌ 403 on valid token - check user permissions or backend configuration
```

### **Step 4: Kiểm tra User Permissions**

**Trong browser console:**

```javascript
// Kiểm tra user info
async function checkUserPermissions() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('👤 User Info:', user);
            console.log('🔑 Role:', user.role);
            console.log('📊 Status:', user.status);
            console.log('💰 Wallet:', user.walletBalance);
            
            // Check if user can create tickets
            if (user.role === 'MEMBER' || user.role === 'ADMIN') {
                console.log('✅ User has permission to create tickets');
            } else {
                console.log('❌ User does not have permission to create tickets');
            }
        }
    } catch (error) {
        console.log('❌ Error checking user permissions:', error);
    }
}

checkUserPermissions();
```

## 🔧 **Quick Fixes**

### **Fix 1: Token Expired**
```javascript
// Clear token và login lại
localStorage.removeItem('token');
// Redirect to login page
window.location.href = '/login';
```

### **Fix 2: Invalid Token**
```javascript
// Check token format
const token = localStorage.getItem('token');
if (!token || token.split('.').length !== 3) {
    console.log('❌ Invalid token format');
    localStorage.removeItem('token');
    // Login again
}
```

### **Fix 3: User Role Issue**
```javascript
// Check user role in backend
// Ensure user has MEMBER or ADMIN role
// Check if user account is active
```

### **Fix 4: Backend Security Config**
```java
// Check backend security configuration
// Ensure /tickets/after-payment endpoint allows MEMBER role
// Check JWT filter configuration
```

## 📊 **Expected Results**

### **✅ Success Case:**
```
Frontend Console:
✅ Token is valid! User info: {id: 1, role: "MEMBER", ...}
✅ User has permission to create tickets

Backend Test:
✅ /auth/me successful - token is valid
✅ Ticket created successfully!

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED
```

### **❌ Error Cases:**

**Case 1: Token Expired**
```
Frontend Console:
⏰ Is expired: ❌ YES
⚠️  Token has expired! Please login again.

Backend Test:
❌ /auth/me failed: 401
❌ Token validation failed
```

**Case 2: Invalid Token**
```
Frontend Console:
❌ Invalid JWT format (should have 3 parts)

Backend Test:
❌ /auth/me failed: 401
❌ Token validation failed
```

**Case 3: Insufficient Permissions**
```
Frontend Console:
✅ Token is valid! User info: {id: 1, role: "GUEST", ...}
❌ User does not have permission to create tickets

Backend Test:
✅ /auth/me successful - token is valid
❌ 403 Forbidden - Authorization issue
```

## 🎯 **Next Steps**

1. **Chạy token check** trong browser console
2. **Test token với backend** 
3. **Chạy Node.js test script** với token
4. **Kiểm tra user permissions**
5. **Report kết quả** với logs chi tiết

## 📞 **Support**

**Nếu vẫn gặp vấn đề, cung cấp:**
- Token check output
- Auth test results
- Node.js test script output
- User permissions check
- Backend logs (nếu có)

**Files hỗ trợ:**
- `check_token.js` - Token validation script
- `test_backend_403.js` - 403 error test script
- `DEBUG_403_ERROR.md` - This guide 

## 📋 **Vấn đề hiện tại**
- ❌ Status: 403 Forbidden
- ❌ Type: CIVIL
- ❌ Method: SELF_TEST  
- ❌ Status: CONFIRMED
- 🔍 Nguyên nhân: Authentication/Authorization issue

## 🚨 **Nguyên nhân 403 Forbidden**

### **1. JWT Token Issues**
- ❌ Token expired
- ❌ Token invalid/ corrupted
- ❌ Token format không đúng
- ❌ Token không được gửi đúng cách

### **2. User Permission Issues**
- ❌ User không có quyền tạo ticket
- ❌ User role không đúng
- ❌ User account bị disabled

### **3. Backend Security Issues**
- ❌ Security configuration sai
- ❌ CORS issues
- ❌ Authentication filter problems

## 🛠️ **Debug Steps**

### **Step 1: Kiểm tra JWT Token trong Browser**

**Mở Developer Tools (F12) → Console và chạy:**

```javascript
// Copy và paste code từ check_token.js
function checkToken() {
    console.log('🔍 Checking JWT Token...');
    
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log('❌ No token found in localStorage');
        return;
    }
    
    console.log('📄 Token found:', token.substring(0, 50) + '...');
    
    // Decode JWT
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.log('❌ Invalid JWT format');
            return;
        }
        
        const payload = JSON.parse(atob(parts[1]));
        console.log('📋 Token Payload:', payload);
        
        // Check expiration
        if (payload.exp) {
            const now = Math.floor(Date.now() / 1000);
            const exp = payload.exp;
            const isExpired = now > exp;
            
            console.log(`⏰ Token expiration: ${new Date(exp * 1000).toLocaleString()}`);
            console.log(`⏰ Current time: ${new Date(now * 1000).toLocaleString()}`);
            console.log(`⏰ Is expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
        }
        
        // Check user info
        if (payload.sub) console.log(`👤 User ID: ${payload.sub}`);
        if (payload.role) console.log(`🔑 Role: ${payload.role}`);
        
    } catch (error) {
        console.log('❌ Error decoding token:', error.message);
    }
}

checkToken();
```

**Expected Output:**
```
🔍 Checking JWT Token...
📄 Token found: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
📋 Token Payload: {sub: "1", role: "MEMBER", exp: 1234567890, ...}
⏰ Token expiration: 12/31/2023, 11:59:59 PM
⏰ Current time: 12/31/2023, 10:00:00 PM
⏰ Is expired: ✅ NO
👤 User ID: 1
🔑 Role: MEMBER
```

### **Step 2: Test Token với Backend**

**Trong browser console:**

```javascript
async function testTokenWithBackend() {
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

testTokenWithBackend();
```

### **Step 3: Test Backend với Node.js Script**

**Chạy script test:**

```bash
# Lấy token từ browser console
# localStorage.getItem('token')

# Chạy test script
node test_backend_403.js YOUR_JWT_TOKEN_HERE
```

**Expected Output:**
```
🚀 Starting 403 Error Debug Tests...

📋 Running: Backend Health
✅ Backend Health: PASSED

📋 Running: Auth Me Endpoint
✅ /auth/me successful - token is valid

📋 Running: Ticket Creation (Valid Token)
❌ 403 Forbidden - Authorization issue
📄 Error details: {"message":"Access denied","error":"Insufficient permissions"}

📊 403 ERROR DEBUG SUMMARY
❌ FAIL Ticket Creation (Valid Token)
❌ 403 on valid token - check user permissions or backend configuration
```

### **Step 4: Kiểm tra User Permissions**

**Trong browser console:**

```javascript
// Kiểm tra user info
async function checkUserPermissions() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('👤 User Info:', user);
            console.log('🔑 Role:', user.role);
            console.log('📊 Status:', user.status);
            console.log('💰 Wallet:', user.walletBalance);
            
            // Check if user can create tickets
            if (user.role === 'MEMBER' || user.role === 'ADMIN') {
                console.log('✅ User has permission to create tickets');
            } else {
                console.log('❌ User does not have permission to create tickets');
            }
        }
    } catch (error) {
        console.log('❌ Error checking user permissions:', error);
    }
}

checkUserPermissions();
```

## 🔧 **Quick Fixes**

### **Fix 1: Token Expired**
```javascript
// Clear token và login lại
localStorage.removeItem('token');
// Redirect to login page
window.location.href = '/login';
```

### **Fix 2: Invalid Token**
```javascript
// Check token format
const token = localStorage.getItem('token');
if (!token || token.split('.').length !== 3) {
    console.log('❌ Invalid token format');
    localStorage.removeItem('token');
    // Login again
}
```

### **Fix 3: User Role Issue**
```javascript
// Check user role in backend
// Ensure user has MEMBER or ADMIN role
// Check if user account is active
```

### **Fix 4: Backend Security Config**
```java
// Check backend security configuration
// Ensure /tickets/after-payment endpoint allows MEMBER role
// Check JWT filter configuration
```

## 📊 **Expected Results**

### **✅ Success Case:**
```
Frontend Console:
✅ Token is valid! User info: {id: 1, role: "MEMBER", ...}
✅ User has permission to create tickets

Backend Test:
✅ /auth/me successful - token is valid
✅ Ticket created successfully!

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED
```

### **❌ Error Cases:**

**Case 1: Token Expired**
```
Frontend Console:
⏰ Is expired: ❌ YES
⚠️  Token has expired! Please login again.

Backend Test:
❌ /auth/me failed: 401
❌ Token validation failed
```

**Case 2: Invalid Token**
```
Frontend Console:
❌ Invalid JWT format (should have 3 parts)

Backend Test:
❌ /auth/me failed: 401
❌ Token validation failed
```

**Case 3: Insufficient Permissions**
```
Frontend Console:
✅ Token is valid! User info: {id: 1, role: "GUEST", ...}
❌ User does not have permission to create tickets

Backend Test:
✅ /auth/me successful - token is valid
❌ 403 Forbidden - Authorization issue
```

## 🎯 **Next Steps**

1. **Chạy token check** trong browser console
2. **Test token với backend** 
3. **Chạy Node.js test script** với token
4. **Kiểm tra user permissions**
5. **Report kết quả** với logs chi tiết

## 📞 **Support**

**Nếu vẫn gặp vấn đề, cung cấp:**
- Token check output
- Auth test results
- Node.js test script output
- User permissions check
- Backend logs (nếu có)

**Files hỗ trợ:**
- `check_token.js` - Token validation script
- `test_backend_403.js` - 403 error test script
- `DEBUG_403_ERROR.md` - This guide 