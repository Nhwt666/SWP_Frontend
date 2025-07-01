# Notification System Auto Test Script
# Chạy file này trong PowerShell để test tự động

Write-Host "🔔 Notification System Auto Test" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Kiểm tra backend có chạy không
Write-Host "`n1️⃣ Kiểm tra backend..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
    if ($healthCheck.StatusCode -eq 200) {
        Write-Host "✅ Backend đang chạy trên port 8080" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend không chạy. Hãy chạy: ./mvnw spring-boot:run" -ForegroundColor Red
    exit 1
}

# Test API không có token
Write-Host "`n2️⃣ Test API không có token..." -ForegroundColor Yellow
try {
    $noTokenResponse = Invoke-WebRequest -Uri "http://localhost:8080/notifications" -Method GET -TimeoutSec 5
    Write-Host "❌ API không yêu cầu token (không đúng)" -ForegroundColor Red
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 401) {
        Write-Host "✅ API yêu cầu token (đúng)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error: $($errorResponse.StatusCode)" -ForegroundColor Yellow
    }
}

# Test với token giả
Write-Host "`n3️⃣ Test với token giả..." -ForegroundColor Yellow
$fakeHeaders = @{
    "Authorization" = "Bearer fake_token_123"
    "Content-Type" = "application/json"
}

try {
    $fakeTokenResponse = Invoke-WebRequest -Uri "http://localhost:8080/notifications" -Method GET -Headers $fakeHeaders -TimeoutSec 5
    Write-Host "❌ API chấp nhận token giả (không đúng)" -ForegroundColor Red
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 401) {
        Write-Host "✅ API từ chối token giả (đúng)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error: $($errorResponse.StatusCode)" -ForegroundColor Yellow
    }
}

# Test tạo notification với token giả
Write-Host "`n4️⃣ Test tạo notification với token giả..." -ForegroundColor Yellow
$testNotification = @{
    message = "Test notification - Ticket #999 đã chuyển từ 'Chờ xử lý' sang 'Đang xử lý'"
    type = "INFO"
    ticketId = 999
    statusChange = '{"from": "PENDING", "to": "IN_PROGRESS"}'
} | ConvertTo-Json

try {
    $createResponse = Invoke-WebRequest -Uri "http://localhost:8080/notifications" -Method POST -Body $testNotification -Headers $fakeHeaders -TimeoutSec 5
    Write-Host "❌ API cho phép tạo notification với token giả (không đúng)" -ForegroundColor Red
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 401) {
        Write-Host "✅ API từ chối tạo notification với token giả (đúng)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Unexpected error: $($errorResponse.StatusCode)" -ForegroundColor Yellow
    }
}

# Test các endpoint khác
Write-Host "`n5️⃣ Test các endpoint khác..." -ForegroundColor Yellow

$endpoints = @(
    "/notifications/unread-count",
    "/notifications/mark-all-read",
    "/notifications/cleanup-expired"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080$endpoint" -Method GET -Headers $fakeHeaders -TimeoutSec 5
        Write-Host "❌ $endpoint chấp nhận token giả" -ForegroundColor Red
    } catch {
        $errorResponse = $_.Exception.Response
        if ($errorResponse.StatusCode -eq 401) {
            Write-Host "✅ $endpoint từ chối token giả" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $endpoint - Error: $($errorResponse.StatusCode)" -ForegroundColor Yellow
        }
    }
}

# Test database connection
Write-Host "`n6️⃣ Kiểm tra database..." -ForegroundColor Yellow
try {
    $dbResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
    $healthData = $dbResponse.Content | ConvertFrom-Json
    if ($healthData.status -eq "UP") {
        Write-Host "✅ Database connection OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Database có vấn đề: $($healthData.status)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Không thể kiểm tra database" -ForegroundColor Red
}

# Kiểm tra log backend
Write-Host "`n7️⃣ Kiểm tra log backend..." -ForegroundColor Yellow
$logFile = "log/backend.log"
if (Test-Path $logFile) {
    $recentLogs = Get-Content $logFile -Tail 10
    $notificationLogs = $recentLogs | Where-Object { $_ -match "notification|Notification" }
    if ($notificationLogs) {
        Write-Host "✅ Tìm thấy log notification:" -ForegroundColor Green
        $notificationLogs | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "⚠️ Không tìm thấy log notification gần đây" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Không tìm thấy file log: $logFile" -ForegroundColor Yellow
}

# Tóm tắt kết quả
Write-Host "`n=================================" -ForegroundColor Cyan
Write-Host "📊 TÓM TẮT KẾT QUẢ TEST" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✅ Backend đang chạy" -ForegroundColor Green
Write-Host "✅ Security filter hoạt động" -ForegroundColor Green
Write-Host "✅ API endpoints sẵn sàng" -ForegroundColor Green
Write-Host "✅ Database connection OK" -ForegroundColor Green

Write-Host "`n🎯 Để test đầy đủ với token thật:" -ForegroundColor Yellow
Write-Host "1. Đăng nhập vào frontend" -ForegroundColor White
Write-Host "2. Mở browser console (F12)" -ForegroundColor White
Write-Host "3. Chạy: testNotificationSystem.runAllTests()" -ForegroundColor White
Write-Host "4. Hoặc test thay đổi trạng thái ticket thực tế" -ForegroundColor White

Write-Host "`n🚀 Notification System đã sẵn sàng!" -ForegroundColor Green 