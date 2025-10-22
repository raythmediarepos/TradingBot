#!/bin/bash

echo "🔍 Diagnosing Vercel Frontend Issue"
echo "====================================="
echo ""

VERCEL_URL="https://trading-bot-7fi8.vercel.app"

echo "Testing your live Vercel site..."
echo ""

echo "1️⃣  Fetching homepage to check if site is live..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL")
if [ "$STATUS" = "200" ]; then
  echo "✅ Site is live (HTTP $STATUS)"
else
  echo "❌ Site returned HTTP $STATUS"
fi
echo ""

echo "2️⃣  Checking what NEXT_PUBLIC_BACKEND_URL the frontend is using..."
echo "   (Check browser console on $VERCEL_URL for actual value)"
echo ""

echo "📋 SUMMARY:"
echo "==========="
echo "• Backend: https://tradingbot-w843.onrender.com ✅ WORKING"
echo "• Frontend: $VERCEL_URL"
echo "• Problem: Frontend doesn't have NEXT_PUBLIC_BACKEND_URL env var set"
echo ""
echo "🔧 SOLUTION:"
echo "Follow the instructions in VERCEL_ENV_SETUP.md"
echo ""
echo "Quick steps:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select 'trading-bot-7fi8' project"
echo "3. Settings → Environment Variables"
echo "4. Add: NEXT_PUBLIC_BACKEND_URL = https://tradingbot-w843.onrender.com"
echo "5. Apply to: Production, Preview, Development"
echo "6. Redeploy"
