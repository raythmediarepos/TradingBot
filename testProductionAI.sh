#!/bin/bash

# Test Production AI Monitor
# This will create a test error and trigger immediate AI analysis

echo ""
echo "🧪 TESTING PRODUCTION AI MONITOR"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "⏳ Logging in as admin..."
echo ""

# Login as admin to get token
LOGIN_RESPONSE=$(curl -s -X POST https://tradingbotbackendprod.onrender.com/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"godisgood"}')

TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('token', ''))" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Check admin credentials."
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Logged in successfully!"
echo ""
echo "🧠 Creating test error and triggering AI analysis..."
echo ""

# Trigger AI monitor test
TEST_RESPONSE=$(curl -s -X POST https://tradingbotbackendprod.onrender.com/api/admin/test-ai-monitor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "📊 Response:"
echo "$TEST_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$TEST_RESPONSE"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ TEST TRIGGERED!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📱 Check your Discord #system-alerts channel in ~10 seconds"
echo "   You should see a Jarvis alert with the test error!"
echo ""

