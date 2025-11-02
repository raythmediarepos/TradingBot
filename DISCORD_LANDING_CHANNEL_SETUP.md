# 🚪 Discord Landing Channel Setup Guide

## 🎯 Goal

Create a landing channel where new members:
- ✅ Can see instructions
- ❌ Cannot access any other channels until verified
- ✅ Get guided through verification process

---

## 📋 Step-by-Step Setup

### Step 1: Create Welcome Channel

1. **Create new text channel**
   - Name: `#welcome` or `#verify-here`
   - Category: Create a new category called "Landing" (optional)

2. **Get Channel ID**
   - Right-click the channel
   - Click "Copy Channel ID"
   - Save this for later

---

### Step 2: Configure Welcome Channel Permissions

**Right-click #welcome → Edit Channel → Permissions**

#### @everyone (Unverified Users)
- ✅ **View Channel**: Allow (green ✓)
- ❌ **Send Messages**: Deny (red X) - Read only!
- ❌ **Add Reactions**: Deny (red X)
- ❌ **Create Threads**: Deny (red X)

#### Beta Tester Role
- ❌ **View Channel**: Deny (red X) - They don't need this channel
- OR leave blank if you want verified users to see it too

#### Helwa AI Trading Bot (Your Bot)
- ✅ **View Channel**: Allow (green ✓)
- ✅ **Send Messages**: Allow (green ✓)
- ✅ **Embed Links**: Allow (green ✓)
- ✅ **Mention @everyone, @here, and All Roles**: Allow (green ✓)

**Click "Save Changes"**

---

### Step 3: Hide ALL Other Channels

For **EVERY other channel** (#general, #beta-signals, #announcements, etc.):

1. **Right-click channel** → **Edit Channel** → **Permissions**

2. **Click "Advanced Permissions"** (if not already showing)

3. **@everyone role**:
   - ❌ **View Channel**: **DENY** (red X) ⚠️ CRITICAL!
   - This prevents unverified users from seeing the channel

4. **Beta Tester role**:
   - ✅ **View Channel**: **Allow** (green ✓)
   - ✅ **Send Messages**: **Allow** (green ✓)
   - ✅ **Read Message History**: **Allow** (green ✓)
   - Set other permissions as needed

5. **Click "Save Changes"**

**Repeat for ALL channels except #welcome!**

---

### Step 4: Post Welcome Message

In the `#welcome` channel, post this message (and pin it):

```
# 🐝 Welcome to Helwa AI Beta!

**Thank you for joining!** To access the beta channels and start receiving trading signals, please verify your account.

---

## 📋 How to Verify in 3 Steps:

### 1️⃣ Check Your DMs
Our bot **@Helwa AI Trading Bot** has sent you a **Direct Message** with verification instructions.

> 💡 **Don't see the DM?** Check your **Message Requests** folder (top left in Discord)

### 2️⃣ Get Your Verification Code
- Go to your dashboard: **https://helwa.ai/dashboard**
- Click **"Generate Discord Invite"** (if you haven't already)
- **Copy the verification code** from the yellow box
  - Format: `discord_xxxxxxxxxxxxxxxxx`

### 3️⃣ Send Code to Bot
- Open the DM from **@Helwa AI Trading Bot**
- **Paste ONLY the verification code** (nothing else)
- Bot will verify you and assign the **Beta Tester** role ✅

---

## ✅ After Verification

Once verified, you'll instantly see:
- 📊 **#beta-signals** - Real-time trading signals
- 💬 **#beta-discussion** - Chat with other testers
- 📢 **#announcements** - Important updates
- 🐛 **#bug-reports** - Report issues
- ℹ️ **#support** - Get help

---

## 🚨 Troubleshooting

### ❌ "I don't see a DM from the bot"

**Cause:** Discord DMs are disabled

**Fix:**
1. Click your profile picture (bottom left)
2. **User Settings** → **Privacy & Safety**
3. Enable: **"Allow direct messages from server members"**
4. **Leave this server** and **rejoin** using your invite link
5. Bot will DM you again

### ❌ "I lost my verification code"

**Fix:**
1. Go to **https://helwa.ai/dashboard**
2. The code is displayed in **Step 2** (yellow box)
3. Click the **Copy** button
4. If expired, generate a new invite

### ❌ "The bot says my code is invalid"

**Fix:**
- Make sure you're sending the **entire code** (starts with `discord_`)
- Use the **Copy button** on the dashboard (don't type manually)
- Send **ONLY the code** (no extra text)
- Make sure the code hasn't expired (7 days)

### ❌ "Nothing happens after I send the code"

**Check:**
- Did you send it in a **DM to the bot** (not in this channel)?
- Did you copy the **full code** including `discord_` prefix?
- Is the code from **your dashboard** (not someone else's)?

---

## ⏳ Important

**Please complete verification within 24 hours** to maintain your beta spot!

---

## 🆘 Still Need Help?

- **Tag @admin** in this channel
- **Email:** support@helwa.ai
- **Reply to your beta welcome email**

We're here to help! 🐝
```

**To pin:** Right-click the message → Pin Message

---

### Step 5: Add Welcome Channel ID to Backend

1. **Copy your welcome channel ID** (from Step 1)

2. **Add to `.env` file:**
```bash
DISCORD_WELCOME_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
```

Example:
```bash
DISCORD_WELCOME_CHANNEL_ID=1234567890123456789
```

3. **Restart backend** for changes to take effect

---

### Step 6: Test the Flow

1. **Create a test account** (or use alt Discord account)
2. **Join server** using invite link
3. **Check:**
   - ✅ Can see #welcome channel
   - ❌ Cannot see any other channels
   - ✅ Receives bot DM
   - ✅ Bot posts in #welcome channel
4. **Send verification code** to bot
5. **Check:**
   - ✅ Gets Beta Tester role
   - ✅ Can now see all beta channels
   - ❌ #welcome channel disappears (if you set it to hide)

---

## 🎨 Optional: Category Organization

Organize your channels into categories:

### 🚪 Landing (Unverified Users)
- `#welcome` ← Only channel visible to unverified users

### 📢 Beta Channels (Beta Testers Only)
- `#announcements`
- `#beta-signals`
- `#beta-discussion`
- `#bug-reports`
- `#support`

### 🛠️ Admin (Admins Only)
- `#admin-chat`
- `#mod-logs`

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Created #welcome channel
- [ ] Set @everyone can VIEW #welcome (but not send messages)
- [ ] Set Bot can SEND MESSAGES in #welcome
- [ ] All other channels DENY @everyone View Channel
- [ ] All other channels ALLOW Beta Tester View Channel
- [ ] Posted and pinned welcome message in #welcome
- [ ] Added DISCORD_WELCOME_CHANNEL_ID to .env
- [ ] Restarted backend
- [ ] Tested with alt account

---

## 🔄 What Happens Now

### When User Joins:
```
1. User clicks invite link → Joins server
2. User sees ONLY #welcome channel
3. Bot sends DM with instructions
4. Bot posts in #welcome: "Welcome @user! Check your DMs"
5. User can read pinned message for help
```

### If DMs Fail:
```
1. Bot detects DM failure
2. Bot posts in #welcome: "@user - I couldn't DM you! Enable DMs..."
3. User sees message
4. User enables DMs
5. User leaves and rejoins
6. Bot sends DM successfully
```

### After Verification:
```
1. User sends code to bot
2. Bot assigns Beta Tester role
3. #welcome disappears (if configured)
4. All beta channels appear
5. Welcome message in #beta-discussion
```

---

## 🎯 Benefits

✅ **Clear onboarding** - Users know exactly what to do  
✅ **Reduced confusion** - Step-by-step instructions  
✅ **Self-service** - Most users verify without help  
✅ **Fallback support** - Bot notifies in channel if DMs fail  
✅ **Clean server** - Verified users don't see landing channel  

---

## 📊 Channel Visibility Matrix

| Channel | @everyone | Beta Tester | Bot | Admin |
|---------|-----------|-------------|-----|-------|
| #welcome | ✅ View Only | ❌ Hidden | ✅ Full | ✅ Full |
| #announcements | ❌ Hidden | ✅ Full | ✅ Full | ✅ Full |
| #beta-signals | ❌ Hidden | ✅ Full | ✅ Full | ✅ Full |
| #beta-discussion | ❌ Hidden | ✅ Full | ✅ Full | ✅ Full |
| All others | ❌ Hidden | ✅ Full | ✅ Full | ✅ Full |

---

**Your landing channel is now set up! 🎉**

New users will have a clear path to verification and won't be overwhelmed by channels they can't access.

