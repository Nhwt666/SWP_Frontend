# Test Backend Endpoints for Ticket Creation
# PowerShell script to test if backend properly handles CONFIRMED status

Write-Host "🔍 Testing Backend Endpoints for Ticket Creation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$token = "YOUR_TOKEN_HERE" # Replace with actual token

# Test 1: Check if backend is running
Write-Host "`n1. Testing if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test ticket creation with CONFIRMED status
Write-Host "`n2. Testing ticket creation with CONFIRMED status..." -ForegroundColor Yellow

$ticketData = @{
    type = "CIVIL"
    method = "SELF_TEST"
    status = "CONFIRMED"
    reason = "Xác minh quan hệ huyết thống"
    address = "123 Test Street"
    phone = "0123456789"
    email = "test@example.com"
    sample1Name = "Mẫu 1"
    sample2Name = "Mẫu 2"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketData -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Ticket created successfully" -ForegroundColor Green
    Write-Host "   Ticket ID: $($response.id)" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Type: $($response.type)" -ForegroundColor Green
    Write-Host "   Method: $($response.method)" -ForegroundColor Green
    
    if ($response.status -eq "CONFIRMED") {
        Write-Host "   ✅ Status is CONFIRMED as expected" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Status is $($response.status), expected CONFIRMED" -ForegroundColor Red
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to create ticket" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host "   ℹ️ 401 Unauthorized - Token may be invalid or expired" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "   ℹ️ 400 Bad Request - Check request data" -ForegroundColor Yellow
    } elseif ($statusCode -eq 500) {
        Write-Host "   ℹ️ 500 Internal Server Error - Check backend logs" -ForegroundColor Yellow
    }
}

# Test 3: Test ticket creation without status (should default to PENDING)
Write-Host "`n3. Testing ticket creation without status (should default to PENDING)..." -ForegroundColor Yellow

$ticketDataNoStatus = @{
    type = "CIVIL"
    method = "SELF_TEST"
    reason = "Xác minh quan hệ huyết thống"
    address = "123 Test Street"
    phone = "0123456789"
    email = "test@example.com"
    sample1Name = "Mẫu 1"
    sample2Name = "Mẫu 2"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketDataNoStatus -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Ticket created successfully" -ForegroundColor Green
    Write-Host "   Ticket ID: $($response.id)" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    
    if ($response.status -eq "PENDING") {
        Write-Host "   ✅ Status is PENDING as expected (default)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Status is $($response.status), expected PENDING" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to create ticket without status" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
}

# Test 4: Test invalid status
Write-Host "`n4. Testing ticket creation with invalid status..." -ForegroundColor Yellow

$ticketDataInvalidStatus = @{
    type = "CIVIL"
    method = "SELF_TEST"
    status = "INVALID_STATUS"
    reason = "Xác minh quan hệ huyết thống"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketDataInvalidStatus -Headers $headers -ErrorAction Stop
    
    Write-Host "❌ Ticket created with invalid status (should have failed)" -ForegroundColor Red
    Write-Host "   Status: $($response.status)" -ForegroundColor Red
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 400) {
        Write-Host "✅ Correctly rejected invalid status" -ForegroundColor Green
        Write-Host "   Status Code: 400 (Bad Request)" -ForegroundColor Green
        Write-Host "   Error: $errorMessage" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error for invalid status" -ForegroundColor Red
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        Write-Host "   Error: $errorMessage" -ForegroundColor Red
    }
}

# Test 5: Check recent tickets
Write-Host "`n5. Checking recent tickets..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/tickets" -Method GET -Headers $headers -ErrorAction Stop
    
    $civilSelfTestTickets = $response | Where-Object { $_.type -eq "CIVIL" -and $_.method -eq "SELF_TEST" } | Select-Object -First 5
    
    Write-Host "✅ Retrieved recent tickets" -ForegroundColor Green
    Write-Host "   Found $($civilSelfTestTickets.Count) CIVIL SELF_TEST tickets" -ForegroundColor Green
    
    foreach ($ticket in $civilSelfTestTickets) {
        $statusColor = if ($ticket.status -eq "CONFIRMED") { "Green" } else { "Yellow" }
        Write-Host "   ID: $($ticket.id), Status: $($ticket.status), Created: $($ticket.createdAt)" -ForegroundColor $statusColor
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to retrieve tickets" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
}

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "1. Backend connectivity: ✅" -ForegroundColor Green
Write-Host "2. CONFIRMED status support: Check results above" -ForegroundColor Yellow
Write-Host "3. Default PENDING status: Check results above" -ForegroundColor Yellow
Write-Host "4. Invalid status handling: Check results above" -ForegroundColor Yellow
Write-Host "5. Recent tickets: Check results above" -ForegroundColor Yellow

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "- Check backend logs for detailed debug information" -ForegroundColor White
Write-Host "- Verify database entries for created tickets" -ForegroundColor White
Write-Host "- Test frontend integration if backend tests pass" -ForegroundColor White 
# PowerShell script to test if backend properly handles CONFIRMED status

Write-Host "🔍 Testing Backend Endpoints for Ticket Creation" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$token = "YOUR_TOKEN_HERE" # Replace with actual token

# Test 1: Check if backend is running
Write-Host "`n1. Testing if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running or not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test ticket creation with CONFIRMED status
Write-Host "`n2. Testing ticket creation with CONFIRMED status..." -ForegroundColor Yellow

$ticketData = @{
    type = "CIVIL"
    method = "SELF_TEST"
    status = "CONFIRMED"
    reason = "Xác minh quan hệ huyết thống"
    address = "123 Test Street"
    phone = "0123456789"
    email = "test@example.com"
    sample1Name = "Mẫu 1"
    sample2Name = "Mẫu 2"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    }
    
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketData -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Ticket created successfully" -ForegroundColor Green
    Write-Host "   Ticket ID: $($response.id)" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    Write-Host "   Type: $($response.type)" -ForegroundColor Green
    Write-Host "   Method: $($response.method)" -ForegroundColor Green
    
    if ($response.status -eq "CONFIRMED") {
        Write-Host "   ✅ Status is CONFIRMED as expected" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Status is $($response.status), expected CONFIRMED" -ForegroundColor Red
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to create ticket" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host "   ℹ️ 401 Unauthorized - Token may be invalid or expired" -ForegroundColor Yellow
    } elseif ($statusCode -eq 400) {
        Write-Host "   ℹ️ 400 Bad Request - Check request data" -ForegroundColor Yellow
    } elseif ($statusCode -eq 500) {
        Write-Host "   ℹ️ 500 Internal Server Error - Check backend logs" -ForegroundColor Yellow
    }
}

# Test 3: Test ticket creation without status (should default to PENDING)
Write-Host "`n3. Testing ticket creation without status (should default to PENDING)..." -ForegroundColor Yellow

$ticketDataNoStatus = @{
    type = "CIVIL"
    method = "SELF_TEST"
    reason = "Xác minh quan hệ huyết thống"
    address = "123 Test Street"
    phone = "0123456789"
    email = "test@example.com"
    sample1Name = "Mẫu 1"
    sample2Name = "Mẫu 2"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketDataNoStatus -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ Ticket created successfully" -ForegroundColor Green
    Write-Host "   Ticket ID: $($response.id)" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Green
    
    if ($response.status -eq "PENDING") {
        Write-Host "   ✅ Status is PENDING as expected (default)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Status is $($response.status), expected PENDING" -ForegroundColor Yellow
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to create ticket without status" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
}

# Test 4: Test invalid status
Write-Host "`n4. Testing ticket creation with invalid status..." -ForegroundColor Yellow

$ticketDataInvalidStatus = @{
    type = "CIVIL"
    method = "SELF_TEST"
    status = "INVALID_STATUS"
    reason = "Xác minh quan hệ huyết thống"
    customerId = 1
    amount = 1500000
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/tickets/after-payment" -Method POST -Body $ticketDataInvalidStatus -Headers $headers -ErrorAction Stop
    
    Write-Host "❌ Ticket created with invalid status (should have failed)" -ForegroundColor Red
    Write-Host "   Status: $($response.status)" -ForegroundColor Red
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    if ($statusCode -eq 400) {
        Write-Host "✅ Correctly rejected invalid status" -ForegroundColor Green
        Write-Host "   Status Code: 400 (Bad Request)" -ForegroundColor Green
        Write-Host "   Error: $errorMessage" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error for invalid status" -ForegroundColor Red
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        Write-Host "   Error: $errorMessage" -ForegroundColor Red
    }
}

# Test 5: Check recent tickets
Write-Host "`n5. Checking recent tickets..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/tickets" -Method GET -Headers $headers -ErrorAction Stop
    
    $civilSelfTestTickets = $response | Where-Object { $_.type -eq "CIVIL" -and $_.method -eq "SELF_TEST" } | Select-Object -First 5
    
    Write-Host "✅ Retrieved recent tickets" -ForegroundColor Green
    Write-Host "   Found $($civilSelfTestTickets.Count) CIVIL SELF_TEST tickets" -ForegroundColor Green
    
    foreach ($ticket in $civilSelfTestTickets) {
        $statusColor = if ($ticket.status -eq "CONFIRMED") { "Green" } else { "Yellow" }
        Write-Host "   ID: $($ticket.id), Status: $($ticket.status), Created: $($ticket.createdAt)" -ForegroundColor $statusColor
    }
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorMessage = $_.Exception.Message
    
    Write-Host "❌ Failed to retrieve tickets" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $errorMessage" -ForegroundColor Red
}

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "1. Backend connectivity: ✅" -ForegroundColor Green
Write-Host "2. CONFIRMED status support: Check results above" -ForegroundColor Yellow
Write-Host "3. Default PENDING status: Check results above" -ForegroundColor Yellow
Write-Host "4. Invalid status handling: Check results above" -ForegroundColor Yellow
Write-Host "5. Recent tickets: Check results above" -ForegroundColor Yellow

Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
Write-Host "- Check backend logs for detailed debug information" -ForegroundColor White
Write-Host "- Verify database entries for created tickets" -ForegroundColor White
Write-Host "- Test frontend integration if backend tests pass" -ForegroundColor White 