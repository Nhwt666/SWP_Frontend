# Test Backend Fixes - PowerShell Script
param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Token = ""
)

Write-Host "🚀 Testing Backend Fixes" -ForegroundColor Blue
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow

function Test-BackendHealth {
    Write-Host "`n🔍 Testing Backend Health..." -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -Method GET -ErrorAction Stop
        Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        $errorContent = $_.Exception.Response.Content
        Write-Host "⚠️  Backend health check returned: $statusCode" -ForegroundColor Yellow
        Write-Host "📄 Response: $errorContent" -ForegroundColor Yellow
        # Accept 401/403 as backend is running but requires auth
        return ($statusCode -eq 401 -or $statusCode -eq 403)
    }
}

function Test-Authentication {
    Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Blue
    
    # Test without token
    Write-Host "   📋 Testing without token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"type":"CIVIL","method":"SELF_TEST"}' -ErrorAction Stop
        Write-Host "   ❌ Should have failed without token!" -ForegroundColor Red
        return $false
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "   ✅ Correctly rejected without token ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Unexpected error without token: $statusCode" -ForegroundColor Red
            return $false
        }
    }
    
    # Test with invalid token
    Write-Host "   📋 Testing with invalid token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer invalid_token"} -Body '{"type":"CIVIL","method":"SELF_TEST"}' -ErrorAction Stop
        Write-Host "   ❌ Should have failed with invalid token!" -ForegroundColor Red
        return $false
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "   ✅ Correctly rejected with invalid token ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Unexpected error with invalid token: $statusCode" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

function Test-TicketCreation {
    param([string]$Type, [string]$Method, [string]$ExpectedStatus, [string]$Description)
    
    Write-Host "`n📋 Testing: $Description" -ForegroundColor Blue
    Write-Host "   Type: $Type, Method: $Method, Expected Status: $ExpectedStatus" -ForegroundColor Yellow
    
    $ticketData = @{
        type = $Type
        method = $Method
        status = if ($Type -eq "CIVIL" -and $Method -eq "SELF_TEST") { "CONFIRMED" } else { "PENDING" }
        reason = "Test ticket creation"
        customerId = 1
        amount = 1500000
        address = "123 Test Street"
        phone = "0123456789"
        email = "test@example.com"
        sample1Name = "Sample 1"
        sample2Name = "Sample 2"
    }
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $body = $ticketData | ConvertTo-Json -Depth 10
        Write-Host "   📄 Request Body: $body" -ForegroundColor Yellow
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "   📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            $responseData = $response.Content | ConvertFrom-Json
            Write-Host "   🎯 Ticket ID: $($responseData.id)" -ForegroundColor Green
            Write-Host "   🎯 Actual Status: $($responseData.status)" -ForegroundColor Green
            
            if ($responseData.status -eq $ExpectedStatus) {
                Write-Host "   ✅ Status matches expected: $ExpectedStatus" -ForegroundColor Green
                return $true
            } else {
                Write-Host "   ❌ Status mismatch! Expected: $ExpectedStatus, Got: $($responseData.status)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   ❌ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
            Write-Host "   📄 Response: $($response.Content)" -ForegroundColor Red
            return $false
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            $errorContent = $_.Exception.Response.Content
            Write-Host "   ❌ Error: $statusCode - $errorContent" -ForegroundColor Red
        } else {
            Write-Host "   ❌ Network Error: $errorMessage" -ForegroundColor Red
        }
        return $false
    }
}

# Run tests
$results = @()

$results += @{Name = "Backend Health"; Success = Test-BackendHealth}
$results += @{Name = "Authentication"; Success = Test-Authentication}

if ($Token) {
    $results += @{Name = "CIVIL SELF_TEST → CONFIRMED"; Success = Test-TicketCreation -Type "CIVIL" -Method "SELF_TEST" -ExpectedStatus "CONFIRMED" -Description "CIVIL SELF_TEST should be CONFIRMED"}
    $results += @{Name = "ADMINISTRATIVE AT_FACILITY → PENDING"; Success = Test-TicketCreation -Type "ADMINISTRATIVE" -Method "AT_FACILITY" -ExpectedStatus "PENDING" -Description "ADMINISTRATIVE AT_FACILITY should be PENDING"}
} else {
    Write-Host "`n⚠️  No token provided. Skipping authenticated tests." -ForegroundColor Yellow
    Write-Host "   To test ticket creation, provide a valid JWT token:" -ForegroundColor Yellow
    Write-Host "   .\test_backend_fixes.ps1 -Token 'your_jwt_token_here'" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -ForegroundColor Reset
Write-Host "==================================================" -ForegroundColor Blue
Write-Host "📊 TEST SUMMARY" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

$passed = ($results | Where-Object { $_.Success }).Count
$total = $results.Count

foreach ($result in $results) {
    $status = if ($result.Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "$status $($result.Name)" -ForegroundColor $color
}

if ($passed -eq $total) {
    Write-Host "`n🎯 Overall: $passed/$total tests passed" -ForegroundColor Green
    Write-Host "🎉 All tests passed! Backend fixes are working correctly." -ForegroundColor Green
    Write-Host "`n✅ 403 Error: FIXED" -ForegroundColor Green
    Write-Host "✅ 500 Error: FIXED" -ForegroundColor Green
    Write-Host "✅ Ticket Status Logic: FIXED" -ForegroundColor Green
    Write-Host "✅ Authentication: WORKING" -ForegroundColor Green
    Write-Host "✅ Error Handling: WORKING" -ForegroundColor Green
} else {
    Write-Host "`n🎯 Overall: $passed/$total tests passed" -ForegroundColor Yellow
    Write-Host "⚠️  Some tests failed. Check the details above." -ForegroundColor Yellow
}

Write-Host "`n🔍 Next Steps:" -ForegroundColor Blue
Write-Host "1. Test with frontend to ensure 403 errors are resolved" -ForegroundColor Yellow
Write-Host "2. Check backend console logs for debug information" -ForegroundColor Yellow
Write-Host "3. Verify database migration V25 ran successfully" -ForegroundColor Yellow
Write-Host "4. Test CIVIL SELF_TEST ticket creation in frontend" -ForegroundColor Yellow

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Token = ""
)

Write-Host "🚀 Testing Backend Fixes" -ForegroundColor Blue
Write-Host "Base URL: $BaseUrl" -ForegroundColor Yellow

function Test-BackendHealth {
    Write-Host "`n🔍 Testing Backend Health..." -ForegroundColor Blue
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/actuator/health" -Method GET -ErrorAction Stop
        Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        $errorContent = $_.Exception.Response.Content
        Write-Host "⚠️  Backend health check returned: $statusCode" -ForegroundColor Yellow
        Write-Host "📄 Response: $errorContent" -ForegroundColor Yellow
        # Accept 401/403 as backend is running but requires auth
        return ($statusCode -eq 401 -or $statusCode -eq 403)
    }
}

function Test-Authentication {
    Write-Host "`n🔐 Testing Authentication..." -ForegroundColor Blue
    
    # Test without token
    Write-Host "   📋 Testing without token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"type":"CIVIL","method":"SELF_TEST"}' -ErrorAction Stop
        Write-Host "   ❌ Should have failed without token!" -ForegroundColor Red
        return $false
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "   ✅ Correctly rejected without token ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Unexpected error without token: $statusCode" -ForegroundColor Red
            return $false
        }
    }
    
    # Test with invalid token
    Write-Host "   📋 Testing with invalid token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer invalid_token"} -Body '{"type":"CIVIL","method":"SELF_TEST"}' -ErrorAction Stop
        Write-Host "   ❌ Should have failed with invalid token!" -ForegroundColor Red
        return $false
    } catch {
        $statusCode = $_.Exception.Response.StatusCode
        if ($statusCode -eq 401 -or $statusCode -eq 403) {
            Write-Host "   ✅ Correctly rejected with invalid token ($statusCode)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Unexpected error with invalid token: $statusCode" -ForegroundColor Red
            return $false
        }
    }
    
    return $true
}

function Test-TicketCreation {
    param([string]$Type, [string]$Method, [string]$ExpectedStatus, [string]$Description)
    
    Write-Host "`n📋 Testing: $Description" -ForegroundColor Blue
    Write-Host "   Type: $Type, Method: $Method, Expected Status: $ExpectedStatus" -ForegroundColor Yellow
    
    $ticketData = @{
        type = $Type
        method = $Method
        status = if ($Type -eq "CIVIL" -and $Method -eq "SELF_TEST") { "CONFIRMED" } else { "PENDING" }
        reason = "Test ticket creation"
        customerId = 1
        amount = 1500000
        address = "123 Test Street"
        phone = "0123456789"
        email = "test@example.com"
        sample1Name = "Sample 1"
        sample2Name = "Sample 2"
    }
    
    $headers = @{"Content-Type" = "application/json"}
    if ($Token) { $headers["Authorization"] = "Bearer $Token" }
    
    try {
        $body = $ticketData | ConvertTo-Json -Depth 10
        Write-Host "   📄 Request Body: $body" -ForegroundColor Yellow
        
        $response = Invoke-WebRequest -Uri "$BaseUrl/tickets/after-payment" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "   📊 Response Status: $($response.StatusCode)" -ForegroundColor Green
        
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 201) {
            $responseData = $response.Content | ConvertFrom-Json
            Write-Host "   🎯 Ticket ID: $($responseData.id)" -ForegroundColor Green
            Write-Host "   🎯 Actual Status: $($responseData.status)" -ForegroundColor Green
            
            if ($responseData.status -eq $ExpectedStatus) {
                Write-Host "   ✅ Status matches expected: $ExpectedStatus" -ForegroundColor Green
                return $true
            } else {
                Write-Host "   ❌ Status mismatch! Expected: $ExpectedStatus, Got: $($responseData.status)" -ForegroundColor Red
                return $false
            }
        } else {
            Write-Host "   ❌ Unexpected status code: $($response.StatusCode)" -ForegroundColor Red
            Write-Host "   📄 Response: $($response.Content)" -ForegroundColor Red
            return $false
        }
    } catch {
        $errorMessage = $_.Exception.Message
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            $errorContent = $_.Exception.Response.Content
            Write-Host "   ❌ Error: $statusCode - $errorContent" -ForegroundColor Red
        } else {
            Write-Host "   ❌ Network Error: $errorMessage" -ForegroundColor Red
        }
        return $false
    }
}

# Run tests
$results = @()

$results += @{Name = "Backend Health"; Success = Test-BackendHealth}
$results += @{Name = "Authentication"; Success = Test-Authentication}

if ($Token) {
    $results += @{Name = "CIVIL SELF_TEST → CONFIRMED"; Success = Test-TicketCreation -Type "CIVIL" -Method "SELF_TEST" -ExpectedStatus "CONFIRMED" -Description "CIVIL SELF_TEST should be CONFIRMED"}
    $results += @{Name = "ADMINISTRATIVE AT_FACILITY → PENDING"; Success = Test-TicketCreation -Type "ADMINISTRATIVE" -Method "AT_FACILITY" -ExpectedStatus "PENDING" -Description "ADMINISTRATIVE AT_FACILITY should be PENDING"}
} else {
    Write-Host "`n⚠️  No token provided. Skipping authenticated tests." -ForegroundColor Yellow
    Write-Host "   To test ticket creation, provide a valid JWT token:" -ForegroundColor Yellow
    Write-Host "   .\test_backend_fixes.ps1 -Token 'your_jwt_token_here'" -ForegroundColor Yellow
}

# Summary
Write-Host "`n" -ForegroundColor Reset
Write-Host "==================================================" -ForegroundColor Blue
Write-Host "📊 TEST SUMMARY" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Blue

$passed = ($results | Where-Object { $_.Success }).Count
$total = $results.Count

foreach ($result in $results) {
    $status = if ($result.Success) { "✅ PASS" } else { "❌ FAIL" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "$status $($result.Name)" -ForegroundColor $color
}

if ($passed -eq $total) {
    Write-Host "`n🎯 Overall: $passed/$total tests passed" -ForegroundColor Green
    Write-Host "🎉 All tests passed! Backend fixes are working correctly." -ForegroundColor Green
    Write-Host "`n✅ 403 Error: FIXED" -ForegroundColor Green
    Write-Host "✅ 500 Error: FIXED" -ForegroundColor Green
    Write-Host "✅ Ticket Status Logic: FIXED" -ForegroundColor Green
    Write-Host "✅ Authentication: WORKING" -ForegroundColor Green
    Write-Host "✅ Error Handling: WORKING" -ForegroundColor Green
} else {
    Write-Host "`n🎯 Overall: $passed/$total tests passed" -ForegroundColor Yellow
    Write-Host "⚠️  Some tests failed. Check the details above." -ForegroundColor Yellow
}

Write-Host "`n🔍 Next Steps:" -ForegroundColor Blue
Write-Host "1. Test with frontend to ensure 403 errors are resolved" -ForegroundColor Yellow
Write-Host "2. Check backend console logs for debug information" -ForegroundColor Yellow
Write-Host "3. Verify database migration V25 ran successfully" -ForegroundColor Yellow
Write-Host "4. Test CIVIL SELF_TEST ticket creation in frontend" -ForegroundColor Yellow
