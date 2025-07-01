# 🔧 Backend Checklist - Ticket Creation Workflow

## 📋 **Checklist Chuẩn Backend (BE) Cho Quy Trình Tạo Ticket**

### ✅ **1. Luôn kiểm tra và log dữ liệu đầu vào**
```java
// Log toàn bộ request body khi nhận được request tạo ticket
log.info("🔍 DEBUG: createTicketAfterPayment");
log.info("   Request body: {}", request);
log.info("   Request status: {}", request.getStatus());
log.info("   Request type: {}", request.getType());
log.info("   Request method: {}", request.getMethod());
log.info("   Request customerId: {}", request.getCustomerId());
log.info("   Request amount: {}", request.getAmount());
```

### ✅ **2. Mapping DTO → Entity phải đầy đủ**
```java
// Đảm bảo trường status từ DTO (request) được map sang Entity
Ticket ticket = new Ticket();
ticket.setType(TicketType.valueOf(request.getType()));
ticket.setMethod(TestMethod.valueOf(request.getMethod()));
ticket.setReason(request.getReason());
ticket.setCustomerId(request.getCustomerId());
ticket.setAmount(request.getAmount());

// QUAN TRỌNG: Không được bỏ qua trường status
if (request.getStatus() != null) {
    ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
    log.info("   ✅ Using status from request: {}", request.getStatus());
} else {
    ticket.setStatus(TicketStatus.PENDING);
    log.info("   ⚠️ No status in request, using default: PENDING");
}
```

### ✅ **3. Enum phải đầy đủ giá trị**
```java
public enum TicketStatus {
    PENDING,        // Chờ xử lý
    IN_PROGRESS,    // Đang xử lý
    RECEIVED,       // Đã nhận kit
    CONFIRMED,      // Đã xác nhận Yêu Cầu (MỚI)
    COMPLETED,      // Đã hoàn thành
    CANCELLED,      // Đã hủy
    REJECTED        // Đã từ chối
}
```

### ✅ **4. Không hardcode status**
```java
// ❌ SAI - Không được làm như này:
// ticket.setStatus(TicketStatus.PENDING);

// ✅ ĐÚNG - Luôn ưu tiên lấy status từ request:
if (request.getStatus() != null) {
    ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
} else {
    ticket.setStatus(TicketStatus.PENDING); // Chỉ dùng mặc định khi không có
}
```

### ✅ **5. Validation hợp lý**
```java
// Validation cho status
if (request.getStatus() != null) {
    try {
        TicketStatus.valueOf(request.getStatus());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body("Status không hợp lệ: " + request.getStatus() + 
                  ". Các giá trị hợp lệ: " + Arrays.toString(TicketStatus.values()));
    }
}

// Validation cho type và method
if (request.getType() == null || request.getMethod() == null) {
    return ResponseEntity.badRequest()
        .body("Type và Method không được null");
}

// Validation cho customerId
if (request.getCustomerId() == null) {
    return ResponseEntity.badRequest()
        .body("CustomerId không được null");
}
```

### ✅ **6. Bọc toàn bộ logic trong try-catch**
```java
@PostMapping("/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, Authentication authentication) {
    try {
        // Log dữ liệu đầu vào
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        log.info("   Is CIVIL SELF_TEST: {}", 
            "CIVIL".equals(request.getType()) && "SELF_TEST".equals(request.getMethod()));

        // Validation
        if (request.getCustomerId() == null) {
            return ResponseEntity.badRequest().body("CustomerId không được null");
        }

        // Mapping và tạo ticket
        Ticket ticket = new Ticket();
        ticket.setType(TicketType.valueOf(request.getType()));
        ticket.setMethod(TestMethod.valueOf(request.getMethod()));
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());

        // QUAN TRỌNG: Xử lý status
        if (request.getStatus() != null) {
            ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
            log.info("   ✅ Using status from request: {}", request.getStatus());
        } else {
            ticket.setStatus(TicketStatus.PENDING);
            log.info("   ⚠️ No status in request, using default: PENDING");
        }

        // Lưu ticket
        Ticket saved = ticketService.saveTicket(ticket);
        
        // Log trạng thái cuối cùng
        log.info("   🎯 Final ticket status: {}", saved.getStatus());
        log.info("   🎯 Final ticket ID: {}", saved.getId());
        
        return ResponseEntity.ok(saved);
        
    } catch (IllegalArgumentException e) {
        log.error("Validation error: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body("Dữ liệu không hợp lệ: " + e.getMessage());
    } catch (Exception e) {
        log.error("Error creating ticket", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Lỗi tạo ticket: " + e.getMessage());
    }
}
```

### ✅ **7. Log trạng thái cuối cùng**
```java
// Sau khi lưu ticket, log rõ ràng trạng thái cuối cùng
Ticket saved = ticketService.saveTicket(ticket);
log.info("   🎯 Final ticket status: {}", saved.getStatus());
log.info("   🎯 Final ticket ID: {}", saved.getId());
log.info("   🎯 Final ticket type: {}", saved.getType());
log.info("   🎯 Final ticket method: {}", saved.getMethod());
```

### ✅ **8. Test lại bằng Postman/cURL**
```bash
# Test với status CONFIRMED
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

### ✅ **9. Trả về lỗi rõ ràng cho FE**
```java
// Không trả về lỗi chung chung
// ❌ SAI: return ResponseEntity.badRequest().body("Lỗi không xác định");

// ✅ ĐÚNG: Trả về message cụ thể
return ResponseEntity.badRequest().body("CustomerId không được null");
return ResponseEntity.badRequest().body("Status không hợp lệ: " + invalidStatus);
return ResponseEntity.badRequest().body("Type không hợp lệ: " + invalidType);
```

## 🧪 **Test Cases**

### **Test Case 1: CIVIL SELF_TEST với status CONFIRMED**
- **Input**: `type: "CIVIL"`, `method: "SELF_TEST"`, `status: "CONFIRMED"`
- **Expected**: Ticket được tạo với `status: "CONFIRMED"`
- **Log Expected**: 
  ```
  🔍 DEBUG: createTicketAfterPayment
     Request status: CONFIRMED
     Is CIVIL SELF_TEST: true
     ✅ Using status from request: CONFIRMED
     🎯 Final ticket status: CONFIRMED
  ```

### **Test Case 2: CIVIL SELF_TEST không có status**
- **Input**: `type: "CIVIL"`, `method: "SELF_TEST"`, `status: null`
- **Expected**: Ticket được tạo với `status: "PENDING"`
- **Log Expected**:
  ```
  ⚠️ No status in request, using default: PENDING
  🎯 Final ticket status: PENDING
  ```

### **Test Case 3: ADMINISTRATIVE AT_FACILITY**
- **Input**: `type: "ADMINISTRATIVE"`, `method: "AT_FACILITY"`, `status: "PENDING"`
- **Expected**: Ticket được tạo với `status: "PENDING"`
- **Log Expected**:
  ```
  ✅ Using status from request: PENDING
  🎯 Final ticket status: PENDING
  ```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Status vẫn là PENDING**
- **Cause**: Hardcode `ticket.setStatus(PENDING)` trong code
- **Solution**: Thay bằng logic ưu tiên status từ request

### **Issue 2: "Lỗi không xác định"**
- **Cause**: Exception không được bắt hoặc trả về message chung chung
- **Solution**: Bọc try-catch và trả về message cụ thể

### **Issue 3: Status không được lưu**
- **Cause**: Mapping DTO → Entity bỏ qua trường status
- **Solution**: Đảm bảo map đầy đủ tất cả trường

### **Issue 4: Validation reject CONFIRMED**
- **Cause**: Enum không có CONFIRMED hoặc validation sai
- **Solution**: Cập nhật enum và kiểm tra validation

## 📊 **Monitoring & Debug**

### **Log Format Chuẩn:**
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

### **Error Log Format:**
```
❌ ERROR: createTicketAfterPayment
   Request: {...}
   Error: java.lang.IllegalArgumentException: No enum constant...
   Stack trace: ...
```

## 🎯 **Kết Luận**

- **BE phải chịu trách nhiệm kiểm soát, validate, mapping và trả về lỗi rõ ràng**
- **FE chỉ cần gửi đúng dữ liệu, mọi logic nghiệp vụ và kiểm soát nằm ở BE**
- **Nếu có lỗi, BE phải log và trả về message chi tiết để FE/QA/dev dễ debug**
- **Luôn test với Postman/cURL trước khi deploy**
- **Monitor log để đảm bảo workflow hoạt động đúng** 

## 📋 **Checklist Chuẩn Backend (BE) Cho Quy Trình Tạo Ticket**

### ✅ **1. Luôn kiểm tra và log dữ liệu đầu vào**
```java
// Log toàn bộ request body khi nhận được request tạo ticket
log.info("🔍 DEBUG: createTicketAfterPayment");
log.info("   Request body: {}", request);
log.info("   Request status: {}", request.getStatus());
log.info("   Request type: {}", request.getType());
log.info("   Request method: {}", request.getMethod());
log.info("   Request customerId: {}", request.getCustomerId());
log.info("   Request amount: {}", request.getAmount());
```

### ✅ **2. Mapping DTO → Entity phải đầy đủ**
```java
// Đảm bảo trường status từ DTO (request) được map sang Entity
Ticket ticket = new Ticket();
ticket.setType(TicketType.valueOf(request.getType()));
ticket.setMethod(TestMethod.valueOf(request.getMethod()));
ticket.setReason(request.getReason());
ticket.setCustomerId(request.getCustomerId());
ticket.setAmount(request.getAmount());

// QUAN TRỌNG: Không được bỏ qua trường status
if (request.getStatus() != null) {
    ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
    log.info("   ✅ Using status from request: {}", request.getStatus());
} else {
    ticket.setStatus(TicketStatus.PENDING);
    log.info("   ⚠️ No status in request, using default: PENDING");
}
```

### ✅ **3. Enum phải đầy đủ giá trị**
```java
public enum TicketStatus {
    PENDING,        // Chờ xử lý
    IN_PROGRESS,    // Đang xử lý
    RECEIVED,       // Đã nhận kit
    CONFIRMED,      // Đã xác nhận Yêu Cầu (MỚI)
    COMPLETED,      // Đã hoàn thành
    CANCELLED,      // Đã hủy
    REJECTED        // Đã từ chối
}
```

### ✅ **4. Không hardcode status**
```java
// ❌ SAI - Không được làm như này:
// ticket.setStatus(TicketStatus.PENDING);

// ✅ ĐÚNG - Luôn ưu tiên lấy status từ request:
if (request.getStatus() != null) {
    ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
} else {
    ticket.setStatus(TicketStatus.PENDING); // Chỉ dùng mặc định khi không có
}
```

### ✅ **5. Validation hợp lý**
```java
// Validation cho status
if (request.getStatus() != null) {
    try {
        TicketStatus.valueOf(request.getStatus());
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest()
            .body("Status không hợp lệ: " + request.getStatus() + 
                  ". Các giá trị hợp lệ: " + Arrays.toString(TicketStatus.values()));
    }
}

// Validation cho type và method
if (request.getType() == null || request.getMethod() == null) {
    return ResponseEntity.badRequest()
        .body("Type và Method không được null");
}

// Validation cho customerId
if (request.getCustomerId() == null) {
    return ResponseEntity.badRequest()
        .body("CustomerId không được null");
}
```

### ✅ **6. Bọc toàn bộ logic trong try-catch**
```java
@PostMapping("/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, Authentication authentication) {
    try {
        // Log dữ liệu đầu vào
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        log.info("   Is CIVIL SELF_TEST: {}", 
            "CIVIL".equals(request.getType()) && "SELF_TEST".equals(request.getMethod()));

        // Validation
        if (request.getCustomerId() == null) {
            return ResponseEntity.badRequest().body("CustomerId không được null");
        }

        // Mapping và tạo ticket
        Ticket ticket = new Ticket();
        ticket.setType(TicketType.valueOf(request.getType()));
        ticket.setMethod(TestMethod.valueOf(request.getMethod()));
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());

        // QUAN TRỌNG: Xử lý status
        if (request.getStatus() != null) {
            ticket.setStatus(TicketStatus.valueOf(request.getStatus()));
            log.info("   ✅ Using status from request: {}", request.getStatus());
        } else {
            ticket.setStatus(TicketStatus.PENDING);
            log.info("   ⚠️ No status in request, using default: PENDING");
        }

        // Lưu ticket
        Ticket saved = ticketService.saveTicket(ticket);
        
        // Log trạng thái cuối cùng
        log.info("   🎯 Final ticket status: {}", saved.getStatus());
        log.info("   🎯 Final ticket ID: {}", saved.getId());
        
        return ResponseEntity.ok(saved);
        
    } catch (IllegalArgumentException e) {
        log.error("Validation error: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body("Dữ liệu không hợp lệ: " + e.getMessage());
    } catch (Exception e) {
        log.error("Error creating ticket", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Lỗi tạo ticket: " + e.getMessage());
    }
}
```

### ✅ **7. Log trạng thái cuối cùng**
```java
// Sau khi lưu ticket, log rõ ràng trạng thái cuối cùng
Ticket saved = ticketService.saveTicket(ticket);
log.info("   🎯 Final ticket status: {}", saved.getStatus());
log.info("   🎯 Final ticket ID: {}", saved.getId());
log.info("   🎯 Final ticket type: {}", saved.getType());
log.info("   🎯 Final ticket method: {}", saved.getMethod());
```

### ✅ **8. Test lại bằng Postman/cURL**
```bash
# Test với status CONFIRMED
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

### ✅ **9. Trả về lỗi rõ ràng cho FE**
```java
// Không trả về lỗi chung chung
// ❌ SAI: return ResponseEntity.badRequest().body("Lỗi không xác định");

// ✅ ĐÚNG: Trả về message cụ thể
return ResponseEntity.badRequest().body("CustomerId không được null");
return ResponseEntity.badRequest().body("Status không hợp lệ: " + invalidStatus);
return ResponseEntity.badRequest().body("Type không hợp lệ: " + invalidType);
```

## 🧪 **Test Cases**

### **Test Case 1: CIVIL SELF_TEST với status CONFIRMED**
- **Input**: `type: "CIVIL"`, `method: "SELF_TEST"`, `status: "CONFIRMED"`
- **Expected**: Ticket được tạo với `status: "CONFIRMED"`
- **Log Expected**: 
  ```
  🔍 DEBUG: createTicketAfterPayment
     Request status: CONFIRMED
     Is CIVIL SELF_TEST: true
     ✅ Using status from request: CONFIRMED
     🎯 Final ticket status: CONFIRMED
  ```

### **Test Case 2: CIVIL SELF_TEST không có status**
- **Input**: `type: "CIVIL"`, `method: "SELF_TEST"`, `status: null`
- **Expected**: Ticket được tạo với `status: "PENDING"`
- **Log Expected**:
  ```
  ⚠️ No status in request, using default: PENDING
  🎯 Final ticket status: PENDING
  ```

### **Test Case 3: ADMINISTRATIVE AT_FACILITY**
- **Input**: `type: "ADMINISTRATIVE"`, `method: "AT_FACILITY"`, `status: "PENDING"`
- **Expected**: Ticket được tạo với `status: "PENDING"`
- **Log Expected**:
  ```
  ✅ Using status from request: PENDING
  🎯 Final ticket status: PENDING
  ```

## 🚨 **Common Issues & Solutions**

### **Issue 1: Status vẫn là PENDING**
- **Cause**: Hardcode `ticket.setStatus(PENDING)` trong code
- **Solution**: Thay bằng logic ưu tiên status từ request

### **Issue 2: "Lỗi không xác định"**
- **Cause**: Exception không được bắt hoặc trả về message chung chung
- **Solution**: Bọc try-catch và trả về message cụ thể

### **Issue 3: Status không được lưu**
- **Cause**: Mapping DTO → Entity bỏ qua trường status
- **Solution**: Đảm bảo map đầy đủ tất cả trường

### **Issue 4: Validation reject CONFIRMED**
- **Cause**: Enum không có CONFIRMED hoặc validation sai
- **Solution**: Cập nhật enum và kiểm tra validation

## 📊 **Monitoring & Debug**

### **Log Format Chuẩn:**
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

### **Error Log Format:**
```
❌ ERROR: createTicketAfterPayment
   Request: {...}
   Error: java.lang.IllegalArgumentException: No enum constant...
   Stack trace: ...
```

## 🎯 **Kết Luận**

- **BE phải chịu trách nhiệm kiểm soát, validate, mapping và trả về lỗi rõ ràng**
- **FE chỉ cần gửi đúng dữ liệu, mọi logic nghiệp vụ và kiểm soát nằm ở BE**
- **Nếu có lỗi, BE phải log và trả về message chi tiết để FE/QA/dev dễ debug**
- **Luôn test với Postman/cURL trước khi deploy**
- **Monitor log để đảm bảo workflow hoạt động đúng** 