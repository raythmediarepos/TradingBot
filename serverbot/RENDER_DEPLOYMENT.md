# Serverbot Deployment to Render

Complete guide to deploy the Helwa AI monitoring serverbot as a **free** background worker on Render.

---

## 📊 What This Service Does

The serverbot is a **24/7 monitoring and analytics service** that runs independently from your main backend:

### **Active Monitors:**
- ✅ **Health Checks** - Every 5 minutes
  - Checks API, frontend, database, Discord bot
  - Stores results in Firebase
  
- ✅ **Metrics Collection** - Every 15 minutes
  - System metrics (uptime, response times)
  - User metrics (signups, active users, conversion rates)
  - Business metrics (revenue, beta spots, waitlist)
  - Email metrics (delivery, bounces, opens)
  
- ✅ **Alert Monitoring** - Every 15 minutes
  - Checks thresholds for all metrics
  - Sends alerts for critical issues
  - Stores alert history
  
- ✅ **Discord Analytics** - Every 6 hours
  - Collects server statistics
  - Member activity, message counts
  - Channel analytics
  
- ✅ **Daily Summary** - Once per day (midnight)
  - Generates daily report
  - Aggregates metrics
  - Stores in Firebase

### **Cost:** Completely FREE! 💰
- Uses Render free tier (background worker)
- No external monitoring services required
- Stores all data in existing Firebase

---

## 🚀 Deployment Steps

### **Step 1: Create New Service on Render**

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Background Worker"**
3. Connect your GitHub repository:
   - Repository: `HelwaAI/TradingBot`
   - Branch: `main` (or `test` for staging)

### **Step 2: Configure Service**

**Name:** `helwa-ai-monitoring-serverbot`

**Root Directory:** `serverbot`

**Runtime:** `Node`

**Build Command:**
```bash
npm install
```

**Start Command:**
```bash
npm start
```

**Plan:** `Free` (completely free!)

### **Step 3: Environment Variables**

Add these environment variables in Render dashboard:

#### **Required Variables:**

```bash
# Backend & Frontend URLs (for health checks)
BACKEND_URL=https://your-backend.render.com
FRONTEND_URL=https://your-frontend.vercel.app

# Discord Bot Token (use same token as main backend)
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Discord Server & Role IDs
DISCORD_SERVER_ID=your_server_id_here
DISCORD_BETA_ROLE_ID=your_beta_role_id_here

# Google Service Account (for Firebase)
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# Node Environment
NODE_ENV=production
```

#### **Important Notes:**

1. **Firebase Credentials:**
   - The `serviceAccountKey.json` file is already in the `serverbot/config/` folder
   - Make sure it's committed to your repo (it's for a separate serverbot instance)
   - Or you can set Firebase credentials as individual env vars if preferred

2. **Backend URL:**
   - Use your production backend URL: `https://tradingbot-XXXX.onrender.com`
   - Or test backend URL for staging

3. **Frontend URL:**
   - Use your Vercel frontend URL: `https://your-app.vercel.app`
   - Or custom domain if you have one

### **Step 4: Deploy**

1. Click **"Create Background Worker"**
2. Render will:
   - Clone your repo
   - Navigate to `serverbot/` folder
   - Run `npm install`
   - Start with `npm start`
3. Watch the logs to confirm successful startup

---

## 📝 Expected Startup Logs

You should see something like this:

```
═══════════════════════════════════════════════════════════
🚀 [SERVERBOT] Starting Helwa AI Monitoring Service
═══════════════════════════════════════════════════════════
📊 Functions:
   • Health Checks: Every 5 minutes
   • Metrics Collection: Every 15 minutes
   • Alert Monitoring: Every 15 minutes
   • Discord Analytics: Every 6 hours
   • Daily Summary: Once per day (midnight)
💾 Storage: Firebase
🔄 Mode: Run immediately + scheduled
💰 Cost: Completely FREE!
═══════════════════════════════════════════════════════════

🔧 [SERVERBOT] Initializing Firebase Admin...
✅ [SERVERBOT] Firebase initialized successfully

═══════════════════════════════════════════════════════════
🤖 [SERVERBOT] Step 1: Initializing Discord Bot
═══════════════════════════════════════════════════════════
✅ [SERVERBOT] Discord bot ready

═══════════════════════════════════════════════════════════
🚀 [SERVERBOT] Step 2: Running Initial Checks
═══════════════════════════════════════════════════════════
⚡ [SERVERBOT] Running health checks...
🏥 [HEALTH CHECK] Checking API health...
   → API Root: ✅ (234ms)
   → API Health: ✅ (123ms)
   → Beta Stats: ✅ (156ms)
   → Waitlist Stats: ✅ (145ms)
✅ [HEALTH CHECK] Complete - Status: HEALTHY

⚡ [SERVERBOT] Collecting metrics...
📊 [METRICS] Collecting system metrics...
   → Uptime: 100.00%
   → Avg API Response: 164ms
📊 [METRICS] Collecting user metrics...
   → Total Users: 42
   → Verified: 38
   → Active Today: 12
   → Signups Today: 3
✅ [METRICS] All metrics collected and stored

═══════════════════════════════════════════════════════════
⏰ [SERVERBOT] Step 3: Activating Schedulers
═══════════════════════════════════════════════════════════
✅ Scheduled: Health checks (every 5 minutes)
✅ Scheduled: Metrics & alerts (every 15 minutes)
✅ Scheduled: Discord analytics (every 6 hours)
✅ Scheduled: Daily summary (midnight)

═══════════════════════════════════════════════════════════
🎉 [SERVERBOT] All systems operational!
═══════════════════════════════════════════════════════════
💡 [SERVERBOT] The monitoring service is now running 24/7

📊 Active Monitors:
   → Health checks every 5 minutes
   → Metrics collection every 15 minutes
   → Discord analytics every 6 hours
   → Daily summaries at midnight

💾 Data Storage:
   → Firebase collections: healthChecks, systemMetrics, alerts
   → View in admin panel: /admin/system-health

💰 Cost: Completely FREE!
   → No external services required
   → Using existing Firebase & Resend

🛑 Press Ctrl+C to stop the serverbot
═══════════════════════════════════════════════════════════
```

---

## 🔍 Firebase Collections Created

The serverbot will create and populate these Firebase collections:

### **1. `healthChecks`**
Stores health check results every 5 minutes
```javascript
{
  overall: 'healthy', // or 'degraded'
  services: {
    api: { healthy: true, averageResponseTime: 164, ... },
    frontend: { healthy: true, responseTime: 234, ... },
    database: { healthy: true, responseTime: 45, ... },
    discordBot: { healthy: true, ... }
  },
  timestamp: Timestamp
}
```

### **2. `systemMetrics`**
Stores aggregated metrics every 15 minutes
```javascript
{
  system: {
    uptimePercent: 99.8,
    averageApiResponseTime: 164,
    ...
  },
  users: {
    totalUsers: 42,
    verifiedUsers: 38,
    activeToday: 12,
    signupsToday: 3,
    verificationRate: 90.48,
    ...
  },
  business: {
    totalRevenue: 2099.58,
    revenueToday: 149.97,
    spotsFilled: 42,
    spotsRemaining: 58,
    ...
  },
  email: {
    sent: 45,
    delivered: 43,
    bounced: 0,
    deliveryRate: 95.56,
    ...
  },
  timestamp: Timestamp
}
```

### **3. `alerts`**
Stores alerts when thresholds are exceeded
```javascript
{
  severity: 'critical', // 'critical', 'warning', or 'info'
  service: 'api',
  message: 'API response time elevated: 3200ms',
  threshold: 2000,
  actual: 3200,
  sentAt: Timestamp,
  acknowledged: false
}
```

### **4. `dailySummaries`**
Daily summary reports generated at midnight
```javascript
{
  period: 'last_24_hours',
  uptime: '99.8%',
  totalAlerts: 2,
  criticalAlerts: 0,
  metrics: {
    newSignups: 8,
    revenueToday: 399.92,
    activeUsers: 23,
    emailsSent: 45,
    emailDeliveryRate: 95.56
  },
  timestamp: Timestamp
}
```

### **5. `discordAnalytics`** (already exists)
Discord server analytics collected every 6 hours

---

## 🎨 Viewing the Data

### **Admin Dashboard (Coming Next!)**

The data is stored in Firebase and will be displayed in your admin panel at:
```
/admin/system-health
```

Features:
- Real-time system status
- Health check history charts
- Metrics dashboards
- Alert viewer
- Service status cards

---

## 🔧 Troubleshooting

### **Issue: Firebase Connection Error**

**Error:** `Failed to initialize Firebase`

**Solution:**
1. Check that `serviceAccountKey.json` exists in `serverbot/config/`
2. Verify it has correct Firebase credentials
3. Or set Firebase credentials as environment variables

### **Issue: Discord Bot Not Connecting**

**Error:** `Discord bot connection failed`

**Solution:**
1. Verify `DISCORD_TOKEN` is correct
2. Check bot has correct permissions
3. Verify bot is added to your Discord server

### **Issue: Health Checks Failing**

**Error:** `API health check failed`

**Solution:**
1. Verify `BACKEND_URL` is correct
2. Make sure backend is deployed and running
3. Check backend has `/api/health` endpoint

### **Issue: High Memory Usage**

If the serverbot uses too much memory:
1. This is unlikely with free tier (512MB)
2. Check logs for memory leaks
3. Restart the service from Render dashboard

---

## 📊 Resource Usage

**Expected Resource Usage (Free Tier):**
- **Memory:** ~100-150MB (well within 512MB limit)
- **CPU:** Minimal (only during checks)
- **Network:** Very low (only health checks)

**Render Free Tier Limits:**
- ✅ 512MB RAM (plenty for our needs)
- ✅ No timeout (runs 24/7)
- ✅ Shared CPU (sufficient)
- ✅ No cost!

---

## 🚦 Health Check Endpoints

The serverbot checks these endpoints:

### **API Endpoints:**
- `GET /` - API root
- `GET /api/health` - Health check
- `GET /api/beta/stats` - Beta stats
- `GET /api/waitlist/stats` - Waitlist stats

### **Frontend:**
- `GET /` - Homepage

### **Database:**
- Direct Firebase connection
- Queries `betaUsers` collection

### **Discord Bot:**
- Checks for recent analytics data
- Verifies bot is collecting data

---

## 📈 Monitoring Schedule

| Task | Frequency | Cron Expression | Purpose |
|------|-----------|----------------|---------|
| Health Checks | Every 5 minutes | `*/5 * * * *` | Ensure all services up |
| Metrics & Alerts | Every 15 minutes | `*/15 * * * *` | Collect data, check thresholds |
| Discord Analytics | Every 6 hours | `0 */6 * * *` | Server statistics |
| Daily Summary | Once per day | `0 0 * * *` | Aggregate daily report |

---

## 🔐 Security Notes

1. **Firebase Credentials:**
   - Keep `serviceAccountKey.json` secure
   - Don't commit to public repos
   - Use separate service account for serverbot

2. **Discord Token:**
   - Never expose in logs or code
   - Regenerate if compromised
   - Use read-only bot permissions

3. **Environment Variables:**
   - All sensitive data in env vars
   - Never hardcode credentials
   - Use Render's secret management

---

## 🎉 Success!

Once deployed, your serverbot will:

✅ Run 24/7 monitoring all services
✅ Store health checks every 5 minutes
✅ Collect comprehensive metrics every 15 minutes
✅ Send alerts when thresholds exceeded
✅ Generate daily summaries
✅ Completely free on Render!

**View the data in your admin dashboard at `/admin/system-health`**

---

## 📧 Support

If you encounter issues:
1. Check Render logs
2. Verify environment variables
3. Test backend/frontend URLs
4. Review Firebase connection
5. Check Discord bot status

---

**Last Updated:** November 11, 2025
**Version:** 2.0.0
**Cost:** FREE! 💰

Happy monitoring! 🎉📊🔍

