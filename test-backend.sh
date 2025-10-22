#!/bin/bash

echo "🧪 Testing Honeypot AI Backend on Render"
echo "=========================================="
echo ""

BACKEND_URL="https://tradingbot-w843.onrender.com"

echo "1️⃣  Testing Health Check..."
curl -s "$BACKEND_URL/api/health" | jq '.'
echo ""

echo "2️⃣  Testing Remaining Waitlist Spots..."
curl -s "$BACKEND_URL/api/waitlist/remaining" | jq '.'
echo ""

echo "3️⃣  Testing Waitlist Signup..."
curl -X POST "$BACKEND_URL/api/waitlist/join" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "firstName": "Test",
    "lastName": "User"
  }' | jq '.'
echo ""

echo "✅ Tests complete! Check Render logs for detailed output."
echo "🔗 Logs: https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs"
