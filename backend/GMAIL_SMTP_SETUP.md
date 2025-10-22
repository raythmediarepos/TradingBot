# 📧 Gmail SMTP Setup Guide

We've switched from Mailjet to Gmail SMTP for simpler, more reliable email delivery!

---

## 🔑 Step 1: Generate Gmail App Password

You can't use your regular Gmail password for third-party apps. You need to create an "App Password".

### Option A: If You Have 2-Factor Authentication (2FA) Enabled

1. Go to: https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Select **Mail** for "App"
4. Select **Other (Custom name)** for "Device"
5. Type: `Honeypot AI Backend`
6. Click **Generate**
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)
8. **IMPORTANT:** Remove the spaces when using it (e.g., `abcdefghijklmnop`)

### Option B: If You DON'T Have 2FA Enabled

You need to enable 2FA first:

1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the steps to enable it (use your phone number)
4. Once enabled, go back to **Option A** above

---

## 🔧 Step 2: Update Environment Variables in Render

### Remove Old Mailjet Variables (Optional)
These are no longer needed:
- ~~MAILJET_API_KEY~~
- ~~MAILJET_SECRET_KEY~~
- ~~MAILJET_FROM_EMAIL~~
- ~~MAILJET_FROM_NAME~~

### Add New Gmail Variables

Go to: https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0

Click **Environment**, then add/update these variables:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `GMAIL_USER` | Your Gmail address | `raythmedia.repo@gmail.com` |
| `GMAIL_APP_PASSWORD` | 16-char app password (no spaces) | `abcdefghijklmnop` |
| `EMAIL_FROM_NAME` | Display name for emails | `Honeypot AI` |
| `ADMIN_EMAIL` | Where to send contact forms | `raythmedia.repo@gmail.com` |

**IMPORTANT:** For `GMAIL_APP_PASSWORD`, make sure to:
- Remove ALL spaces from the password
- Use the app password, NOT your regular Gmail password
- Keep it secret!

### Click Save

Render will automatically redeploy (~30 seconds).

---

## 🧪 Step 3: Test Locally First

Update your local `.env` file in the `backend` folder:

```bash
cd "/Users/ramse/Documents/HoneyPot AI/Website/backend"
```

Edit `.env`:
```env
# Gmail SMTP Configuration
GMAIL_USER=raythmedia.repo@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password-no-spaces
EMAIL_FROM_NAME=Honeypot AI
ADMIN_EMAIL=raythmedia.repo@gmail.com

# Firebase (keep existing)
FIREBASE_SERVICE_ACCOUNT=...

# Other (keep existing)
PORT=5001
NODE_ENV=development
```

### Install nodemailer

```bash
cd backend
npm install
```

### Start the server

```bash
npm start
```

### Test it

```bash
cd ..
./debug-mailjet.sh
```

Check your Gmail inbox - you should receive the email!

---

## ✅ Step 4: Deploy to Production

After local testing works:

```bash
# Commit and push changes
git add backend/package.json backend/services/emailService.js
git commit -m "Switch from Mailjet to Gmail SMTP for email delivery"
git push origin main
```

Render will automatically redeploy with the new code.

---

## 🔍 How to Verify It's Working

### Check Render Logs
https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0/logs

**Look for:**
```
📧 [EMAIL] Starting waitlist confirmation email...
   → To: user@example.com
   → Name: John Doe
   → Position: #X
   → From: Honeypot AI <raythmedia.repo@gmail.com>
   → Gmail User: ✓ Set
   → Gmail App Password: ✓ Set
   → Sending email via Gmail SMTP...
✅ [EMAIL SUCCESS] Confirmation email sent!
   → Message ID: <...@gmail.com>
   → Response: 250 2.0.0 OK ...
```

### Check Your Gmail "Sent" Folder

All sent emails will appear in your Gmail "Sent" folder since you're sending from your own account!

### Test From Your Website

1. Go to: https://trading-bot-dusky-two.vercel.app
2. Scroll to waitlist
3. Enter YOUR email address
4. Check your inbox/spam

You should receive the welcome email within seconds!

---

## 🐛 Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
- Make sure you're using the **App Password**, not your regular password
- Remove all spaces from the app password
- Double-check the Gmail address is correct

### Error: "self signed certificate in certificate chain"

**Solution:**
Add this to `.env`:
```env
NODE_TLS_REJECT_UNAUTHORIZED=0
```

(Only for development! Don't use in production)

### Emails going to spam

**Solutions:**
1. Mark the first email as "Not Spam"
2. Add `raythmedia.repo@gmail.com` to your contacts
3. Check the email content for spam trigger words

### Gmail daily sending limit

**Limit:** 500 emails per day for regular Gmail accounts

If you need more, you'll need to:
- Upgrade to Google Workspace (2,000/day)
- Or use a dedicated email service (Mailjet, SendGrid, etc.)

For a waitlist of 100 people, 500/day is plenty!

---

## 📊 Advantages of Gmail SMTP

✅ **Simple setup** - Just Gmail + App Password  
✅ **No verification** - Works instantly  
✅ **Free** - No monthly fees  
✅ **Reliable** - Gmail's infrastructure  
✅ **Professional** - Sends from your actual email  
✅ **Reply-to works** - Users can reply directly  
✅ **Sent folder** - All emails appear in your Gmail Sent folder  

---

## 🔄 Switching Back to Mailjet (If Needed)

If you ever want to switch back to Mailjet or another provider, we kept the email templates. Just update the `emailService.js` file.

---

## 📝 Environment Variables Summary

**Required:**
- `GMAIL_USER` - Your Gmail address
- `GMAIL_APP_PASSWORD` - 16-character app password (no spaces)

**Optional:**
- `EMAIL_FROM_NAME` - Display name (default: "Honeypot AI")
- `ADMIN_EMAIL` - Where to send contact forms (default: same as GMAIL_USER)

---

## 🎉 That's It!

After setup:
1. Emails send from your Gmail account
2. Users receive beautiful HTML emails
3. All sent emails appear in your Gmail Sent folder
4. Users can reply directly to your emails
5. No third-party email service needed!

Simple, reliable, and free! 🚀

