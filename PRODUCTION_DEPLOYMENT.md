# 🚀 Production Deployment Guide - Helwa AI

Complete guide to deploy Helwa AI to production.

## 📋 Pre-Deployment Checklist

### ✅ What You Need
- [ ] GitHub repository pushed (✅ Done!)
- [ ] Custom domain: `helwa.ai`
- [ ] Vercel account
- [ ] Render account
- [ ] Stripe account (production keys)
- [ ] Resend account (production API key)
- [ ] Firebase project (production)
- [ ] Discord bot (production server)

---

## 🎨 Part 1: Deploy Frontend to Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `raythmediarepos/TradingBot`
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave as root)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Step 2: Add Environment Variables to Vercel

Click **"Environment Variables"** and add:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://helwa-ai-backend.onrender.com

# Analytics (if you have them)
# NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### Step 3: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like: `helwa-ai.vercel.app`

### Step 4: Add Custom Domain

1. Go to **Settings** → **Domains**
2. Add your custom domain: `helwa.ai`
3. Also add: `www.helwa.ai`
4. Vercel will provide DNS records to add to your domain registrar

**DNS Records to Add:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## 🔧 Part 2: Deploy Backend to Render

### Step 1: Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `raythmediarepos/TradingBot`
4. Configure:
   - **Name:** `helwa-ai-backend`
   - **Region:** Oregon (US West) or closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** Starter ($7/month)

### Step 2: Add Environment Variables to Render

Go to **Environment** tab and add all these variables:

```bash
# Server Configuration
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://helwa.ai
JWT_SECRET=your_super_secure_random_string_here

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email Service (Resend)
RESEND_API_KEY=re_your_production_resend_api_key
EMAIL_FROM=noreply@helwa.ai

# Stripe (PRODUCTION keys!)
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_production_stripe_publishable_key
STRIPE_BETA_PRICE_ID=price_1SP9kaRNPHYdH4XhCflZ9Oiz
STRIPE_BETA_PRODUCT_ID=prod_TLrTEh96NFpxYs
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Discord Bot
DISCORD_BOT_TOKEN=your_production_discord_bot_token
DISCORD_GUILD_ID=1401079321476731052
DISCORD_BETA_ROLE_ID=1433005563192676485
DISCORD_UNVERIFIED_ROLE_ID=1433946228605059162
DISCORD_WELCOME_CHANNEL_ID=1433235355162906645
DISCORD_SERVER_INVITE_URL=https://discord.gg/your_server_invite
```

### Step 3: Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (~3-5 minutes)
3. You'll get a URL like: `https://helwa-ai-backend.onrender.com`

### Step 4: Update Frontend with Backend URL

1. Go back to Vercel dashboard
2. Go to your project → **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to your Render URL:
   ```
   NEXT_PUBLIC_API_URL=https://helwa-ai-backend.onrender.com
   ```
4. Go to **Deployments** tab
5. Click **"Redeploy"** on the latest deployment

---

## 🔐 Part 3: Configure Production Services

### Firebase Production Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing): `helwa-ai-production`
3. Enable Firestore Database
4. Create indexes (if needed):
   - Go to Firestore → **Indexes** tab
   - The app will log index URLs when needed
5. Download Service Account Key:
   - Go to **Project Settings** → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Use these credentials in Render environment variables

### Stripe Production Setup

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch to LIVE mode** (toggle in top left)
3. Get your production keys:
   - Go to **Developers** → **API Keys**
   - Copy **Publishable key** and **Secret key**
4. Verify your product/price IDs exist in production
5. Set up webhook:
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - Endpoint URL: `https://helwa-ai-backend.onrender.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`
   - Copy the webhook secret

### Resend Production Setup

1. Go to [Resend Dashboard](https://resend.com/dashboard)
2. Verify your domain `helwa.ai`:
   - Go to **Domains** → **Add Domain**
   - Add DNS records provided by Resend
3. Get production API key:
   - Go to **API Keys**
   - Create new key for production
4. Update `EMAIL_FROM` to use your domain: `noreply@helwa.ai`

### Discord Production Setup

1. Your Discord bot is already set up (same bot token works for production)
2. Make sure your production server has:
   - ✅ Beta Tester role (ID: 1433005563192676485)
   - ✅ Unverified role (ID: 1433946228605059162)
   - ✅ Welcome channel (ID: 1433235355162906645)
3. The bot should auto-configure permissions on first run

---

## ✅ Part 4: Verify Deployment

### Test Backend

```bash
# Check health endpoint
curl https://helwa-ai-backend.onrender.com/health

# Should return: {"status":"healthy","timestamp":"..."}
```

### Test Frontend

1. Visit: `https://helwa.ai` (or your Vercel URL)
2. Check that all pages load
3. Test beta signup flow
4. Check Discord bot connection in Render logs

### Check Logs

**Render Logs:**
1. Go to your Render service
2. Click **"Logs"** tab
3. Look for:
   - ✅ Firebase initialized
   - ✅ Discord bot connected
   - ✅ Server running on port 5001

**Vercel Logs:**
1. Go to your Vercel project
2. Click **"Deployments"**
3. Click on latest deployment
4. Check for build errors

---

## 🔄 Part 5: Post-Deployment

### Update Stripe Redirect URLs

1. Go to Stripe Dashboard → **Payments** → **Checkout**
2. Update success/cancel URLs to production domain
3. Or update in code and redeploy

### Update Discord Bot Presence

The bot will automatically show as online in your Discord server.

### Monitor

- **Vercel Analytics:** Check traffic and performance
- **Render Metrics:** Monitor CPU/memory usage
- **Firebase Console:** Monitor database reads/writes
- **Stripe Dashboard:** Monitor payments

---

## 🚨 Troubleshooting

### Frontend Issues

**Problem:** Page won't load or shows errors
- Check Vercel deployment logs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

### Backend Issues

**Problem:** API not responding
- Check Render logs for errors
- Verify all environment variables are set
- Check if Firebase credentials are correct

**Problem:** Discord bot not connecting
- Verify `DISCORD_BOT_TOKEN` is correct
- Check if bot is invited to server with correct permissions
- Check Render logs for connection errors

### Database Issues

**Problem:** Firestore queries failing
- Check Firebase console for errors
- Verify indexes are created
- Check if service account has correct permissions

---

## 📊 Cost Breakdown

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Pro | $20/month |
| **Render** | Starter | $7/month |
| **Firebase** | Pay-as-you-go | ~$0-5/month |
| **Resend** | Free tier | $0 (1000 emails/month) |
| **Stripe** | Pay-as-you-go | 2.9% + 30¢ per transaction |
| **Total** | | **~$27-32/month** |

---

## 🎯 Next Steps After Production Launch

1. ✅ Monitor first signups
2. ✅ Test payment flow with real transaction
3. ✅ Verify Discord invites work
4. ✅ Check email delivery
5. ✅ Set up error monitoring (Sentry/LogRocket)
6. ✅ Create staging environment for testing future changes

---

## 📝 Quick Reference

### Production URLs
- **Frontend:** https://helwa.ai
- **Backend:** https://helwa-ai-backend.onrender.com
- **Discord:** Your Discord server

### Important Endpoints
- Health Check: `GET /health`
- Beta Signup: `POST /api/beta/signup`
- Payment: `POST /api/beta/create-checkout`
- Discord Invite: `POST /api/user/generate-discord-invite`

---

**Ready to deploy? Let's do this! 🚀**

