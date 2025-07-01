# 🔍 **Debug Guide: "Lỗi không xác định" khi tạo Ticket**

## 📋 **Vấn đề hiện tại**
- ❌ Tạo ticket thất bại với thông báo "Lỗi không xác định"
- 🔍 Cần debug để tìm nguyên nhân chi tiết

## 🛠️ **Các bước Debug**

### **Step 1: Kiểm tra Frontend Console Logs**

1. **Mở Developer Tools** (F12)
2. **Chuyển sang tab Console**
3. **Tạo ticket và xem logs**

**Expected logs sau khi cải thiện:**
```
=== DEBUG TICKET CREATION ===
Category: Dân sự
Method: Tự gửi mẫu
TypeMap[category]: CIVIL
MethodMap[method]: SELF_TEST
Is CIVIL SELF_TEST: true
Expected status: CONFIRMED
Ticket data being sent: {...}
=== END DEBUG ===

=== TICKET CREATION ERROR ===
Response status: 500
Response status text: Internal Server Error
Response headers: {...}
Error response body: {"message":"Internal server error","error":"..."}
Request data sent: {...}
=== END ERROR DEBUG ===
```

### **Step 2: Kiểm tra Backend Logs**

**Tìm backend logs và xem:**
```
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   Request type: CIVIL
   Request method: SELF_TEST
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
```

**Hoặc error logs:**
```
❌ ERROR: createTicketAfterPayment
   Exception: java.lang.NullPointerException
   Stack trace: ...
   Request data: {...}
```

### **Step 3: Test Backend với Script**

**Sử dụng script test đã tạo:**
```bash
# Edit test_simple_backend.js và set TEST_TOKEN
node test_simple_backend.js
```

**Expected output:**
```
🚀 Starting Backend Tests...

📋 Running: Backend Health
==================================================
🔍 Testing backend health...
✅ Backend health check: 200

✅ Backend Health: PASSED

📋 Running: Ticket Creation (With Token)
==================================================
🔍 Testing ticket creation...
📊 Ticket creation response: 200
📄 Response data: {"id":123,"status":"CONFIRMED",...}
✅ Ticket created successfully!

✅ Ticket Creation (With Token): PASSED
```

### **Step 4: Kiểm tra Database**

**Chạy query để kiểm tra:**
```sql
-- Kiểm tra enum TicketStatus
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_status');

-- Kiểm tra recent tickets
SELECT id, type, method, status, created_at 
FROM tickets 
WHERE type = 'CIVIL' AND method = 'SELF_TEST' 
ORDER BY created_at DESC 
LIMIT 5;

-- Kiểm tra migration V24
SELECT * FROM flyway_schema_history WHERE version = 'V24';
```

## 🚨 **Các nguyên nhân có thể**

### **1. Backend không chạy**
- **Symptom**: Network error, connection refused
- **Solution**: Start backend application

### **2. Authentication Error**
- **Symptom**: 401/403 status codes
- **Solution**: Check JWT token validity

### **3. Database Connection Error**
- **Symptom**: 500 error với database exception
- **Solution**: Check database connection và credentials

### **4. Validation Error**
- **Symptom**: 400 error với validation message
- **Solution**: Check request data format

### **5. Enum/Status Error**
- **Symptom**: 500 error với enum exception
- **Solution**: Check TicketStatus enum có CONFIRMED

### **6. Migration Error**
- **Symptom**: 500 error với constraint violation
- **Solution**: Run migration V24

## 🔧 **Quick Fixes**

### **Fix 1: Restart Backend**
```bash
# Stop backend
# Start backend again
# Check logs for startup errors
```

### **Fix 2: Check Token**
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('token'));
// Nếu null hoặc expired, login lại
```

### **Fix 3: Test với Postman**
```
POST http://localhost:8080/tickets/after-payment
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN

Body:
{
  "type": "CIVIL",
  "method": "SELF_TEST", 
  "status": "CONFIRMED",
  "reason": "Xác minh quan hệ huyết thống",
  "customerId": 1,
  "amount": 1500000
}
```

### **Fix 4: Check Database**
```sql
-- Kiểm tra enum
SELECT unnest(enum_range(NULL::ticket_status));

-- Kiểm tra table structure
\d tickets;
```

## 📊 **Expected Results**

### **✅ Success Case:**
```
Frontend Console:
✅ Ticket created successfully!

Backend Logs:
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED
```

### **❌ Error Cases:**

**Case 1: Backend Down**
```
Frontend Console:
❌ Không thể kết nối đến máy chủ: connect ECONNREFUSED
```

**Case 2: Invalid Token**
```
Frontend Console:
❌ Tạo ticket thất bại: Unauthorized
```

**Case 3: Database Error**
```
Frontend Console:
❌ Tạo ticket thất bại: Internal server error
Backend Logs: Database connection failed
```

**Case 4: Validation Error**
```
Frontend Console:
❌ Tạo ticket thất bại: Validation failed
Backend Logs: Invalid status value
```

## 🎯 **Next Steps**

1. **Chạy frontend** và tạo ticket
2. **Xem console logs** để có thông tin chi tiết
3. **Kiểm tra backend logs** nếu có
4. **Chạy test script** để validate backend
5. **Report kết quả** với logs chi tiết

## 📞 **Support**

**Nếu vẫn gặp vấn đề, cung cấp:**
- Frontend console logs
- Backend logs (nếu có)
- Test script output
- Database query results
- Error message chi tiết

**Files hỗ trợ:**
- `test_simple_backend.js` - Test backend
- `DEBUG_TICKET_ERROR.md` - This guide
- `README_TICKET_STATUS_FIX.md` - Complete solution guide 

## 📋 **Vấn đề hiện tại**
- ❌ Tạo ticket thất bại với thông báo "Lỗi không xác định"
- 🔍 Cần debug để tìm nguyên nhân chi tiết

## 🛠️ **Các bước Debug**

### **Step 1: Kiểm tra Frontend Console Logs**

1. **Mở Developer Tools** (F12)
2. **Chuyển sang tab Console**
3. **Tạo ticket và xem logs**

**Expected logs sau khi cải thiện:**
```
=== DEBUG TICKET CREATION ===
Category: Dân sự
Method: Tự gửi mẫu
TypeMap[category]: CIVIL
MethodMap[method]: SELF_TEST
Is CIVIL SELF_TEST: true
Expected status: CONFIRMED
Ticket data being sent: {...}
=== END DEBUG ===

=== TICKET CREATION ERROR ===
Response status: 500
Response status text: Internal Server Error
Response headers: {...}
Error response body: {"message":"Internal server error","error":"..."}
Request data sent: {...}
=== END ERROR DEBUG ===
```

### **Step 2: Kiểm tra Backend Logs**

**Tìm backend logs và xem:**
```
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   Request type: CIVIL
   Request method: SELF_TEST
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
```

**Hoặc error logs:**
```
❌ ERROR: createTicketAfterPayment
   Exception: java.lang.NullPointerException
   Stack trace: ...
   Request data: {...}
```

### **Step 3: Test Backend với Script**

**Sử dụng script test đã tạo:**
```bash
# Edit test_simple_backend.js và set TEST_TOKEN
node test_simple_backend.js
```

**Expected output:**
```
🚀 Starting Backend Tests...

📋 Running: Backend Health
==================================================
🔍 Testing backend health...
✅ Backend health check: 200

✅ Backend Health: PASSED

📋 Running: Ticket Creation (With Token)
==================================================
🔍 Testing ticket creation...
📊 Ticket creation response: 200
📄 Response data: {"id":123,"status":"CONFIRMED",...}
✅ Ticket created successfully!

✅ Ticket Creation (With Token): PASSED
```

### **Step 4: Kiểm tra Database**

**Chạy query để kiểm tra:**
```sql
-- Kiểm tra enum TicketStatus
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'ticket_status');

-- Kiểm tra recent tickets
SELECT id, type, method, status, created_at 
FROM tickets 
WHERE type = 'CIVIL' AND method = 'SELF_TEST' 
ORDER BY created_at DESC 
LIMIT 5;

-- Kiểm tra migration V24
SELECT * FROM flyway_schema_history WHERE version = 'V24';
```

## 🚨 **Các nguyên nhân có thể**

### **1. Backend không chạy**
- **Symptom**: Network error, connection refused
- **Solution**: Start backend application

### **2. Authentication Error**
- **Symptom**: 401/403 status codes
- **Solution**: Check JWT token validity

### **3. Database Connection Error**
- **Symptom**: 500 error với database exception
- **Solution**: Check database connection và credentials

### **4. Validation Error**
- **Symptom**: 400 error với validation message
- **Solution**: Check request data format

### **5. Enum/Status Error**
- **Symptom**: 500 error với enum exception
- **Solution**: Check TicketStatus enum có CONFIRMED

### **6. Migration Error**
- **Symptom**: 500 error với constraint violation
- **Solution**: Run migration V24

## 🔧 **Quick Fixes**

### **Fix 1: Restart Backend**
```bash
# Stop backend
# Start backend again
# Check logs for startup errors
```

### **Fix 2: Check Token**
```javascript
// Trong browser console
console.log('Token:', localStorage.getItem('token'));
// Nếu null hoặc expired, login lại
```

### **Fix 3: Test với Postman**
```
POST http://localhost:8080/tickets/after-payment
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN

Body:
{
  "type": "CIVIL",
  "method": "SELF_TEST", 
  "status": "CONFIRMED",
  "reason": "Xác minh quan hệ huyết thống",
  "customerId": 1,
  "amount": 1500000
}
```

### **Fix 4: Check Database**
```sql
-- Kiểm tra enum
SELECT unnest(enum_range(NULL::ticket_status));

-- Kiểm tra table structure
\d tickets;
```

## 📊 **Expected Results**

### **✅ Success Case:**
```
Frontend Console:
✅ Ticket created successfully!

Backend Logs:
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED
```

### **❌ Error Cases:**

**Case 1: Backend Down**
```
Frontend Console:
❌ Không thể kết nối đến máy chủ: connect ECONNREFUSED
```

**Case 2: Invalid Token**
```
Frontend Console:
❌ Tạo ticket thất bại: Unauthorized
```

**Case 3: Database Error**
```
Frontend Console:
❌ Tạo ticket thất bại: Internal server error
Backend Logs: Database connection failed
```

**Case 4: Validation Error**
```
Frontend Console:
❌ Tạo ticket thất bại: Validation failed
Backend Logs: Invalid status value
```

## 🎯 **Next Steps**

1. **Chạy frontend** và tạo ticket
2. **Xem console logs** để có thông tin chi tiết
3. **Kiểm tra backend logs** nếu có
4. **Chạy test script** để validate backend
5. **Report kết quả** với logs chi tiết

## 📞 **Support**

**Nếu vẫn gặp vấn đề, cung cấp:**
- Frontend console logs
- Backend logs (nếu có)
- Test script output
- Database query results
- Error message chi tiết

**Files hỗ trợ:**
- `test_simple_backend.js` - Test backend
- `DEBUG_TICKET_ERROR.md` - This guide
- `README_TICKET_STATUS_FIX.md` - Complete solution guide 