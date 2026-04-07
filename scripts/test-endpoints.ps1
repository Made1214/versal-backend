# Script para probar endpoints basicos del API
# Uso: .\scripts\test-endpoints.ps1

$BaseUrl = "http://localhost:3000"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Probando Endpoints de Versal API" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Description,
        [string]$Data = $null,
        [string]$Token = $null
    )
    
    Write-Host "Testing: $Description... " -NoNewline
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        $url = "$BaseUrl$Endpoint"
        
        if ($Data) {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -Body $Data -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $url -Method $Method -Headers $headers -ErrorAction Stop
        }
        
        $statusCode = $response.StatusCode
        
        if ($statusCode -ge 200 -and $statusCode -lt 300) {
            Write-Host "OK" -ForegroundColor Green -NoNewline
            Write-Host " (HTTP $statusCode)"
        } else {
            Write-Host "Warning" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode)"
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        
        if ($statusCode -eq 401) {
            Write-Host "Unauthorized" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode) - Expected for protected routes"
        }
        elseif ($statusCode -eq 404) {
            Write-Host "Not Found" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode)"
        }
        elseif ($statusCode -eq 400) {
            Write-Host "Bad Request" -ForegroundColor Yellow -NoNewline
            Write-Host " (HTTP $statusCode) - Expected for invalid data"
        }
        else {
            Write-Host "FAIL" -ForegroundColor Red -NoNewline
            Write-Host " (HTTP $statusCode)"
        }
    }
}

# 1. Health Check
Write-Host "1. Health Check" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/health" -Description "Health endpoint"
Write-Host ""

# 2. Auth Endpoints
Write-Host "2. Auth Endpoints" -ForegroundColor Cyan
Test-Endpoint -Method "POST" -Endpoint "/api/auth/register" -Description "Register (invalid data)" -Data '{"email":"invalid"}'
Test-Endpoint -Method "POST" -Endpoint "/api/auth/login" -Description "Login (invalid data)" -Data '{"email":"test@test.com","password":"wrong"}'
Test-Endpoint -Method "GET" -Endpoint "/api/auth/me" -Description "Get current user (no token)"
Write-Host ""

# 3. Story Endpoints
Write-Host "3. Story Endpoints" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/stories" -Description "Get all stories"
Test-Endpoint -Method "GET" -Endpoint "/api/stories/categories" -Description "Get categories"
Test-Endpoint -Method "GET" -Endpoint "/api/stories/tags" -Description "Get tags"
Write-Host ""

# 4. Chapter Endpoints
Write-Host "4. Chapter Endpoints" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/stories/test-id/chapters" -Description "Get chapters for story"
Write-Host ""

# 5. User Endpoints
Write-Host "5. User Endpoints" -ForegroundColor Cyan
Test-Endpoint -Method "GET" -Endpoint "/api/users/test-id/followers" -Description "Get user followers"
Test-Endpoint -Method "GET" -Endpoint "/api/users/test-id/following" -Description "Get user following"
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "  Test completado" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Nota: Algunos endpoints pueden fallar si la base de datos no esta configurada." -ForegroundColor Yellow
Write-Host "Para probar endpoints protegidos, primero registra un usuario y obten un token." -ForegroundColor Yellow
