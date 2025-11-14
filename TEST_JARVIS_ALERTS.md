# 🤖 JARVIS ALERT SYSTEM - TESTING GUIDE

## 🎬 "Good afternoon, Ramsey. We have an incident."

Your Discord alerts now sound like J.A.R.V.I.S. from Iron Man - personalized, intelligent, and helpful.

---

## 🚀 **HOW TO TEST JARVIS ALERTS**

### **Method 1: Using cURL (Terminal)**

```bash
# Test a CRITICAL SYSTEM alert
curl -X POST https://tradingbotbackendprod.onrender.com/api/admin/test-jarvis-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"severity": "critical", "service": "system"}'

# Test a WARNING API alert
curl -X POST https://tradingbotbackendprod.onrender.com/api/admin/test-jarvis-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"severity": "warning", "service": "api"}'

# Test an INFO USERS alert
curl -X POST https://tradingbotbackendprod.onrender.com/api/admin/test-jarvis-alert \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"severity": "info", "service": "users"}'
```

### **Method 2: Using the Browser Console**

1. Go to: `https://www.helwa.ai/admin/system-health`
2. Open browser console (F12)
3. Run this:

```javascript
// Get your token from localStorage
const token = localStorage.getItem('token')

// Test CRITICAL alert
fetch('https://tradingbotbackendprod.onrender.com/api/admin/test-jarvis-alert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    severity: 'critical',
    service: 'system'
  })
}).then(r => r.json()).then(console.log)
```

---

## 📱 **WHAT YOU'LL SEE IN DISCORD**

### **Example 1: Critical System Alert**

```
@Ramsey Rayth

🔴 CRITICAL ALERT • Immediate attention required

╔═══════════════════════════════════════╗
║  🔴 URGENT SYSTEM ALERT              ║
╚═══════════════════════════════════════╝

Good afternoon, Ramsey. I must inform you that we're 
experiencing a critical system incident. The platform 
has been degraded for the past 15 minutes across 
multiple health checks. Your immediate attention is 
required.

📊 Service Affected     🎚️ Priority Level
   `SYSTEM`                `CRITICAL`

📏 Expected Threshold   📈 Current Value    ⚠️ Deviation
   `95%`                   `85%`              `10%`

🎯 Recommended Actions:
• Check Render backend logs immediately
• Verify Firebase connectivity
• Review recent deployments for potential issues
• Monitor user impact and consider status page update

🔗 System Diagnostics
Access Dashboard • View Logs

───────────────────────────────────────
J.A.R.V.I.S. • Helwa AI Monitoring System
```

### **Example 2: Warning - API Response Time**

```
@Ramsey Rayth

🟡 System Advisory • Review recommended

╔═══════════════════════════════════════╗
║  🟡 System Advisory                  ║
╚═══════════════════════════════════════╝

Good evening, Ramsey. The API response times have 
been elevated at 4500ms, which is above our optimal 
threshold of 3000ms. User experience may be impacted.

📊 Service Affected     🎚️ Priority Level
   `API`                   `WARNING`

📏 Expected Threshold   📈 Current Value    ⚠️ Deviation
   `3000ms`                `4500ms`           `1500ms`

🎯 Recommended Actions:
• Review API endpoint performance metrics
• Check for database query bottlenecks
• Monitor server resource utilization
• Consider scaling if load-related

🔗 System Diagnostics
Access Dashboard • View Logs

───────────────────────────────────────
J.A.R.V.I.S. • Helwa AI Monitoring System
```

### **Example 3: Info - User Verification Rate**

```
🔵 System Update

╔═══════════════════════════════════════╗
║  🔵 System Notification              ║
╚═══════════════════════════════════════╝

Good morning, Ramsey. I've noticed that email 
verification rates have declined to 45%, below our 
60% target. This may warrant reviewing our 
verification email templates and timing.

📊 Service Affected     🎚️ Priority Level
   `USERS`                 `INFO`

📏 Expected Threshold   📈 Current Value    ⚠️ Deviation
   `60%`                   `45%`              `15%`

🎯 Recommended Actions:
• Review verification email content and timing
• Check spam filter compliance
• Test email delivery to common providers
• Consider A/B testing subject lines

🔗 System Diagnostics
Access Dashboard • View Logs

───────────────────────────────────────
J.A.R.V.I.S. • Helwa AI Monitoring System
```

---

## 🎯 **JARVIS FEATURES**

### **1. Personalized Greetings**
- Fetches your actual Discord name
- Time-aware greetings:
  - 12:00 AM - 6:00 AM: "Apologies for the late hour, Ramsey"
  - 6:00 AM - 12:00 PM: "Good morning, Ramsey"
  - 12:00 PM - 6:00 PM: "Good afternoon, Ramsey"
  - 6:00 PM - 12:00 AM: "Good evening, Ramsey"

### **2. Intelligent Messages**
- Different messages for each service + severity combination
- Context-aware explanations
- Professional, helpful tone
- Explains the impact clearly

### **3. Smart Recommendations**
- Service-specific action items
- Actual steps you can take
- Links to relevant tools
- Prioritized by severity

### **4. Enhanced Metrics**
- Shows expected vs actual values
- Calculates deviation automatically
- Proper units (%, ms) based on service
- Color-coded by severity

### **5. Admin Tagging**
- Critical alerts: Tags all admins with "Immediate attention required"
- Warning alerts: Tags admins with "Review recommended"
- Info alerts: No tagging, just notification

---

## 🔧 **AVAILABLE TEST PARAMETERS**

### **Severity Levels:**
- `critical` - Urgent issues requiring immediate action
- `warning` - Issues that need attention soon
- `info` - Informational notices

### **Services:**
- `system` - Overall platform health
- `api` - API performance and response times
- `email` - Email delivery and bounce rates
- `users` - User metrics and verification rates

### **All Combinations (12 total):**
```json
{"severity": "critical", "service": "system"}
{"severity": "critical", "service": "email"}
{"severity": "warning", "service": "system"}
{"severity": "warning", "service": "api"}
{"severity": "warning", "service": "email"}
{"severity": "info", "service": "users"}
```

---

## 📊 **WHEN REAL ALERTS WILL TRIGGER**

### **Critical Alerts (with 3 consecutive failures):**
1. **System Degraded** - API or Database down for 15+ minutes
2. **Email Bounce Rate** - >10% bounce rate with 5+ emails sent

### **Warning Alerts:**
1. **Low Uptime** - <95% uptime over 24 hours
2. **Slow API** - Response time >3000ms
3. **Low Email Delivery** - <90% delivery rate with 10+ emails

### **Info Alerts:**
1. **Low Verification Rate** - <60% with 20+ users

---

## 🎬 **QUICK TEST SCRIPT**

Save this as `test-jarvis.sh`:

```bash
#!/bin/bash

# Get your admin token from localStorage in browser
TOKEN="your_token_here"
API="https://tradingbotbackendprod.onrender.com/api/admin/test-jarvis-alert"

echo "🤖 Testing Jarvis Alert System..."
echo ""

echo "📤 Sending CRITICAL system alert..."
curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"severity":"critical","service":"system"}' | jq

sleep 2

echo ""
echo "📤 Sending WARNING api alert..."
curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"severity":"warning","service":"api"}' | jq

sleep 2

echo ""
echo "📤 Sending INFO users alert..."
curl -s -X POST $API \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"severity":"info","service":"users"}' | jq

echo ""
echo "✅ Done! Check your Discord alerts channel!"
```

Make executable: `chmod +x test-jarvis.sh`
Run: `./test-jarvis.sh`

---

## 🚀 **DEPLOYMENT STATUS**

- ✅ Jarvis alert system committed
- ✅ Pushed to test and main branches
- ⏳ Render deploying backend (~2-3 minutes)
- ⏳ After deployment, test endpoint will be live

---

## 📝 **NEXT STEPS**

1. **Wait for Render to deploy** (~2-3 minutes)
2. **Test the alerts** using one of the methods above
3. **Check your Discord alerts channel** - you should see personalized Jarvis messages!
4. **Monitor real alerts** - they'll use the same format automatically

---

**"Sir, the system is ready for your review." 🤖**

