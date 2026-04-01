#!/bin/bash

# Script para probar endpoints básicos del API
# Uso: ./scripts/test-endpoints.sh

BASE_URL="http://localhost:3000"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "  Probando Endpoints de Versal API"
echo "=========================================="
echo ""

# Función para hacer peticiones y mostrar resultado
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local token=$5
    
    echo -n "Testing: $description... "
    
    if [ -n "$token" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $token" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Authorization: Bearer $token")
        fi
    else
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $http_code)"
    elif [ "$http_code" -eq 401 ]; then
        echo -e "${YELLOW}⚠ Unauthorized${NC} (HTTP $http_code) - Expected for protected routes"
    elif [ "$http_code" -eq 404 ]; then
        echo -e "${YELLOW}⚠ Not Found${NC} (HTTP $http_code)"
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $http_code)"
        echo "Response: $body"
    fi
}

# 1. Health Check
echo "1. Health Check"
test_endpoint "GET" "/health" "Health endpoint"
echo ""

# 2. Auth Endpoints
echo "2. Auth Endpoints"
test_endpoint "POST" "/api/auth/register" "Register (invalid data)" '{"email":"invalid"}'
test_endpoint "POST" "/api/auth/login" "Login (invalid data)" '{"email":"test@test.com","password":"wrong"}'
test_endpoint "GET" "/api/auth/me" "Get current user (no token)"
echo ""

# 3. Story Endpoints
echo "3. Story Endpoints"
test_endpoint "GET" "/api/stories" "Get all stories"
test_endpoint "GET" "/api/stories/categories" "Get categories"
test_endpoint "GET" "/api/stories/tags" "Get tags"
echo ""

# 4. Chapter Endpoints
echo "4. Chapter Endpoints"
test_endpoint "GET" "/api/stories/test-id/chapters" "Get chapters for story"
echo ""

# 5. User Endpoints
echo "5. User Endpoints"
test_endpoint "GET" "/api/users/test-id/followers" "Get user followers"
test_endpoint "GET" "/api/users/test-id/following" "Get user following"
echo ""

echo "=========================================="
echo "  Test completado"
echo "=========================================="
echo ""
echo "Nota: Algunos endpoints pueden fallar si la base de datos no está configurada."
echo "Para probar endpoints protegidos, primero registra un usuario y obtén un token."
