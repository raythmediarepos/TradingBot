#!/bin/bash

echo "🧪 Testing Email After Sender Fix"
echo "=================================="
echo ""

BACKEND_URL="https://tradingbot-w843.onrender.com"

echo "Joining waitlist with a test email..."
echo ""

TIMESTAMP=$(date +%s)
TEST_EMAIL="test-${TIMESTAMP}@example.com"

curl -X POST "$BACKEND_URL/api/waitlist/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"firstName\": \"Test\",
    \"lastName\": \"AfterFix\"
  }" | jq '.'

echo ""
echo "✅ Request sent!"
echo ""
echo "Now check Render logs for email delivery:"
echo "👉 https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs"
echo ""
echo "Look for:"
echo "  📧 [EMAIL] Starting waitlist confirmation email..."
echo "  → From: Helwa AI <raythmedia.repo@gmail.com>"
echo "  ✅ [EMAIL SUCCESS] Confirmation email sent!"
echo ""
echo "And check Mailjet dashboard - the email should appear there now!"
