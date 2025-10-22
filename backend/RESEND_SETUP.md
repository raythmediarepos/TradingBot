# 📧 Resend Email Setup Guide

We're using **Resend** for email delivery - it's simple, reliable, and works perfectly on Render!

---

## ✅ Why Resend?

- 🚀 **Super easy setup** - Just an API key
- 🆓 **100 emails/day free** - Perfect for waitlist
- ✨ **No verification hassles** - Works immediately
- 🌐 **HTTP-based API** - No SMTP port issues
- 💪 **Reliable delivery** - Built for developers
- 📧 **Use any "from" email** - Can use `onboarding@resend.dev` for free

---

## 🔑 Step 1: Create Resend Account (2 minutes)

### Sign Up
1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify your email
4. Done! (No additional verification needed)

### Get API Key
1. After login, go to: https://resend.com/api-keys
2. Click **Create API Key**
3. Name: `Honeypot AI Backend`
4. Permissions: **Full Access** (or **Sending access** only)
5. Click **Create**
6. **COPY THE API KEY** (starts with `re_...`)
   - ⚠️ Save it now - you can't see it again!

---

## 🔧 Step 2: Configure Render Environment Variables

Go to: https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0

Click **Environment**, then add these variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `RESEND_API_KEY` | `re_...` (your API key) | **Required** |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` | Use this for testing (free) |
| `EMAIL_FROM_NAME` | `Honeypot AI` | Display name |
| `ADMIN_EMAIL` | `raythmedia.repo@gmail.com` | For contact forms |

**Click Save** - Render will redeploy automatically (~30 seconds).

---

## 📨 About "From" Email Addresses

### Option 1: Use Resend's Testing Email (Easiest)
**Email:** `onboarding@resend.dev`  
**Cost:** FREE ✅  
**Setup:** None needed  
**Limitations:** Shows "via resend.com" in email clients

This is perfect for:
- Testing
- Waitlist emails
- Internal notifications

### Option 2: Use Your Own Domain (Advanced)
**Email:** `hello@honeypotai.com`  
**Cost:** FREE (if you own the domain)  
**Setup:** Add DNS records to your domain  
**Benefits:** Professional, no "via resend.com"

Steps:
1. Buy a domain (honeypotai.com)
2. In Resend, go to **Domains** → **Add Domain**
3. Add DNS records (SPF, DKIM, DMARC)
4. Verify domain
5. Update `RESEND_FROM_EMAIL` to your domain email

**For now, use Option 1!**

---

## 🧪 Step 3: Test It!

After Render finishes redeploying:

### From Terminal
```bash
cd "/Users/ramse/Documents/HoneyPot AI/Website"
./debug-mailjet.sh
```

### From Website
1. Go to: https://trading-bot-dusky-two.vercel.app
2. Join the waitlist
3. Check your email inbox

### Check Resend Dashboard
1. Go to: https://resend.com/emails
2. You'll see all sent emails
3. Click on any email to see delivery status

---

## 📊 Resend Free Tier Limits

| Feature | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Emails/day** | 100 | Unlimited |
| **Emails/month** | 3,000 | Unlimited |
| **API calls** | Unlimited | Unlimited |
| **From emails** | 1 (resend.dev) | Unlimited |
| **Custom domains** | ❌ | ✅ Unlimited |
| **Email logs** | 30 days | 90 days |

**100 emails/day** is perfect for your waitlist of 100 people!

---

## 🔍 Monitoring Emails

### Resend Dashboard
**URL:** https://resend.com/emails

You can see:
- ✅ Delivered emails
- 📧 Email content preview
- 📊 Open rates (if tracking enabled)
- 🚫 Bounces and failures
- ⏱️ Delivery timestamps

### Render Logs
**URL:** https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs

Look for:
```
📧 [EMAIL] Starting waitlist confirmation email...
✅ [EMAIL SUCCESS] Confirmation email sent!
   → Email ID: abc123...
```

---

## 🐛 Troubleshooting

### Error: "API key is invalid"
**Solution:** 
- Double-check the API key in Render
- Make sure it starts with `re_`
- Create a new API key if needed

### Error: "Rate limit exceeded"
**Solution:**
- You've hit the 100 emails/day limit
- Wait until tomorrow
- Or upgrade to paid plan ($20/month for unlimited)

### Emails not arriving
**Check:**
1. Spam/junk folder
2. Resend dashboard - is email marked as "Delivered"?
3. Render logs - did email send successfully?

### Want to use your own domain
**Steps:**
1. Buy domain (e.g., honeypotai.com)
2. Resend → Domains → Add Domain
3. Add DNS records provided by Resend
4. Wait for verification (can take up to 48 hours)
5. Update `RESEND_FROM_EMAIL` to `hello@honeypotai.com`

---

## 📝 Environment Variables Summary

**Required:**
- `RESEND_API_KEY` - Your Resend API key (starts with `re_`)

**Optional:**
- `RESEND_FROM_EMAIL` - Sender email (default: `onboarding@resend.dev`)
- `EMAIL_FROM_NAME` - Display name (default: "Honeypot AI")
- `ADMIN_EMAIL` - For contact forms (default: uses RESEND_FROM_EMAIL)

---

## 🎉 You're All Set!

After setup:
- ✅ Emails send instantly
- ✅ No SMTP issues
- ✅ Works on any hosting
- ✅ Beautiful HTML emails
- ✅ Reliable delivery
- ✅ Easy monitoring

**Welcome to hassle-free email delivery!** 🚀

---

## 🔗 Useful Links

- **Resend Dashboard:** https://resend.com/
- **API Documentation:** https://resend.com/docs
- **Email Logs:** https://resend.com/emails
- **API Keys:** https://resend.com/api-keys
- **Domains:** https://resend.com/domains

