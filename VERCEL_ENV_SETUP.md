# Vercel Environment Variable Setup

## Problem
Your Vercel frontend is still pointing to `http://localhost:5001` (default fallback) instead of your production Render backend.

## Solution
Add the backend URL as an environment variable in Vercel.

---

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
👉 https://vercel.com/dashboard

### 2. Select Your Project
Click on **trading-bot-7fi8** (or whatever your project name is)

### 3. Go to Settings
Click **Settings** in the top navigation

### 4. Click Environment Variables
In the left sidebar, click **Environment Variables**

### 5. Add New Variable
Click **Add New** button and enter:

**Key (Name):**
```
NEXT_PUBLIC_BACKEND_URL
```

**Value:**
```
https://tradingbot-w843.onrender.com
```

**Environments to Apply:**
- ✅ Production
- ✅ Preview  
- ✅ Development

### 6. Save
Click **Save**

### 7. Redeploy
After saving, you MUST redeploy for the change to take effect:

**Option A: Redeploy from Vercel**
- Go to **Deployments** tab
- Click the ⋮ (three dots) on the latest deployment
- Click **Redeploy**

**Option B: Push to GitHub**
Make any small change (like updating a comment) and push:
```bash
cd "/Users/ramse/Documents/HoneyPot AI/Website"
git add .
git commit -m "Configure production backend URL"
git push origin main
```

---

## Verify It Works

After redeployment completes (~2 minutes):

1. Go to your live site: **https://trading-bot-7fi8.vercel.app**
2. Scroll to the waitlist form
3. Try joining the waitlist
4. Check Render logs: https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs

You should see detailed logs appear in Render! 🎉

---

## What Was The Problem?

In your `waitlist-form.tsx`:
```typescript
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
```

Without the env var set in Vercel, it was using the fallback `http://localhost:5001`, which doesn't exist in production.

Now it will use `https://tradingbot-w843.onrender.com` ✅


