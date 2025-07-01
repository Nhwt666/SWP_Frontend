# 🔧 **Backend Requirements - Ticket Status Fix & 403 Error Resolution**

## 📋 **Tổng Quan**

Frontend đang gặp lỗi **403 Forbidden** khi tạo ticket với status **CONFIRMED** cho CIVIL SELF_TEST tickets. Cần backend team hỗ trợ để:

1. **Fix 403 Error** - Authentication/Authorization issue
2. **Fix Ticket Status** - Ensure CONFIRMED status được lưu đúng
3. **Add Debug Logs** - Better error tracking

## 🚨 **Vấn đề hiện tại**

### **1. 403 Forbidden Error**
```
Frontend Request:
POST /tickets/after-payment
Headers: Authorization: Bearer <token>
Body: {
  "type": "CIVIL",
  "method": "SELF_TEST", 
  "status": "CONFIRMED",
  "reason": "Xác minh quan hệ huyết thống",
  "customerId": 1,
  "amount": 1500000
}

Response: 403 Forbidden
```

### **2. Ticket Status Issue**
- Frontend gửi `status: "CONFIRMED"` cho CIVIL SELF_TEST
- Backend có thể hardcode `PENDING` thay vì dùng status từ request
- Database lưu `PENDING` thay vì `CONFIRMED`

## 🔧 **Yêu cầu Backend**

### **Requirement 1: Fix 403 Authentication Error**

#### **1.1 Kiểm tra JWT Token Validation**
```java
// Kiểm tra JWT filter configuration
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/tickets/after-payment").hasAnyRole("MEMBER", "ADMIN", "STAFF")
                // Đảm bảo endpoint này cho phép MEMBER role
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

#### **1.2 Kiểm tra User Role Permissions**
```java
// Kiểm tra user có quyền tạo ticket
@RestController
public class TicketController {
    
    @PostMapping("/tickets/after-payment")
    public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        
        // Debug log
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   User: {}", userDetails.getUsername());
        log.info("   Roles: {}", userDetails.getAuthorities());
        log.info("   Request status: {}", request.getStatus());
        
        // Kiểm tra user role
        if (!hasPermissionToCreateTicket(userDetails)) {
            log.error("❌ User {} does not have permission to create tickets", userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Access denied", "Insufficient permissions"));
        }
        
        // Continue with ticket creation...
    }
    
    private boolean hasPermissionToCreateTicket(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_MEMBER") || 
                             auth.getAuthority().equals("ROLE_ADMIN") ||
                             auth.getAuthority().equals("ROLE_STAFF"));
    }
}
```

#### **1.3 Kiểm tra CORS Configuration**
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### **Requirement 2: Fix Ticket Status Handling**

#### **2.1 Update /tickets/after-payment Endpoint**
```java
@PostMapping("/tickets/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
    
    try {
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        
        // Validate request
        if (request.getStatus() == null) {
            log.error("❌ Status is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Status is required"));
        }
        
        // Check if it's CIVIL SELF_TEST
        boolean isCivilSelfTest = "CIVIL".equals(request.getType()) && 
                                 "SELF_TEST".equals(request.getMethod());
        
        log.info("   Is CIVIL SELF_TEST: {}", isCivilSelfTest);
        
        // Use status from request instead of hardcoding
        TicketStatus finalStatus;
        if (isCivilSelfTest && "CONFIRMED".equals(request.getStatus())) {
            finalStatus = TicketStatus.CONFIRMED;
            log.info("   ✅ Using status from request: CONFIRMED");
        } else {
            finalStatus = TicketStatus.PENDING; // Default for other cases
            log.info("   ✅ Using default status: PENDING");
        }
        
        log.info("   🎯 Final ticket status: {}", finalStatus);
        
        // Create ticket with correct status
        Ticket ticket = new Ticket();
        ticket.setType(request.getType());
        ticket.setMethod(request.getMethod());
        ticket.setStatus(finalStatus); // Use finalStatus, not hardcoded PENDING
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());
        // ... set other fields
        
        Ticket savedTicket = ticketService.save(ticket);
        
        log.info("   🎯 Final ticket ID: {}", savedTicket.getId());
        log.info("   🎯 Saved status: {}", savedTicket.getStatus());
        
        return ResponseEntity.ok(savedTicket);
        
    } catch (Exception e) {
        log.error("❌ ERROR: createTicketAfterPayment", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", e.getMessage()));
    }
}
```

#### **2.2 Update TicketStatus Enum**
```java
public enum TicketStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    CONFIRMED,    // ✅ Đảm bảo có CONFIRMED
    RECEIVED      // ✅ Đảm bảo có RECEIVED
}
```

#### **2.3 Update Database Migration**
```sql
-- Migration V24: Add CONFIRMED and RECEIVED status
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';

-- Verify enum values
SELECT unnest(enum_range(NULL::ticket_status));
```

### **Requirement 3: Add Comprehensive Error Handling**

#### **3.1 Global Exception Handler**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        log.error("❌ Access denied: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("Access denied", "Insufficient permissions"));
    }
    
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException e) {
        log.error("❌ JWT error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("Authentication failed", "Invalid or expired token"));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        log.error("❌ Validation error: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Validation failed", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("❌ Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", "An unexpected error occurred"));
    }
}
```

#### **3.2 Error Response DTO**
```java
public class ErrorResponse {
    private String message;
    private String error;
    private String timestamp;
    
    public ErrorResponse(String message, String error) {
        this.message = message;
        this.error = error;
        this.timestamp = LocalDateTime.now().toString();
    }
    
    // Getters and setters
}
```

### **Requirement 4: Add Debug Logging**

#### **4.1 Logging Configuration**
```yaml
# application.yml
logging:
  level:
    com.yourpackage.ticket: DEBUG
    org.springframework.security: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

#### **4.2 Request/Response Logging**
```java
@Component
public class RequestLoggingFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // Log request
        log.info("🌐 {} {} - Authorization: {}", 
            httpRequest.getMethod(), 
            httpRequest.getRequestURI(),
            httpRequest.getHeader("Authorization") != null ? "Present" : "Missing");
        
        chain.doFilter(request, response);
        
        // Log response
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        log.info("📊 Response: {} {}", httpResponse.getStatus(), httpResponse.getStatusMessage());
    }
}
```

## 🧪 **Testing Requirements**

### **Test Cases for Backend Team**

#### **Test 1: Authentication**
```bash
# Test without token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 401 Unauthorized

# Test with invalid token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 401 Unauthorized

# Test with valid token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 200 OK with CONFIRMED status
```

#### **Test 2: Status Handling**
```bash
# Test CIVIL SELF_TEST with CONFIRMED
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
# Expected: Status in database = CONFIRMED

# Test other types with PENDING
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "ADMINISTRATIVE",
    "method": "AT_FACILITY",
    "status": "PENDING",
    "reason": "Xác minh danh tính",
    "customerId": 1,
    "amount": 1300000
  }'
# Expected: Status in database = PENDING
```

#### **Test 3: Database Verification**
```sql
-- Check recent tickets
SELECT id, type, method, status, created_at 
FROM tickets 
WHERE type = 'CIVIL' AND method = 'SELF_TEST' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check enum values
SELECT unnest(enum_range(NULL::ticket_status));
```

## 📋 **Checklist for Backend Team**

### **Authentication & Authorization:**
- [ ] JWT filter configuration allows MEMBER role for `/tickets/after-payment`
- [ ] User role validation working correctly
- [ ] CORS configuration allows frontend requests
- [ ] Token validation and expiration handling

### **Ticket Status Handling:**
- [ ] `/tickets/after-payment` endpoint uses status from request
- [ ] CIVIL SELF_TEST tickets saved with CONFIRMED status
- [ ] Other tickets saved with PENDING status
- [ ] TicketStatus enum includes CONFIRMED and RECEIVED
- [ ] Database migration V24 applied

### **Error Handling:**
- [ ] Global exception handler implemented
- [ ] Detailed error messages returned
- [ ] Proper HTTP status codes used
- [ ] Security exceptions handled correctly

### **Logging:**
- [ ] Debug logs added to ticket creation
- [ ] Request/response logging enabled
- [ ] Error logging with stack traces
- [ ] Authentication logging

### **Testing:**
- [ ] All test cases pass
- [ ] Database verification shows correct statuses
- [ ] Authentication tests pass
- [ ] Error scenarios handled correctly

## 🎯 **Expected Results**

### **After Backend Fix:**
```
Backend Logs:
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   Request type: CIVIL
   Request method: SELF_TEST
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED ✅

Frontend Response:
✅ Ticket created successfully!
```

## 📞 **Contact Information**

**Nếu có câu hỏi hoặc cần clarification:**
- Frontend logs và error details đã được cung cấp
- Test scripts available trong files đã tạo
- Có thể test trực tiếp với Postman/cURL

**Files hỗ trợ:**
- `test_backend_403.js` - Test script cho 403 error
- `check_token.js` - Token validation script
- `DEBUG_403_ERROR.md` - Debug guide chi tiết 

## 📋 **Tổng Quan**

Frontend đang gặp lỗi **403 Forbidden** khi tạo ticket với status **CONFIRMED** cho CIVIL SELF_TEST tickets. Cần backend team hỗ trợ để:

1. **Fix 403 Error** - Authentication/Authorization issue
2. **Fix Ticket Status** - Ensure CONFIRMED status được lưu đúng
3. **Add Debug Logs** - Better error tracking

## 🚨 **Vấn đề hiện tại**

### **1. 403 Forbidden Error**
```
Frontend Request:
POST /tickets/after-payment
Headers: Authorization: Bearer <token>
Body: {
  "type": "CIVIL",
  "method": "SELF_TEST", 
  "status": "CONFIRMED",
  "reason": "Xác minh quan hệ huyết thống",
  "customerId": 1,
  "amount": 1500000
}

Response: 403 Forbidden
```

### **2. Ticket Status Issue**
- Frontend gửi `status: "CONFIRMED"` cho CIVIL SELF_TEST
- Backend có thể hardcode `PENDING` thay vì dùng status từ request
- Database lưu `PENDING` thay vì `CONFIRMED`

## 🔧 **Yêu cầu Backend**

### **Requirement 1: Fix 403 Authentication Error**

#### **1.1 Kiểm tra JWT Token Validation**
```java
// Kiểm tra JWT filter configuration
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/tickets/after-payment").hasAnyRole("MEMBER", "ADMIN", "STAFF")
                // Đảm bảo endpoint này cho phép MEMBER role
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
```

#### **1.2 Kiểm tra User Role Permissions**
```java
// Kiểm tra user có quyền tạo ticket
@RestController
public class TicketController {
    
    @PostMapping("/tickets/after-payment")
    public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        
        // Debug log
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   User: {}", userDetails.getUsername());
        log.info("   Roles: {}", userDetails.getAuthorities());
        log.info("   Request status: {}", request.getStatus());
        
        // Kiểm tra user role
        if (!hasPermissionToCreateTicket(userDetails)) {
            log.error("❌ User {} does not have permission to create tickets", userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Access denied", "Insufficient permissions"));
        }
        
        // Continue with ticket creation...
    }
    
    private boolean hasPermissionToCreateTicket(UserDetails userDetails) {
        return userDetails.getAuthorities().stream()
            .anyMatch(auth -> auth.getAuthority().equals("ROLE_MEMBER") || 
                             auth.getAuthority().equals("ROLE_ADMIN") ||
                             auth.getAuthority().equals("ROLE_STAFF"));
    }
}
```

#### **1.3 Kiểm tra CORS Configuration**
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### **Requirement 2: Fix Ticket Status Handling**

#### **2.1 Update /tickets/after-payment Endpoint**
```java
@PostMapping("/tickets/after-payment")
public ResponseEntity<?> createTicketAfterPayment(@RequestBody TicketRequest request, 
                                                 @AuthenticationPrincipal UserDetails userDetails) {
    
    try {
        log.info("🔍 DEBUG: createTicketAfterPayment");
        log.info("   Request status: {}", request.getStatus());
        log.info("   Request type: {}", request.getType());
        log.info("   Request method: {}", request.getMethod());
        
        // Validate request
        if (request.getStatus() == null) {
            log.error("❌ Status is null in request");
            return ResponseEntity.badRequest()
                .body(new ErrorResponse("Validation failed", "Status is required"));
        }
        
        // Check if it's CIVIL SELF_TEST
        boolean isCivilSelfTest = "CIVIL".equals(request.getType()) && 
                                 "SELF_TEST".equals(request.getMethod());
        
        log.info("   Is CIVIL SELF_TEST: {}", isCivilSelfTest);
        
        // Use status from request instead of hardcoding
        TicketStatus finalStatus;
        if (isCivilSelfTest && "CONFIRMED".equals(request.getStatus())) {
            finalStatus = TicketStatus.CONFIRMED;
            log.info("   ✅ Using status from request: CONFIRMED");
        } else {
            finalStatus = TicketStatus.PENDING; // Default for other cases
            log.info("   ✅ Using default status: PENDING");
        }
        
        log.info("   🎯 Final ticket status: {}", finalStatus);
        
        // Create ticket with correct status
        Ticket ticket = new Ticket();
        ticket.setType(request.getType());
        ticket.setMethod(request.getMethod());
        ticket.setStatus(finalStatus); // Use finalStatus, not hardcoded PENDING
        ticket.setReason(request.getReason());
        ticket.setCustomerId(request.getCustomerId());
        ticket.setAmount(request.getAmount());
        // ... set other fields
        
        Ticket savedTicket = ticketService.save(ticket);
        
        log.info("   🎯 Final ticket ID: {}", savedTicket.getId());
        log.info("   🎯 Saved status: {}", savedTicket.getStatus());
        
        return ResponseEntity.ok(savedTicket);
        
    } catch (Exception e) {
        log.error("❌ ERROR: createTicketAfterPayment", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", e.getMessage()));
    }
}
```

#### **2.2 Update TicketStatus Enum**
```java
public enum TicketStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    CONFIRMED,    // ✅ Đảm bảo có CONFIRMED
    RECEIVED      // ✅ Đảm bảo có RECEIVED
}
```

#### **2.3 Update Database Migration**
```sql
-- Migration V24: Add CONFIRMED and RECEIVED status
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'CONFIRMED';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'RECEIVED';

-- Verify enum values
SELECT unnest(enum_range(NULL::ticket_status));
```

### **Requirement 3: Add Comprehensive Error Handling**

#### **3.1 Global Exception Handler**
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException e) {
        log.error("❌ Access denied: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(new ErrorResponse("Access denied", "Insufficient permissions"));
    }
    
    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorResponse> handleJwtException(JwtException e) {
        log.error("❌ JWT error: {}", e.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(new ErrorResponse("Authentication failed", "Invalid or expired token"));
    }
    
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ErrorResponse> handleValidation(ValidationException e) {
        log.error("❌ Validation error: {}", e.getMessage());
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("Validation failed", e.getMessage()));
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception e) {
        log.error("❌ Unexpected error: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(new ErrorResponse("Internal server error", "An unexpected error occurred"));
    }
}
```

#### **3.2 Error Response DTO**
```java
public class ErrorResponse {
    private String message;
    private String error;
    private String timestamp;
    
    public ErrorResponse(String message, String error) {
        this.message = message;
        this.error = error;
        this.timestamp = LocalDateTime.now().toString();
    }
    
    // Getters and setters
}
```

### **Requirement 4: Add Debug Logging**

#### **4.1 Logging Configuration**
```yaml
# application.yml
logging:
  level:
    com.yourpackage.ticket: DEBUG
    org.springframework.security: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
```

#### **4.2 Request/Response Logging**
```java
@Component
public class RequestLoggingFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        // Log request
        log.info("🌐 {} {} - Authorization: {}", 
            httpRequest.getMethod(), 
            httpRequest.getRequestURI(),
            httpRequest.getHeader("Authorization") != null ? "Present" : "Missing");
        
        chain.doFilter(request, response);
        
        // Log response
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        log.info("📊 Response: {} {}", httpResponse.getStatus(), httpResponse.getStatusMessage());
    }
}
```

## 🧪 **Testing Requirements**

### **Test Cases for Backend Team**

#### **Test 1: Authentication**
```bash
# Test without token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 401 Unauthorized

# Test with invalid token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid_token" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 401 Unauthorized

# Test with valid token
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VALID_TOKEN" \
  -d '{"type":"CIVIL","method":"SELF_TEST","status":"CONFIRMED"}'
# Expected: 200 OK with CONFIRMED status
```

#### **Test 2: Status Handling**
```bash
# Test CIVIL SELF_TEST with CONFIRMED
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
# Expected: Status in database = CONFIRMED

# Test other types with PENDING
curl -X POST http://localhost:8080/tickets/after-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "ADMINISTRATIVE",
    "method": "AT_FACILITY",
    "status": "PENDING",
    "reason": "Xác minh danh tính",
    "customerId": 1,
    "amount": 1300000
  }'
# Expected: Status in database = PENDING
```

#### **Test 3: Database Verification**
```sql
-- Check recent tickets
SELECT id, type, method, status, created_at 
FROM tickets 
WHERE type = 'CIVIL' AND method = 'SELF_TEST' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check enum values
SELECT unnest(enum_range(NULL::ticket_status));
```

## 📋 **Checklist for Backend Team**

### **Authentication & Authorization:**
- [ ] JWT filter configuration allows MEMBER role for `/tickets/after-payment`
- [ ] User role validation working correctly
- [ ] CORS configuration allows frontend requests
- [ ] Token validation and expiration handling

### **Ticket Status Handling:**
- [ ] `/tickets/after-payment` endpoint uses status from request
- [ ] CIVIL SELF_TEST tickets saved with CONFIRMED status
- [ ] Other tickets saved with PENDING status
- [ ] TicketStatus enum includes CONFIRMED and RECEIVED
- [ ] Database migration V24 applied

### **Error Handling:**
- [ ] Global exception handler implemented
- [ ] Detailed error messages returned
- [ ] Proper HTTP status codes used
- [ ] Security exceptions handled correctly

### **Logging:**
- [ ] Debug logs added to ticket creation
- [ ] Request/response logging enabled
- [ ] Error logging with stack traces
- [ ] Authentication logging

### **Testing:**
- [ ] All test cases pass
- [ ] Database verification shows correct statuses
- [ ] Authentication tests pass
- [ ] Error scenarios handled correctly

## 🎯 **Expected Results**

### **After Backend Fix:**
```
Backend Logs:
🔍 DEBUG: createTicketAfterPayment
   Request status: CONFIRMED
   Request type: CIVIL
   Request method: SELF_TEST
   Is CIVIL SELF_TEST: true
   ✅ Using status from request: CONFIRMED
   🎯 Final ticket status: CONFIRMED
   🎯 Final ticket ID: 123

Database:
SELECT status FROM tickets WHERE id = 123;
-- Result: CONFIRMED ✅

Frontend Response:
✅ Ticket created successfully!
```

## 📞 **Contact Information**

**Nếu có câu hỏi hoặc cần clarification:**
- Frontend logs và error details đã được cung cấp
- Test scripts available trong files đã tạo
- Có thể test trực tiếp với Postman/cURL

**Files hỗ trợ:**
- `test_backend_403.js` - Test script cho 403 error
- `check_token.js` - Token validation script
- `DEBUG_403_ERROR.md` - Debug guide chi tiết 