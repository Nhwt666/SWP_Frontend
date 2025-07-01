# Test 500 Error PowerShell Script
# This script tests the ticket creation endpoint to identify the 500 error

Write-Host "Testing 500 Error - Ticket Creation" -ForegroundColor Yellow
Write-Host "=" * 60

# Test scenarios
$testScenarios = @(
    @{
        Name = "CIVIL SELF_TEST CONFIRMED (Current Error)"
        Data = @{
            type = "CIVIL"
            method = "SELF_TEST"
            status = "CONFIRMED"
            reason = "Xac minh quan he huyet thong"
            customerId = 1
            amount = 1500000
            address = "123 Test Street"
            phone = "0123456789"
            email = "test@example.com"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    },
    @{
        Name = "CIVIL SELF_TEST PENDING (Test Alternative)"
        Data = @{
            type = "CIVIL"
            method = "SELF_TEST"
            status = "PENDING"
            reason = "Xac minh quan he huyet thong"
            customerId = 1
            amount = 1500000
            address = "123 Test Street"
            phone = "0123456789"
            email = "test@example.com"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    },
    @{
        Name = "ADMINISTRATIVE AT_FACILITY PENDING (Control Test)"
        Data = @{
            type = "ADMINISTRATIVE"
            method = "AT_FACILITY"
            status = "PENDING"
            reason = "Xac minh danh tinh"
            customerId = 1
            amount = 1300000
            appointmentDate = "2024-01-15"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    }
)

# Test each scenario
foreach ($scenario in $testScenarios) {
    Write-Host "`nTesting: $($scenario.Name)" -ForegroundColor Cyan
    Write-Host "-" * 50
    
    $jsonData = $scenario.Data | ConvertTo-Json -Depth 10
    Write-Host "Request Data: $jsonData"
    
    try {
        $startTime = Get-Date
        
        $response = Invoke-RestMethod -Uri "http://localhost:8080/tickets/after-payment" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer YOUR_TOKEN_HERE"
            } `
            -Body $jsonData `
            -ErrorAction Stop
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "SUCCESS! Response Time: ${duration}ms" -ForegroundColor Green
        Write-Host "Ticket ID: $($response.id)"
        Write-Host "Status: $($response.status)"
        Write-Host "Type: $($response.type)"
        Write-Host "Method: $($response.method)"
        
    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "FAILED! Response Time: ${duration}ms" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $statusDescription = $_.Exception.Response.StatusDescription
            Write-Host "Status: $statusCode $statusDescription"
            
            # Get response body
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response Body: $responseBody"
            
            # Try to parse JSON error
            try {
                $errorData = $responseBody | ConvertFrom-Json
                Write-Host "Parsed Error: $($errorData | ConvertTo-Json -Depth 5)"
            } catch {
                Write-Host "Raw Error Text: $responseBody"
            }
        } else {
            Write-Host "Network Error: $($_.Exception.Message)"
        }
    }
}

Write-Host "`n" + "=" * 60
Write-Host "DEBUG SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 60
Write-Host "If you see 500 errors, check:"
Write-Host "1. Backend logs for stacktrace"
Write-Host "2. Database enum values"
Write-Host "3. Java enum TicketStatus"
Write-Host "4. Validation logic"
Write-Host "5. Required fields"
Write-Host "6. Database constraints" 
# This script tests the ticket creation endpoint to identify the 500 error

Write-Host "Testing 500 Error - Ticket Creation" -ForegroundColor Yellow
Write-Host "=" * 60

# Test scenarios
$testScenarios = @(
    @{
        Name = "CIVIL SELF_TEST CONFIRMED (Current Error)"
        Data = @{
            type = "CIVIL"
            method = "SELF_TEST"
            status = "CONFIRMED"
            reason = "Xac minh quan he huyet thong"
            customerId = 1
            amount = 1500000
            address = "123 Test Street"
            phone = "0123456789"
            email = "test@example.com"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    },
    @{
        Name = "CIVIL SELF_TEST PENDING (Test Alternative)"
        Data = @{
            type = "CIVIL"
            method = "SELF_TEST"
            status = "PENDING"
            reason = "Xac minh quan he huyet thong"
            customerId = 1
            amount = 1500000
            address = "123 Test Street"
            phone = "0123456789"
            email = "test@example.com"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    },
    @{
        Name = "ADMINISTRATIVE AT_FACILITY PENDING (Control Test)"
        Data = @{
            type = "ADMINISTRATIVE"
            method = "AT_FACILITY"
            status = "PENDING"
            reason = "Xac minh danh tinh"
            customerId = 1
            amount = 1300000
            appointmentDate = "2024-01-15"
            sample1Name = "Sample 1"
            sample2Name = "Sample 2"
        }
    }
)

# Test each scenario
foreach ($scenario in $testScenarios) {
    Write-Host "`nTesting: $($scenario.Name)" -ForegroundColor Cyan
    Write-Host "-" * 50
    
    $jsonData = $scenario.Data | ConvertTo-Json -Depth 10
    Write-Host "Request Data: $jsonData"
    
    try {
        $startTime = Get-Date
        
        $response = Invoke-RestMethod -Uri "http://localhost:8080/tickets/after-payment" `
            -Method POST `
            -Headers @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer YOUR_TOKEN_HERE"
            } `
            -Body $jsonData `
            -ErrorAction Stop
        
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "SUCCESS! Response Time: ${duration}ms" -ForegroundColor Green
        Write-Host "Ticket ID: $($response.id)"
        Write-Host "Status: $($response.status)"
        Write-Host "Type: $($response.type)"
        Write-Host "Method: $($response.method)"
        
    } catch {
        $endTime = Get-Date
        $duration = ($endTime - $startTime).TotalMilliseconds
        
        Write-Host "FAILED! Response Time: ${duration}ms" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            $statusDescription = $_.Exception.Response.StatusDescription
            Write-Host "Status: $statusCode $statusDescription"
            
            # Get response body
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response Body: $responseBody"
            
            # Try to parse JSON error
            try {
                $errorData = $responseBody | ConvertFrom-Json
                Write-Host "Parsed Error: $($errorData | ConvertTo-Json -Depth 5)"
            } catch {
                Write-Host "Raw Error Text: $responseBody"
            }
        } else {
            Write-Host "Network Error: $($_.Exception.Message)"
        }
    }
}

Write-Host "`n" + "=" * 60
Write-Host "DEBUG SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 60
Write-Host "If you see 500 errors, check:"
Write-Host "1. Backend logs for stacktrace"
Write-Host "2. Database enum values"
Write-Host "3. Java enum TicketStatus"
Write-Host "4. Validation logic"
Write-Host "5. Required fields"
Write-Host "6. Database constraints" 