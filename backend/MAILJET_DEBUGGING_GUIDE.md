# 🔍 Mailjet Debugging Guide

## Where to Find Mailjet Logs

### Method 1: Message History (Best for Debugging)

1. Go to: https://app.mailjet.com/
2. Click **Transactional** in left sidebar
3. Click **Message History**
4. You'll see a table with columns:
   - **Date/Time**
   - **From**
   - **To**
   - **Subject**
   - **Status** ← This is what you need!

**Search Tips:**
- Use the search box to find specific email addresses
- Filter by date range (top right)
- Click on a message to see full details including error messages

---

### Method 2: Statistics Dashboard

1. Go to: https://app.mailjet.com/
2. Click **Statistics** in left sidebar
3. Click **Transactional Messages**
4. Set time filter to "Last 1 hour" or "Today"
5. Scroll down to see message counts and statuses

---

## 📊 Understanding Email Statuses

| Status | Meaning | Action Needed |
|--------|---------|---------------|
| **Queued** | Waiting to send | Wait a few seconds |
| **Sent** | Left Mailjet servers | Wait for delivery confirmation |
| **Delivered** ✅ | Successfully delivered | Check recipient inbox/spam |
| **Opened** ✅ | Recipient opened email | Success! |
| **Blocked** ❌ | Mailjet blocked it | Check sender verification |
| **Bounced** ❌ | Recipient server rejected | Invalid email or spam filter |
| **Soft Bounce** ⚠️ | Temporary issue | Will retry automatically |
| **Hard Bounce** ❌ | Permanent failure | Email doesn't exist |
| **Spam** ❌ | Marked as spam | Check email content/sender reputation |

---

## 🔍 Common Issues & Solutions

### Issue 1: No Messages in History
**Problem:** Nothing shows up in Message History  
**Causes:**
- API keys are incorrect
- Request never reached Mailjet
- Wrong Mailjet account logged in

**Solution:**
1. Check Render logs - does it show "✅ [EMAIL SUCCESS]"?
2. Verify you're logged into correct Mailjet account
3. Check API keys in Render match your Mailjet account

---

### Issue 2: Status = "Blocked"
**Problem:** Mailjet blocked the email before sending  
**Causes:**
- Sender email not verified
- Sender email doesn't exist
- Account not fully set up

**Solution:**
1. Go to Account Settings → Sender Addresses & Domains
2. Make sure sender email has "Active" status
3. If not, verify the email address

---

### Issue 3: Status = "Bounced"
**Problem:** Recipient's email provider rejected it  
**Causes:**
- First email from new domain → spam filter
- Content looks like spam
- Sender reputation low (new account)

**Solution:**
1. Check recipient's spam folder
2. Try sending to YOUR own email first
3. Mark as "Not Spam" to build reputation
4. Consider domain authentication (SPF, DKIM, DMARC)

---

### Issue 4: Status = "Delivered" but Not in Inbox
**Problem:** Mailjet says delivered but user can't find it  
**Causes:**
- In spam/junk folder
- In promotions/social tab (Gmail)
- Email filtering rules

**Solution:**
1. Check ALL folders:
   - Spam/Junk
   - Promotions (Gmail)
   - Updates (Gmail)
   - Social (Gmail)
2. Search inbox for "Honeypot"
3. Search for sender email
4. Check "All Mail" in Gmail

---

## 🧪 How to Test Properly

### Test 1: Send to Your Own Email
```bash
# Join waitlist with your own email
# Check if YOU receive it
```

**Why:** Rules out recipient issues

### Test 2: Check Mailjet Immediately After
1. Send test email
2. Within 30 seconds, check Mailjet Message History
3. Should see the message with status

**Why:** Confirms API is working

### Test 3: Try Different Email Providers
- Gmail
- Yahoo
- Outlook/Hotmail
- ProtonMail

**Why:** Some providers have stricter spam filters

---

## 📧 Mailjet Account Setup Checklist

Make sure these are configured:

- [ ] ✅ Account verified (email confirmation)
- [ ] ✅ At least one sender email verified
- [ ] ✅ API keys created and copied correctly
- [ ] ✅ Not in "sandbox mode" (some email services have this)
- [ ] ✅ No sending limits hit (check dashboard for limits)

---

## 🔗 Useful Mailjet Links

**Message History:**  
https://app.mailjet.com/transactional/messages

**Statistics:**  
https://app.mailjet.com/stats/transactional-messages

**Sender Addresses:**  
https://app.mailjet.com/account/sender

**API Keys:**  
https://app.mailjet.com/account/apikeys

**Event API (Real-time logs):**  
https://app.mailjet.com/account/triggers

---

## 💡 Pro Tip: Enable Webhooks for Real-Time Notifications

1. Go to: https://app.mailjet.com/account/triggers
2. Add webhook URL (future enhancement)
3. Get notified instantly when emails are delivered/bounced/opened

---

## 🆘 Still Not Working?

If you've checked everything and emails still aren't sending:

1. **Copy the Render logs** (especially the email section)
2. **Screenshot Mailjet Message History**
3. **Screenshot Mailjet Sender Addresses page**
4. Share these and we can diagnose further

The logs will tell us exactly where the issue is!


