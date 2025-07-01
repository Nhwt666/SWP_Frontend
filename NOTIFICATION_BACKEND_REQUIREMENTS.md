# 🔔 Notification System - Backend Requirements

## 📋 **Overview**

Hệ thống notification với timeout 3 ngày và logic xóa thông báo cũ khi có trạng thái mới.

## 🗄️ **Database Schema**

### **Notification Entity**
```java
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type; // INFO, WARNING, ERROR
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "ticket_id")
    private Long ticketId;
    
    @Column(name = "is_read", nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean isRead = false;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt; // 3 ngày sau khi tạo
    
    @Column(name = "status_change", columnDefinition = "JSON")
    private String statusChange; // JSON: {"from": "PENDING", "to": "IN_PROGRESS"}
    
    // Getters, setters, constructors...
}
```

### **NotificationType Enum**
```java
public enum NotificationType {
    INFO, WARNING, ERROR
}
```

## 🔧 **API Endpoints**

### **1. Tạo Notification**
```http
POST /notifications
Authorization: Bearer {token}
Content-Type: application/json

{
    "message": "Ticket #123 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'",
    "type": "INFO",
    "ticketId": 123,
    "statusChange": {
        "from": "PENDING",
        "to": "IN_PROGRESS"
    }
}
```

**Response:**
```json
{
    "id": 1,
    "message": "Ticket #123 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'",
    "type": "INFO",
    "ticketId": 123,
    "isRead": false,
    "createdAt": "2024-01-15T10:30:00",
    "expiresAt": "2024-01-18T10:30:00",
    "statusChange": {
        "from": "PENDING",
        "to": "IN_PROGRESS"
    }
}
```

### **2. Lấy Danh Sách Notification**
```http
GET /notifications
Authorization: Bearer {token}
```

**Response:**
```json
[
    {
        "id": 1,
        "message": "Ticket #123 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'",
        "type": "INFO",
        "ticketId": 123,
        "isRead": false,
        "createdAt": "2024-01-15T10:30:00",
        "expiresAt": "2024-01-18T10:30:00"
    }
]
```

### **3. Đánh Dấu Đã Đọc**
```http
PUT /notifications/{id}/read
Authorization: Bearer {token}
```

### **4. Đánh Dấu Tất Cả Đã Đọc**
```http
POST /notifications/mark-all-read
Authorization: Bearer {token}
```

### **5. Xóa Notification Cũ Cho Ticket**
```http
DELETE /notifications/ticket/{ticketId}/delete-old
Authorization: Bearer {token}
Content-Type: application/json

{
    "newStatus": "IN_PROGRESS"
}
```

### **6. Xóa Notification Hết Hạn**
```http
DELETE /notifications/cleanup-expired
Authorization: Bearer {token}
```

## 🎯 **Business Logic**

### **1. Tự Động Tạo Notification Khi Thay Đổi Trạng Thái**

**Trong TicketService:**
```java
@Service
public class TicketService {
    
    @Autowired
    private NotificationService notificationService;
    
    public Ticket updateStatus(Long ticketId, TicketStatus newStatus) {
        Ticket ticket = ticketRepository.findById(ticketId)
            .orElseThrow(() -> new TicketNotFoundException("Ticket not found"));
        
        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(newStatus);
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Tạo notification cho thay đổi trạng thái
        createStatusChangeNotification(ticket, oldStatus, newStatus);
        
        return savedTicket;
    }
    
    private void createStatusChangeNotification(Ticket ticket, TicketStatus oldStatus, TicketStatus newStatus) {
        String message = String.format(
            "Ticket #%d của %s đã chuyển từ '%s' sang '%s'",
            ticket.getId(),
            ticket.getCustomer().getFullName(),
            getStatusDisplayName(oldStatus),
            getStatusDisplayName(newStatus)
        );
        
        // Xóa notification cũ trước khi tạo mới
        notificationService.deleteOldNotifications(ticket.getId(), newStatus);
        
        // Tạo notification mới
        Notification notification = new Notification();
        notification.setMessage(message);
        notification.setType(NotificationType.INFO);
        notification.setUserId(ticket.getCustomerId());
        notification.setTicketId(ticket.getId());
        notification.setCreatedAt(LocalDateTime.now());
        notification.setExpiresAt(LocalDateTime.now().plusDays(3)); // 3 ngày
        notification.setStatusChange(String.format(
            "{\"from\": \"%s\", \"to\": \"%s\"}", 
            oldStatus.name(), 
            newStatus.name()
        ));
        
        notificationService.save(notification);
    }
    
    private String getStatusDisplayName(TicketStatus status) {
        switch (status) {
            case PENDING: return "Chờ xử lý";
            case IN_PROGRESS: return "Đang xử lý";
            case RECEIVED: return "Đã nhận kit";
            case CONFIRMED: return "Đã xác nhận Yêu Cầu";
            case COMPLETED: return "Hoàn thành";
            case REJECTED: return "Đã từ chối";
            default: return status.name();
        }
    }
}
```

### **2. Xóa Notification Cũ**

**Trong NotificationService:**
```java
@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public void deleteOldNotifications(Long ticketId, TicketStatus newStatus) {
        // Xóa tất cả notification cũ của ticket này
        List<Notification> oldNotifications = notificationRepository
            .findByTicketIdAndIsReadFalse(ticketId);
        
        notificationRepository.deleteAll(oldNotifications);
        
        log.info("Đã xóa {} notification cũ cho ticket #{}", 
                oldNotifications.size(), ticketId);
    }
    
    public void cleanupExpiredNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<Notification> expiredNotifications = notificationRepository
            .findByExpiresAtBefore(now);
        
        notificationRepository.deleteAll(expiredNotifications);
        
        log.info("Đã xóa {} notification hết hạn", expiredNotifications.size());
    }
}
```

### **3. Cron Job Xóa Notification Hết Hạn**

**Trong NotificationController:**
```java
@RestController
@RequestMapping("/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // Cron job chạy mỗi giờ để xóa notification hết hạn
    @Scheduled(fixedRate = 3600000) // 1 giờ
    public void cleanupExpiredNotifications() {
        notificationService.cleanupExpiredNotifications();
    }
}
```

## 🔄 **Workflow Examples**

### **Example 1: PENDING → IN_PROGRESS**
```
1. Staff nhận ticket PENDING
2. Backend cập nhật status: PENDING → IN_PROGRESS
3. Xóa notification cũ (nếu có)
4. Tạo notification mới: "Ticket #123 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'"
5. Notification có expiresAt = now + 3 ngày
```

### **Example 2: IN_PROGRESS → COMPLETED**
```
1. Staff hoàn thành ticket IN_PROGRESS
2. Backend cập nhật status: IN_PROGRESS → COMPLETED
3. Xóa notification cũ về IN_PROGRESS
4. Tạo notification mới: "Ticket #123 đã chuyển từ 'Đang xử lý' sang 'Hoàn thành'"
5. Notification có expiresAt = now + 3 ngày
```

### **Example 3: CONFIRMED → RECEIVED → PENDING**
```
1. Member xác nhận nhận kit: CONFIRMED → RECEIVED
   - Xóa notification cũ về CONFIRMED
   - Tạo notification mới về RECEIVED

2. Member xác nhận gửi kit: RECEIVED → PENDING
   - Xóa notification cũ về RECEIVED
   - Tạo notification mới về PENDING
```

## 🗂️ **Repository Methods**

```java
@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // Lấy notification theo user
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // Lấy notification chưa đọc theo user
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    // Lấy notification theo ticket
    List<Notification> findByTicketIdAndIsReadFalse(Long ticketId);
    
    // Lấy notification hết hạn
    List<Notification> findByExpiresAtBefore(LocalDateTime dateTime);
    
    // Đếm notification chưa đọc
    long countByUserIdAndIsReadFalse(Long userId);
}
```

## 🔒 **Security**

### **Authorization Rules:**
- `GET /notifications`: User chỉ có thể xem notification của mình
- `POST /notifications`: Chỉ admin/staff có thể tạo notification
- `PUT /notifications/{id}/read`: User chỉ có thể đánh dấu notification của mình
- `DELETE /notifications/ticket/{ticketId}/delete-old`: Chỉ admin/staff

### **Security Configuration:**
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/notifications").authenticated()
                .requestMatchers("/notifications/**").authenticated()
                .requestMatchers(HttpMethod.POST, "/notifications").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/notifications/**").hasAnyRole("STAFF", "ADMIN")
            );
        return http.build();
    }
}
```

## 📊 **Monitoring & Logging**

### **Log Messages:**
```java
// Khi tạo notification
log.info("✅ Tạo notification: Ticket #{} {} → {}", 
        ticketId, oldStatus, newStatus);

// Khi xóa notification cũ
log.info("🗑️ Xóa {} notification cũ cho ticket #{}", 
        count, ticketId);

// Khi xóa notification hết hạn
log.info("🧹 Xóa {} notification hết hạn", count);
```

### **Metrics:**
- Số lượng notification được tạo mỗi ngày
- Số lượng notification được xóa mỗi ngày
- Số lượng notification hết hạn mỗi ngày
- Thời gian trung bình notification được đọc

## 🚀 **Deployment Checklist**

### **Database:**
- [ ] Tạo bảng `notifications`
- [ ] Tạo index cho `user_id`, `ticket_id`, `expires_at`
- [ ] Tạo enum `notification_type`

### **Backend:**
- [ ] Tạo Notification entity
- [ ] Tạo NotificationRepository
- [ ] Tạo NotificationService
- [ ] Tạo NotificationController
- [ ] Cập nhật TicketService để tạo notification
- [ ] Thêm cron job cleanup
- [ ] Cập nhật SecurityConfig

### **Testing:**
- [ ] Test tạo notification khi thay đổi status
- [ ] Test xóa notification cũ
- [ ] Test cleanup notification hết hạn
- [ ] Test authorization rules
- [ ] Test notification timeout (3 ngày)

## 📝 **Notes**

1. **Timeout 3 ngày**: Notification tự động hết hạn sau 3 ngày
2. **Xóa notification cũ**: Khi có thay đổi trạng thái mới, notification cũ sẽ bị xóa
3. **Auto cleanup**: Cron job chạy mỗi giờ để xóa notification hết hạn
4. **User-specific**: Mỗi user chỉ thấy notification của mình
5. **Real-time**: Frontend sẽ reload notification khi có thay đổi 