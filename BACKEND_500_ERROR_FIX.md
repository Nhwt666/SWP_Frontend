# 🔧 **Backend Requirements - Fix 500 Error khi tạo Ticket**

## 📋 **Vấn đề hiện tại**
- ❌ **500 Internal Server Error** khi tạo ticket CIVIL SELF_TEST
- ❌ Frontend nhận được "An unexpected error occurred while creating the ticket"
- ❌ Cần backend logs để xác định nguyên nhân chính xác

## 🚨 **Nguyên nhân có thể**

### **1. Database Enum Issue**
```sql
-- Kiểm tra enum ticket_status có CONFIRMED không
SELECT unnest(enum_range(NULL::ticket_status));

-- Nếu thiếu, chạy migration:
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';
```

### **2. Null Pointer Exception**
- CustomerId không tồn tại trong database
- User không có quyền tạo ticket
- Field bắt buộc bị null

### **3. Validation Error**
- Status không hợp lệ
- Type/Method không đúng format
- Amount không hợp lệ

### **4. Mapping Error**
- DTO to Entity mapping sai
- Enum conversion failed

## 🔧 **Yêu cầu Backend**

### **Requirement 1: Add Comprehensive Error Logging**

```java
@PostMapping("/tickets/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
    
    try {
        // Log request details
        log.info("🔍 DEBUG: createTicketAfterPayment START");
        log.info("   User: {}", userDetails.getUsername());
        log.info("   User ID: {}", userDetails.getUsername());
        log.info("   Request: {}", request);
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        log.info("   Request customerId: {}", request.getCustomerId());
        log.info("   Request amount: {}", request.getAmount());
        
        // Validate request
        if (request.getStatus() == null) {
            log.error("❌ Status is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Status is required"));
        }
        
        if (request.getType() == null) {
            log.error("❌ Type is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Type is required"));
        }
        
        if (request.getMethod() == null) {
            log.error("❌ Method is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Method is required"));
        }
        
        if (request.getCustomerId() == null) {
            log.error("❌ CustomerId is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "CustomerId is required"));
        }
        
        // Check if customer exists
        try {
            User customer = userService.findById(request.getCustomerId());
            log.info("   Customer found: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("❌ Customer not found with ID: {}", request.getCustomerId());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Customer not found"));
        }
        
        // Check wallet balance
        User customer = userService.findById(request.getCustomerId());
        if (customer.getWalletBalance() < request.getAmount()) {
            log.error("❌ Insufficient wallet balance. Required: {}, Available: {}", 
                     request.getAmount(), customer.getWalletBalance());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Insufficient balance", "Wallet balance is not sufficient for this transaction"));
        }
        
        // Check if it's CIVIL SELF_TEST
        boolean isCivilSelfTest = "CIVIL".equals(request.getType()) && 
                                 "SELF_TEST".equals(request.getMethod());
        
        log.info("   Is CIVIL SELF_TEST: {}", isCivilSelfTest);
        
        // Determine final status
        TicketStatus finalStatus;
        try {
            if (isCivilSelfTest && "CONFIRMED".equals(request.getStatus())) {
                finalStatus = TicketStatus.CONFIRMED;
                log.info("   ✅ Using status from request: CONFIRMED");
            } else {
                finalStatus = TicketStatus.PENDING;
                log.info("   ✅ Using default status: PENDING");
            }
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid status value: {}", request.getStatus());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Invalid status value: " + request.getStatus()));
        }
        
        log.info("   🎯 Final ticket status: {}", finalStatus);
        
        // Create ticket
        Ticket ticket = new Ticket();
        ticket.setType(request.getType());
        ticket.setMethod(request.getMethod());
        ticket.setStatus(finalStatus);
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());
        ticket.setAddress(request.getAddress());
        ticket.setPhone(request.getPhone());
        ticket.setEmail(request.getEmail());
        ticket.setSample1Name(request.getSample1Name());
        ticket.setSample2Name(request.getSample2Name());
        ticket.setAppointmentDate(request.getAppointmentDate());
        
        log.info("   🎯 Ticket object created: {}", ticket);
        
        // Save ticket
        Ticket savedTicket = ticketService.save(ticket);
        
        log.info("   🎯 Final ticket ID: {}", savedTicket.getId());
        log.info("   🎯 Saved status: {}", savedTicket.getStatus());
        log.info("🔍 DEBUG: createTicketAfterPayment END - SUCCESS");
        
        return ResponseEntity.ok(savedTicket);
        
    } catch (Exception e) {
        log.error("❌ ERROR: createTicketAfterPayment", e);
        log.error("❌ Exception type: {}", e.getClass().getSimpleName());
        log.error("❌ Exception message: {}", e.getMessage());
        log.error("❌ Stack trace:", e);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", "An unexpected error occurred while creating the ticket"));
    }
}
```

### **Requirement 2: Check Database Enum**

```sql
-- Run this in database to check enum values
SELECT unnest(enum_range(NULL::ticket_status));

-- Expected result should include:
-- PENDING
-- IN_PROGRESS
-- COMPLETED
-- CANCELLED
-- CONFIRMED
-- RECEIVED

-- If CONFIRMED or RECEIVED missing, run:
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';
```

### **Requirement 3: Check TicketStatus Enum in Java**

```java
public enum TicketStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    CONFIRMED,    // ✅ Must exist
    RECEIVED      // ✅ Must exist
}
```

### **Requirement 4: Add Request Validation**

```java
@Component
public class TicketRequestValidator {
    
    public void validate(TicketRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request.getStatus() == null) {
            errors.add("Status is required");
        } else {
            try {
                TicketStatus.valueOf(request.getStatus());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid status: " + request.getStatus());
            }
        }
        
        if (request.getType() == null) {
            errors.add("Type is required");
        } else {
            try {
                TicketType.valueOf(request.getType());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid type: " + request.getType());
            }
        }
        
        if (request.getMethod() == null) {
            errors.add("Method is required");
        } else {
            try {
                TestMethod.valueOf(request.getMethod());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid method: " + request.getMethod());
            }
        }
        
        if (request.getCustomerId() == null) {
            errors.add("CustomerId is required");
        }
        
        if (request.getAmount() == null || request.getAmount() <= 0) {
            errors.add("Amount must be greater than 0");
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join(", ", errors));
        }
    }
}
```

## 🧪 **Testing Requirements**

### **Test Cases for Backend Team**

#### **Test 1: Database Enum Check**
```sql
-- Check enum values
SELECT unnest(enum_range(NULL::ticket_status));

-- Check if migration V25 ran
SELECT * FROM flyway_schema_history WHERE version = 'V25';
```

#### **Test 2: Ticket Creation with Logs**
```bash
# Test CIVIL SELF_TEST CONFIRMED
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "CIVIL",
    "method": "SELF_TEST",
    "status": "CONFIRMED",
    "reason": "Xác minh quan hệ huyết thống",
    "customerId": 1,
    "amount": 1500000
  }'
```

#### **Test 3: Check Backend Logs**
Look for these log patterns:
```
🔍 DEBUG: createTicketAfterPayment START
   User: user@example.com
   Request status: CONFIRMED
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
🔍 DEBUG: createTicketAfterPayment END - SUCCESS
```

Or error logs:
```
❌ ERROR: createTicketAfterPayment
❌ Exception type: IllegalArgumentException
❌ Exception message: No enum constant com.example.TicketStatus.CONFIRMED
```

## 📋 **Checklist for Backend Team**

### **Database:**
- [ ] Enum ticket_status có CONFIRMED và RECEIVED
- [ ] Migration V25 đã chạy thành công
- [ ] User với customerId tồn tại trong database

### **Code:**
- [ ] TicketStatus enum có CONFIRMED và RECEIVED
- [ ] Validation logic hoạt động đúng
- [ ] Error handling với try-catch
- [ ] Logging chi tiết đã thêm

### **Testing:**
- [ ] Test với CIVIL SELF_TEST CONFIRMED
- [ ] Test với các loại ticket khác
- [ ] Check logs không có exception
- [ ] Database lưu đúng status

## 🎯 **Expected Results**

### **After Fix:**
```
Backend Logs:
🔍 DEBUG: createTicketAfterPayment START
   User: user@example.com
   Request status: CONFIRMED
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
🔍 DEBUG: createTicketAfterPayment END - SUCCESS

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED ✅

Frontend Response:
✅ Ticket created successfully!
```

## 📞 **Contact Information**

**Nếu có câu hỏi hoặc cần clarification:**
- Frontend logs đã được cung cấp
- Test script available trong `debug_500_error.js`
- Có thể test trực tiếp với Postman/cURL

**Files hỗ trợ:**
- `debug_500_error.js` - Debug script cho 500 error
- `BACKEND_500_ERROR_FIX.md` - This guide 

## 📋 **Vấn đề hiện tại**
- ❌ **500 Internal Server Error** khi tạo ticket CIVIL SELF_TEST
- ❌ Frontend nhận được "An unexpected error occurred while creating the ticket"
- ❌ Cần backend logs để xác định nguyên nhân chính xác

## 🚨 **Nguyên nhân có thể**

### **1. Database Enum Issue**
```sql
-- Kiểm tra enum ticket_status có CONFIRMED không
SELECT unnest(enum_range(NULL::ticket_status));

-- Nếu thiếu, chạy migration:
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';
```

### **2. Null Pointer Exception**
- CustomerId không tồn tại trong database
- User không có quyền tạo ticket
- Field bắt buộc bị null

### **3. Validation Error**
- Status không hợp lệ
- Type/Method không đúng format
- Amount không hợp lệ

### **4. Mapping Error**
- DTO to Entity mapping sai
- Enum conversion failed

## 🔧 **Yêu cầu Backend**

### **Requirement 1: Add Comprehensive Error Logging**

```java
@PostMapping("/tickets/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
    
    try {
        // Log request details
        log.info("🔍 DEBUG: createTicketAfterPayment START");
        log.info("   User: {}", userDetails.getUsername());
        log.info("   User ID: {}", userDetails.getUsername());
        log.info("   Request: {}", request);
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        log.info("   Request customerId: {}", request.getCustomerId());
        log.info("   Request amount: {}", request.getAmount());
        
        // Validate request
        if (request.getStatus() == null) {
            log.error("❌ Status is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Status is required"));
        }
        
        if (request.getType() == null) {
            log.error("❌ Type is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Type is required"));
        }
        
        if (request.getMethod() == null) {
            log.error("❌ Method is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Method is required"));
        }
        
        if (request.getCustomerId() == null) {
            log.error("❌ CustomerId is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "CustomerId is required"));
        }
        
        // Check if customer exists
        try {
            User customer = userService.findById(request.getCustomerId());
            log.info("   Customer found: {}", customer.getEmail());
        } catch (Exception e) {
            log.error("❌ Customer not found with ID: {}", request.getCustomerId());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Customer not found"));
        }
        
        // Check wallet balance
        User customer = userService.findById(request.getCustomerId());
        if (customer.getWalletBalance() < request.getAmount()) {
            log.error("❌ Insufficient wallet balance. Required: {}, Available: {}", 
                     request.getAmount(), customer.getWalletBalance());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Insufficient balance", "Wallet balance is not sufficient for this transaction"));
        }
        
        // Check if it's CIVIL SELF_TEST
        boolean isCivilSelfTest = "CIVIL".equals(request.getType()) && 
                                 "SELF_TEST".equals(request.getMethod());
        
        log.info("   Is CIVIL SELF_TEST: {}", isCivilSelfTest);
        
        // Determine final status
        TicketStatus finalStatus;
        try {
            if (isCivilSelfTest && "CONFIRMED".equals(request.getStatus())) {
                finalStatus = TicketStatus.CONFIRMED;
                log.info("   ✅ Using status from request: CONFIRMED");
            } else {
                finalStatus = TicketStatus.PENDING;
                log.info("   ✅ Using default status: PENDING");
            }
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid status value: {}", request.getStatus());
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Invalid status value: " + request.getStatus()));
        }
        
        log.info("   🎯 Final ticket status: {}", finalStatus);
        
        // Create ticket
        Ticket ticket = new Ticket();
        ticket.setType(request.getType());
        ticket.setMethod(request.getMethod());
        ticket.setStatus(finalStatus);
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());
        ticket.setAddress(request.getAddress());
        ticket.setPhone(request.getPhone());
        ticket.setEmail(request.getEmail());
        ticket.setSample1Name(request.getSample1Name());
        ticket.setSample2Name(request.getSample2Name());
        ticket.setAppointmentDate(request.getAppointmentDate());
        
        log.info("   🎯 Ticket object created: {}", ticket);
        
        // Save ticket
        Ticket savedTicket = ticketService.save(ticket);
        
        log.info("   🎯 Final ticket ID: {}", savedTicket.getId());
        log.info("   🎯 Saved status: {}", savedTicket.getStatus());
        log.info("🔍 DEBUG: createTicketAfterPayment END - SUCCESS");
        
        return ResponseEntity.ok(savedTicket);
        
    } catch (Exception e) {
        log.error("❌ ERROR: createTicketAfterPayment", e);
        log.error("❌ Exception type: {}", e.getClass().getSimpleName());
        log.error("❌ Exception message: {}", e.getMessage());
        log.error("❌ Stack trace:", e);
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", "An unexpected error occurred while creating the ticket"));
    }
}
```

### **Requirement 2: Check Database Enum**

```sql
-- Run this in database to check enum values
SELECT unnest(enum_range(NULL::ticket_status));

-- Expected result should include:
-- PENDING
-- IN_PROGRESS
-- COMPLETED
-- CANCELLED
-- CONFIRMED
-- RECEIVED

-- If CONFIRMED or RECEIVED missing, run:
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';
```

### **Requirement 3: Check TicketStatus Enum in Java**

```java
public enum TicketStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    CONFIRMED,    // ✅ Must exist
    RECEIVED      // ✅ Must exist
}
```

### **Requirement 4: Add Request Validation**

```java
@Component
public class TicketRequestValidator {
    
    public void validate(TicketRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request.getStatus() == null) {
            errors.add("Status is required");
        } else {
            try {
                TicketStatus.valueOf(request.getStatus());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid status: " + request.getStatus());
            }
        }
        
        if (request.getType() == null) {
            errors.add("Type is required");
        } else {
            try {
                TicketType.valueOf(request.getType());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid type: " + request.getType());
            }
        }
        
        if (request.getMethod() == null) {
            errors.add("Method is required");
        } else {
            try {
                TestMethod.valueOf(request.getMethod());
            } catch (IllegalArgumentException e) {
                errors.add("Invalid method: " + request.getMethod());
            }
        }
        
        if (request.getCustomerId() == null) {
            errors.add("CustomerId is required");
        }
        
        if (request.getAmount() == null || request.getAmount() <= 0) {
            errors.add("Amount must be greater than 0");
        }
        
        if (!errors.isEmpty()) {
            throw new ValidationException("Validation failed: " + String.join(", ", errors));
        }
    }
}
```

## 🧪 **Testing Requirements**

### **Test Cases for Backend Team**

#### **Test 1: Database Enum Check**
```sql
-- Check enum values
SELECT unnest(enum_range(NULL::ticket_status));

-- Check if migration V25 ran
SELECT * FROM flyway_schema_history WHERE version = 'V25';
```

#### **Test 2: Ticket Creation with Logs**
```bash
# Test CIVIL SELF_TEST CONFIRMED
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "CIVIL",
    "method": "SELF_TEST",
    "status": "CONFIRMED",
    "reason": "Xác minh quan hệ huyết thống",
    "customerId": 1,
    "amount": 1500000
  }'
```

#### **Test 3: Check Backend Logs**
Look for these log patterns:
```
🔍 DEBUG: createTicketAfterPayment START
   User: user@example.com
   Request status: CONFIRMED
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
🔍 DEBUG: createTicketAfterPayment END - SUCCESS
```

Or error logs:
```
❌ ERROR: createTicketAfterPayment
❌ Exception type: IllegalArgumentException
❌ Exception message: No enum constant com.example.TicketStatus.CONFIRMED
```

## 📋 **Checklist for Backend Team**

### **Database:**
- [ ] Enum ticket_status có CONFIRMED và RECEIVED
- [ ] Migration V25 đã chạy thành công
- [ ] User với customerId tồn tại trong database

### **Code:**
- [ ] TicketStatus enum có CONFIRMED và RECEIVED
- [ ] Validation logic hoạt động đúng
- [ ] Error handling với try-catch
- [ ] Logging chi tiết đã thêm

### **Testing:**
- [ ] Test với CIVIL SELF_TEST CONFIRMED
- [ ] Test với các loại ticket khác
- [ ] Check logs không có exception
- [ ] Database lưu đúng status

## 🎯 **Expected Results**

### **After Fix:**
```
Backend Logs:
🔍 DEBUG: createTicketAfterPayment START
   User: user@example.com
   Request status: CONFIRMED
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123
🔍 DEBUG: createTicketAfterPayment END - SUCCESS

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED ✅

Frontend Response:
✅ Ticket created successfully!
```

## 📞 **Contact Information**

**Nếu có câu hỏi hoặc cần clarification:**
- Frontend logs đã được cung cấp
- Test script available trong `debug_500_error.js`
- Có thể test trực tiếp với Postman/cURL

**Files hỗ trợ:**
- `debug_500_error.js` - Debug script cho 500 error
- `BACKEND_500_ERROR_FIX.md` - This guide 