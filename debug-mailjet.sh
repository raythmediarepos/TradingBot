#!/bin/bash

echo "🔍 Debugging Mailjet Email Issues"
echo "===================================="
echo ""

BACKEND_URL="https://tradingbot-w843.onrender.com"

echo "1️⃣  Checking backend health..."
curl -s "$BACKEND_URL/api/health" | jq '.'
echo ""

echo "2️⃣  Testing waitlist signup (this should trigger email)..."
TIMESTAMP=$(date +%s)
TEST_EMAIL="debug-${TIMESTAMP}@example.com"

echo "   Using test email: $TEST_EMAIL"
echo ""

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/waitlist/join" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"firstName\": \"Debug\",
    \"lastName\": \"Test\"
  }")

echo "$RESPONSE" | jq '.'
echo ""

echo "=================================="
echo "📋 NEXT STEPS:"
echo "=================================="
echo ""
echo "1. Check Render logs RIGHT NOW:"
echo "   👉 https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs"
echo ""
echo "   Look for these lines:"
echo "   📧 [EMAIL] Starting waitlist confirmation email..."
echo "   → From: Helwa AI <raythmedia.repo@gmail.com>"
echo "   → Mailjet API Key: ✓ Set"
echo "   → Mailjet Secret: ✓ Set"
echo ""
echo "2. Check Mailjet Message History:"
echo "   👉 https://app.mailjet.com/transactional/messages"
echo ""
echo "   Search for: $TEST_EMAIL"
echo "   Check the status (queued/sent/delivered/bounced/blocked)"
echo ""
echo "3. If Mailjet shows 'blocked' or 'spam', that means:"
echo "   - Gmail/email provider rejected it"
echo "   - NOT a Mailjet issue"
echo ""
echo "4. If Mailjet shows nothing:"
echo "   - API keys might be wrong"
echo "   - Sender email still not updated in Render"
echo ""
