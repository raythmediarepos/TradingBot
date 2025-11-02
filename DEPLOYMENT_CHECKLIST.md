# ✅ Production Deployment Checklist

## 🎯 Quick Start Guide

Follow these steps in order to deploy Helwa AI to production.

---

## Phase 1: Prepare (10 minutes)

### 1. Gather All Credentials

- [ ] **Stripe Production Keys** (switch to LIVE mode)
  - [ ] Secret Key: `sk_live_...`
  - [ ] Publishable Key: `pk_live_...`
  - [ ] Product ID: `prod_TLrTEh96NFpxYs`
  - [ ] Price ID: `price_1SP9kaRNPHYdH4XhCflZ9Oiz`

- [ ] **Firebase Production**
  - [ ] Project ID
  - [ ] Service Account JSON downloaded

- [ ] **Resend Production**
  - [ ] API Key: `re_...`
  - [ ] Domain verified: `helwa.ai`

- [ ] **Discord Bot**
  - [ ] Bot Token (already have)
  - [ ] Guild ID: `1401079321476731052`
  - [ ] Role IDs verified

- [ ] **Generate JWT Secret**
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```

---

## Phase 2: Deploy Backend (20 minutes)

### 1. Create Render Web Service

1. Go to: https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repo: `raythmediarepos/TradingBot`

### 2. Configure Service

- **Name:** `helwa-ai-backend`
- **Region:** Oregon (US West)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `node server.js`
- **Plan:** Starter ($7/month)

### 3. Add Environment Variables

Copy-paste this template and fill in your values:

```bash
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://helwa.ai
JWT_SECRET=[paste_generated_jwt_secret]

# Firebase
FIREBASE_PROJECT_ID=[your_project_id]
FIREBASE_CLIENT_EMAIL=[your_client_email]
FIREBASE_PRIVATE_KEY="[paste_entire_private_key_with_newlines]"

# Resend
RESEND_API_KEY=[your_production_resend_key]
EMAIL_FROM=noreply@helwa.ai

# Stripe (LIVE MODE!)
STRIPE_SECRET_KEY=[sk_live_...]
STRIPE_PUBLISHABLE_KEY=[pk_live_...]
STRIPE_BETA_PRICE_ID=price_1SP9kaRNPHYdH4XhCflZ9Oiz
STRIPE_BETA_PRODUCT_ID=prod_TLrTEh96NFpxYs
STRIPE_WEBHOOK_SECRET=[leave_empty_for_now]

# Discord
DISCORD_BOT_TOKEN=[your_bot_token]
DISCORD_GUILD_ID=1401079321476731052
DISCORD_BETA_ROLE_ID=1433005563192676485
DISCORD_UNVERIFIED_ROLE_ID=1433946228605059162
DISCORD_WELCOME_CHANNEL_ID=1433235355162906645
DISCORD_SERVER_INVITE_URL=https://discord.gg/your_invite
```

### 4. Deploy & Get Backend URL

- [ ] Click **"Create Web Service"**
- [ ] Wait for deployment (~3-5 minutes)
- [ ] Copy your backend URL: `https://helwa-ai-backend.onrender.com`
- [ ] Test it: Visit `/health` endpoint

---

## Phase 3: Deploy Frontend (15 minutes)

### 1. Create Vercel Project

1. Go to: https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import: `raythmediarepos/TradingBot`

### 2. Configure Project

- **Framework:** Next.js
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build`
- **Install Command:** `npm install`

### 3. Add Environment Variable

```bash
NEXT_PUBLIC_API_URL=https://helwa-ai-backend.onrender.com
```

(Replace with your actual Render URL from Phase 2)

### 4. Deploy

- [ ] Click **"Deploy"**
- [ ] Wait for deployment (~2-3 minutes)
- [ ] Copy your Vercel URL: `https://helwa-ai.vercel.app`
- [ ] Test it: Visit the URL in browser

---

## Phase 4: Configure Custom Domain (10 minutes)

### 1. Add Domain to Vercel

1. In Vercel project → **Settings** → **Domains**
2. Add domain: `helwa.ai`
3. Add domain: `www.helwa.ai`

### 2. Update DNS Records

Go to your domain registrar (e.g., GoDaddy, Namecheap) and add:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### 3. Wait for DNS Propagation

- Usually takes 5-30 minutes
- Vercel will show "Valid Configuration" when ready
- Your site will be live at `https://helwa.ai`

---

## Phase 5: Configure Production Services (15 minutes)

### 1. Stripe Webhook

1. Go to: https://dashboard.stripe.com/webhooks (LIVE mode)
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://helwa-ai-backend.onrender.com/api/stripe/webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Webhook Secret** (starts with `whsec_...`)
6. Add to Render environment variables:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
7. In Render, click **"Manual Deploy"** → **"Deploy latest commit"**

### 2. Resend Domain Verification

1. Go to: https://resend.com/domains
2. Click **"Add Domain"** → Enter `helwa.ai`
3. Add these DNS records to your domain:

```
Type: TXT
Name: @
Value: [provided by Resend]

Type: MX
Name: @
Value: [provided by Resend]
Priority: 10

Type: CNAME
Name: resend._domainkey
Value: [provided by Resend]
```

4. Click **"Verify DNS Records"**

### 3. Firebase Production Database

1. Go to: https://console.firebase.google.com/
2. Select your production project
3. Go to **Firestore Database**
4. Ensure database is created
5. Indexes will be created automatically when needed (check logs)

---

## Phase 6: Testing (15 minutes)

### 1. Test Backend Health

```bash
curl https://helwa-ai-backend.onrender.com/health
```

Expected: `{"status":"healthy","timestamp":"..."}`

### 2. Test Full Beta Signup Flow

1. Visit: `https://helwa.ai/beta/signup`
2. Fill out form and submit
3. Check email for verification link
4. Click verification link
5. If not free slot, complete payment
6. Login to dashboard
7. Generate Discord invite
8. Join Discord and verify

### 3. Check Logs

**Render:**
- Look for: ✅ Firebase initialized, Discord bot connected

**Vercel:**
- Check for any build errors in deployments

### 4. Test Discord Bot

1. Check bot is online in Discord server
2. Send verification token to bot
3. Verify bot assigns Beta Tester role

---

## Phase 7: Monitor (Ongoing)

### Daily Checks

- [ ] Check Render logs for errors
- [ ] Monitor Stripe dashboard for payments
- [ ] Check Firebase usage
- [ ] Monitor Discord for issues

### Analytics Setup (Optional)

- [ ] Set up Google Analytics
- [ ] Add error monitoring (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)

---

## 🚨 Emergency Rollback

If something goes wrong:

1. **Vercel:** Go to Deployments → Click on previous deployment → **"Promote to Production"**
2. **Render:** Go to Events → Find previous deploy → **"Redeploy"**

---

## 📞 Quick Support Links

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Stripe Docs:** https://stripe.com/docs
- **Resend Docs:** https://resend.com/docs
- **Discord.js Docs:** https://discord.js.org/

---

## ✅ Deployment Complete!

Once all phases are done:
- ✅ Your site is live at `https://helwa.ai`
- ✅ Backend is running on Render
- ✅ Database is connected
- ✅ Payments are working
- ✅ Discord bot is active
- ✅ Emails are sending

**You're live! 🎉**

Time to announce your beta program and start getting signups!

---

## 📝 Post-Launch Tasks

1. [ ] Test a real payment with a card
2. [ ] Announce beta program on social media
3. [ ] Monitor first user signups
4. [ ] Set up staging environment (for future changes)
5. [ ] Document any issues encountered
6. [ ] Create internal playbook for handling support requests


