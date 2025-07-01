# 🔔 Notification System - Test Guide

## 🚀 **Cách Test Hệ Thống Notification**

### **1. Test Frontend Integration**

#### **Bước 1: Mở Browser Console**
1. Đăng nhập vào hệ thống
2. Mở Developer Tools (F12)
3. Chuyển sang tab Console
4. Copy và paste code từ file `test_notification_system.js`

#### **Bước 2: Chạy Test**
```javascript
// Chạy tất cả test
testNotificationSystem.runAllTests();

// Hoặc chạy từng test riêng
testNotificationSystem.testNotificationEndpoints();
testNotificationSystem.testCreateNotification();
testNotificationSystem.testDeleteOldNotifications();
```

### **2. Test Real Workflow**

#### **Test Staff Workflow:**
1. **Đăng nhập với tài khoản Staff**
2. **Vào trang Staff Dashboard**
3. **Nhận một ticket PENDING**
   - Click "Nhận xử lý" trên ticket
   - Kiểm tra notification được tạo
   - Kiểm tra notification cũ bị xóa (nếu có)

4. **Hoàn thành ticket**
   - Click "Hoàn thành" và chọn kết quả
   - Kiểm tra notification mới được tạo
   - Kiểm tra notification cũ về IN_PROGRESS bị xóa

#### **Test Member Workflow (CIVIL SELF_TEST):**
1. **Đăng nhập với tài khoản Member**
2. **Tạo ticket CIVIL SELF_TEST**
   - Chọn "Dân sự" + "Tự gửi mẫu"
   - Ticket sẽ có status CONFIRMED

3. **Xác nhận nhận kit**
   - Vào "Lịch sử xét nghiệm"
   - Click "Xác nhận đã nhận kit"
   - Kiểm tra notification: CONFIRMED → RECEIVED

4. **Xác nhận gửi kit**
   - Click "Xác nhận đã gửi kit"
   - Kiểm tra notification: RECEIVED → PENDING

### **3. Test Notification UI**

#### **Kiểm tra Header Notification:**
1. **Icon chuông** hiển thị số notification chưa đọc
2. **Click vào chuông** mở dropdown notification
3. **Notification chưa đọc** có background khác
4. **Click vào notification** đánh dấu đã đọc
5. **Thời gian** hiển thị đúng format

#### **Kiểm tra Timeout:**
1. **Tạo notification test** với thời gian hết hạn ngắn
2. **Đợi thời gian hết hạn**
3. **Kiểm tra notification** không còn hiển thị
4. **Kiểm tra database** notification đã bị xóa

### **4. Test API Endpoints**

#### **Sử dụng Postman hoặc curl:**

```bash
# 1. Lấy danh sách notification
curl -X GET "http://localhost:8080/notifications" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Lấy số lượng chưa đọc
curl -X GET "http://localhost:8080/notifications/unread-count" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Đánh dấu tất cả đã đọc
curl -X POST "http://localhost:8080/notifications/mark-all-read" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. Đánh dấu 1 notification đã đọc
curl -X PUT "http://localhost:8080/notifications/1/read" \
  -H "Authorization: Bearer YOUR_TOKEN"

# 5. Xóa notification cũ cho ticket
curl -X DELETE "http://localhost:8080/notifications/ticket/123/delete-old" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"newStatus": "IN_PROGRESS"}'

# 6. Xóa notification hết hạn (admin/staff only)
curl -X DELETE "http://localhost:8080/notifications/cleanup-expired" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **5. Test Database**

#### **Kiểm tra bảng notifications:**
```sql
-- Xem tất cả notification
SELECT * FROM notifications ORDER BY created_at DESC;

-- Xem notification chưa đọc
SELECT * FROM notifications WHERE is_read = false;

-- Xem notification hết hạn
SELECT * FROM notifications WHERE expires_at < NOW();

-- Đếm notification theo user
SELECT user_id, COUNT(*) as count 
FROM notifications 
GROUP BY user_id;

-- Xem notification theo ticket
SELECT * FROM notifications WHERE ticket_id = 123;
```

### **6. Test Cron Job Cleanup**

#### **Kiểm tra log:**
```bash
# Xem log của cron job cleanup
tail -f /path/to/application.log | grep "cleanup"

# Expected log messages:
# 🧹 Xóa 5 notification hết hạn
# ✅ Cleanup expired notifications completed
```

#### **Test manual cleanup:**
```bash
# Gọi API cleanup thủ công
curl -X DELETE "http://localhost:8080/notifications/cleanup-expired" \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### **7. Expected Results**

#### **✅ Success Cases:**
- Notification được tạo khi thay đổi trạng thái
- Notification cũ bị xóa khi có trạng thái mới
- Notification hết hạn sau 3 ngày
- UI hiển thị đúng số lượng chưa đọc
- Thời gian hiển thị đúng format

#### **❌ Error Cases:**
- 403 Forbidden: Không có quyền
- 404 Not Found: Notification không tồn tại
- 400 Bad Request: Dữ liệu không hợp lệ

### **8. Performance Testing**

#### **Load Test:**
```bash
# Tạo nhiều notification
for i in {1..100}; do
  curl -X POST "http://localhost:8080/notifications" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Test notification $i\", \"type\": \"INFO\"}"
done
```

#### **Cleanup Performance:**
- Test với 1000+ notification hết hạn
- Kiểm tra thời gian cleanup
- Kiểm tra memory usage

### **9. Security Testing**

#### **Authorization Test:**
- CUSTOMER: Chỉ xem notification của mình
- STAFF: Có thể xóa notification cũ
- ADMIN: Có thể cleanup tất cả

#### **Data Validation:**
- Test với message quá dài
- Test với type không hợp lệ
- Test với ticketId không tồn tại

## 📋 **Test Checklist**

### **Frontend:**
- [ ] Notification bell hiển thị đúng
- [ ] Dropdown notification hoạt động
- [ ] Mark as read hoạt động
- [ ] Time format hiển thị đúng
- [ ] Auto refresh khi có notification mới

### **Backend:**
- [ ] API endpoints trả về đúng format
- [ ] Business logic hoạt động đúng
- [ ] Security rules được áp dụng
- [ ] Cron job cleanup chạy đúng
- [ ] Database constraints hoạt động

### **Integration:**
- [ ] Staff workflow tạo notification
- [ ] Member workflow tạo notification
- [ ] Notification cũ bị xóa
- [ ] Timeout 3 ngày hoạt động
- [ ] Real-time updates

## 🎯 **Success Criteria**

✅ **Notification được tạo tự động khi thay đổi trạng thái**
✅ **Notification cũ bị xóa khi có trạng thái mới**
✅ **Notification hết hạn sau 3 ngày**
✅ **UI hiển thị đúng và responsive**
✅ **Performance tốt với nhiều notification**
✅ **Security được đảm bảo**
✅ **Error handling đầy đủ** 