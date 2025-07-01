# Backend Debug Endpoint Guide

## Add Debug Endpoint to Test Ticket Creation

### 1. Add Debug Controller Method

```java
@RestController
@RequestMapping("/debug")
public class DebugController {
    
    @Autowired
    private TicketService ticketService;
    
    @PostMapping("/test-ticket-creation")
    public ResponseEntity<?> testTicketCreation(@RequestBody TicketCreateRequest request) {
        try {
            log.info("=== DEBUG TICKET CREATION ===");
            log.info("Request: {}", request);
            log.info("Status: {}", request.getStatus());
            log.info("Type: {}", request.getType());
            log.info("Method: {}", request.getMethod());
            
            // Validate enum values
            try {
                TicketStatus status = TicketStatus.valueOf(request.getStatus());
                log.info("Status enum valid: {}", status);
            } catch (IllegalArgumentException e) {
                log.error("Invalid status enum: {}", request.getStatus());
                return ResponseEntity.badRequest().body("Invalid status: " + request.getStatus());
            }
            
            try {
                TicketType type = TicketType.valueOf(request.getType());
                log.info("Type enum valid: {}", type);
            } catch (IllegalArgumentException e) {
                log.error("Invalid type enum: {}", request.getType());
                return ResponseEntity.badRequest().body("Invalid type: " + request.getType());
            }
            
            try {
                TicketMethod method = TicketMethod.valueOf(request.getMethod());
                log.info("Method enum valid: {}", method);
            } catch (IllegalArgumentException e) {
                log.error("Invalid method enum: {}", request.getMethod());
                return ResponseEntity.badRequest().body("Invalid method: " + request.getMethod());
            }
            
            // Test database connection
            log.info("Testing database connection...");
            
            // Test ticket creation
            log.info("Creating ticket...");
            Ticket ticket = ticketService.createTicket(request);
            log.info("Ticket created successfully: {}", ticket.getId());
            
            return ResponseEntity.ok(ticket);
            
        } catch (Exception e) {
            log.error("Error in debug endpoint", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error",
                "message", e.getMessage(),
                "stackTrace", e.getStackTrace()
            ));
        }
    }
    
    @GetMapping("/enums")
    public ResponseEntity<?> getEnums() {
        return ResponseEntity.ok(Map.of(
            "statuses", Arrays.stream(TicketStatus.values()).map(Enum::name).collect(Collectors.toList()),
            "types", Arrays.stream(TicketType.values()).map(Enum::name).collect(Collectors.toList()),
            "methods", Arrays.stream(TicketMethod.values()).map(Enum::name).collect(Collectors.toList())
        ));
    }
}
```

### 2. Test Debug Endpoint

```bash
# Test enum values
curl http://localhost:8080/debug/enums

# Test ticket creation
curl -X POST http://localhost:8080/debug/test-ticket-creation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CIVIL",
    "method": "SELF_TEST", 
    "status": "CONFIRMED",
    "reason": "Test",
    "customerId": 1,
    "amount": 1500000
  }'
```

### 3. Check Database Constraints

```sql
-- Check ticket table constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'tickets' 
    AND tc.constraint_type = 'CHECK';

-- Check enum values in database
SELECT DISTINCT status FROM tickets;
```

### 4. Common Issues to Check

1. **Enum Values**: Ensure CONFIRMED exists in TicketStatus enum
2. **Database Constraints**: Check if database accepts CONFIRMED status
3. **Validation Logic**: Review any business logic validation
4. **Required Fields**: Ensure all required fields are provided
5. **Foreign Keys**: Check customerId exists in users table
6. **Transaction Issues**: Check for transaction rollback issues

### 5. Logging Configuration

Add to application.properties:
```properties
# Enable debug logging
logging.level.com.yourpackage=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
``` 

## Add Debug Endpoint to Test Ticket Creation

### 1. Add Debug Controller Method

```java
@RestController
@RequestMapping("/debug")
public class DebugController {
    
    @Autowired
    private TicketService ticketService;
    
    @PostMapping("/test-ticket-creation")
    public ResponseEntity<?> testTicketCreation(@RequestBody TicketCreateRequest request) {
        try {
            log.info("=== DEBUG TICKET CREATION ===");
            log.info("Request: {}", request);
            log.info("Status: {}", request.getStatus());
            log.info("Type: {}", request.getType());
            log.info("Method: {}", request.getMethod());
            
            // Validate enum values
            try {
                TicketStatus status = TicketStatus.valueOf(request.getStatus());
                log.info("Status enum valid: {}", status);
            } catch (IllegalArgumentException e) {
                log.error("Invalid status enum: {}", request.getStatus());
                return ResponseEntity.badRequest().body("Invalid status: " + request.getStatus());
            }
            
            try {
                TicketType type = TicketType.valueOf(request.getType());
                log.info("Type enum valid: {}", type);
            } catch (IllegalArgumentException e) {
                log.error("Invalid type enum: {}", request.getType());
                return ResponseEntity.badRequest().body("Invalid type: " + request.getType());
            }
            
            try {
                TicketMethod method = TicketMethod.valueOf(request.getMethod());
                log.info("Method enum valid: {}", method);
            } catch (IllegalArgumentException e) {
                log.error("Invalid method enum: {}", request.getMethod());
                return ResponseEntity.badRequest().body("Invalid method: " + request.getMethod());
            }
            
            // Test database connection
            log.info("Testing database connection...");
            
            // Test ticket creation
            log.info("Creating ticket...");
            Ticket ticket = ticketService.createTicket(request);
            log.info("Ticket created successfully: {}", ticket.getId());
            
            return ResponseEntity.ok(ticket);
            
        } catch (Exception e) {
            log.error("Error in debug endpoint", e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Internal server error",
                "message", e.getMessage(),
                "stackTrace", e.getStackTrace()
            ));
        }
    }
    
    @GetMapping("/enums")
    public ResponseEntity<?> getEnums() {
        return ResponseEntity.ok(Map.of(
            "statuses", Arrays.stream(TicketStatus.values()).map(Enum::name).collect(Collectors.toList()),
            "types", Arrays.stream(TicketType.values()).map(Enum::name).collect(Collectors.toList()),
            "methods", Arrays.stream(TicketMethod.values()).map(Enum::name).collect(Collectors.toList())
        ));
    }
}
```

### 2. Test Debug Endpoint

```bash
# Test enum values
curl http://localhost:8080/debug/enums

# Test ticket creation
curl -X POST http://localhost:8080/debug/test-ticket-creation \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CIVIL",
    "method": "SELF_TEST", 
    "status": "CONFIRMED",
    "reason": "Test",
    "customerId": 1,
    "amount": 1500000
  }'
```

### 3. Check Database Constraints

```sql
-- Check ticket table constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'tickets' 
    AND tc.constraint_type = 'CHECK';

-- Check enum values in database
SELECT DISTINCT status FROM tickets;
```

### 4. Common Issues to Check

1. **Enum Values**: Ensure CONFIRMED exists in TicketStatus enum
2. **Database Constraints**: Check if database accepts CONFIRMED status
3. **Validation Logic**: Review any business logic validation
4. **Required Fields**: Ensure all required fields are provided
5. **Foreign Keys**: Check customerId exists in users table
6. **Transaction Issues**: Check for transaction rollback issues

### 5. Logging Configuration

Add to application.properties:
```properties
# Enable debug logging
logging.level.com.yourpackage=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
``` 