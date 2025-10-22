# 🚀 Deploy Backend to Render - Step by Step

## Prerequisites
✅ GitHub repo pushed (done!)
✅ Firebase credentials ready (done!)

---

## STEP 1: Sign Up / Log In to Render

1. Go to: **https://render.com**
2. Click **"Get Started for Free"** or **"Sign In"**
3. Choose **"Sign in with GitHub"** (easiest option)
4. Authorize Render to access your GitHub repositories

---

## STEP 2: Create New Web Service

1. From your Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** or **"Configure account"** if needed
4. Find your repository: **`raythmediarepos/TradingBot`**
5. Click **"Connect"**

---

## STEP 3: Configure Your Web Service

Fill in these settings **EXACTLY**:

### Basic Settings:
- **Name:** `honeypot-ai-backend` (or whatever you prefer)
- **Region:** `Oregon (US West)` (free tier available)
- **Branch:** `main`
- **Root Directory:** `backend`
  - ⚠️ IMPORTANT: Set this to `backend` (the folder name)

### Build & Deploy Settings:
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Plan:
- **Instance Type:** Select **"Free"** ($0/month)
  - ⚠️ Note: Free instances spin down after 15 mins of inactivity

---

## STEP 4: Add Environment Variables

Click **"Advanced"** to expand environment variables section.

Add these environment variables:

### 1. NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`

### 2. FIREBASE_SERVICE_ACCOUNT (IMPORTANT!)
- **Key:** `FIREBASE_SERVICE_ACCOUNT`
- **Value:** Copy the entire content from this file:
  ```
  /tmp/firebase-credentials-single-line.txt
  ```
  
  To copy it, run this command:
  ```bash
  cat /tmp/firebase-credentials-single-line.txt
  ```
  
  Then copy the ENTIRE output (it should be one long line of JSON)
  
  ⚠️ IMPORTANT: Make sure you copy the ENTIRE line - it should start with `{"type":"service_account"` and end with `}`

---

## STEP 5: Deploy!

1. Click **"Create Web Service"** at the bottom
2. Render will start building your backend
3. Wait 2-3 minutes for the initial deployment
4. You'll see logs like:
   ```
   ==> Building...
   ==> Installing dependencies...
   ==> Starting service...
   ✅ Firebase Admin initialized successfully
   🚀 Honeypot AI Backend running on port 10000
   ```

---

## STEP 6: Get Your Backend URL

Once deployed, Render will give you a URL like:
```
https://honeypot-ai-backend.onrender.com
```

Copy this URL - you'll need it to test!

---

## STEP 7: Test Your Backend

Run these commands to test (replace YOUR-URL with your actual Render URL):

```bash
# Test 1: Health Check
curl https://YOUR-URL.onrender.com/api/health

# Test 2: Waitlist Remaining
curl https://YOUR-URL.onrender.com/api/waitlist/remaining

# Test 3: Join Waitlist
curl -X POST https://YOUR-URL.onrender.com/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"John","lastName":"Doe"}'

# Test 4: Contact Form
curl -X POST https://YOUR-URL.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Jane","lastName":"Smith","message":"Test message"}'
```

---

## 🎯 Expected Results:

✅ **Health Check:** `{"status":"ok","timestamp":"...","service":"Honeypot AI Backend"}`
✅ **Waitlist Remaining:** `{"success":true,"remaining":100,...}`
✅ **Join Waitlist:** `{"success":true,"message":"Successfully added to waitlist!",...}`
✅ **Contact:** `{"success":true,"message":"Thank you for contacting us!",...}`

---

## ⚠️ Important Notes:

### Free Tier Limitations:
- **Spins down after 15 minutes** of inactivity
- **First request after spin-down** takes ~30 seconds to wake up
- **750 hours/month** of uptime (plenty for pre-launch)

### Cold Start Behavior:
- If backend is asleep, first API call will be slow (~30s)
- Subsequent calls are fast
- This is normal for free tier!

---

## 🔧 Troubleshooting:

### "Firebase Admin initialization failed"
- Check that `FIREBASE_SERVICE_ACCOUNT` environment variable is set correctly
- Make sure you copied the ENTIRE JSON string (no truncation)

### "Build failed"
- Check that **Root Directory** is set to `backend`
- Check build logs in Render dashboard

### "Service Unavailable"
- Backend might be spinning down (cold start)
- Wait 30 seconds and try again

---

## 🎉 Success!

Once all tests pass, your backend is live and ready! 

**Next Steps:**
1. Save your Render URL
2. Later, you can connect your frontend to this backend
3. When you're ready to launch, upgrade to paid tier for no cold starts

---

## 📝 Quick Reference:

**Render Dashboard:** https://dashboard.render.com
**Your Service:** Will be at https://dashboard.render.com/web/YOUR-SERVICE-ID
**Logs:** Click on your service → "Logs" tab to see real-time output

