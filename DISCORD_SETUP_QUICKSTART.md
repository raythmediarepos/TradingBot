# ⚡ Discord Setup Quickstart

Get your Discord server set up in **5 minutes**!

---

## ✅ Prerequisites

- [ ] Discord Server created
- [ ] Discord Bot created (from Discord Developer Portal)
- [ ] Bot invited to your server
- [ ] "Beta Tester" role created in Discord

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your IDs

#### 1.1 Enable Developer Mode in Discord
1. Discord → User Settings (⚙️) → Advanced
2. Enable "Developer Mode" ✅

#### 1.2 Copy Server ID
1. Right-click your server icon
2. Click "Copy Server ID"
3. Paste somewhere temporarily

#### 1.3 Copy Role ID
1. Server Settings → Roles
2. Right-click "Beta Tester" role
3. Click "Copy Role ID"
4. Paste somewhere temporarily

#### 1.4 Get Bot Token
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Bot section → Copy Bot Token
4. **Keep this secret!**

---

### Step 2: Update `.env` File

Open `backend/.env` and add:

```bash
# DISCORD BOT CONFIGURATION
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN_HERE
DISCORD_GUILD_ID=YOUR_SERVER_ID_HERE
DISCORD_BETA_ROLE_ID=YOUR_ROLE_ID_HERE
DISCORD_AUTO_SETUP=true

# This will be auto-filled after first run
DISCORD_WELCOME_CHANNEL_ID=

# Your permanent server invite (create in Discord)
DISCORD_SERVER_INVITE_URL=https://discord.gg/your-invite
```

---

### Step 3: Start Backend

```bash
cd backend
npm start
```

**Watch the console!** You'll see:

```
🤖 [DISCORD BOT] Connected successfully
🔧 [DISCORD BOT] Auto-setup enabled, checking server structure...
🔧 [DISCORD SETUP] Starting auto-setup...
📁 [DISCORD SETUP] Creating categories...
   ✅ Created: Landing category
   ✅ Created: Beta Channels category
🚪 [DISCORD SETUP] Creating welcome channel...
   ✅ Created: #welcome
📢 [DISCORD SETUP] Creating beta channels...
   ✅ Created: #announcements
   ✅ Created: #beta-signals
   ✅ Created: #beta-discussion
   ✅ Created: #bug-reports
   ✅ Created: #support
📝 [DISCORD SETUP] Posting welcome message...
   ✅ Posted and pinned welcome message
✅ [DISCORD SETUP] Auto-setup complete!
   → Welcome Channel ID: 1234567890123456789
   → Add to .env: DISCORD_WELCOME_CHANNEL_ID=1234567890123456789
```

---

### Step 4: Add Welcome Channel ID

Copy the channel ID from console output and add to `.env`:

```bash
DISCORD_WELCOME_CHANNEL_ID=1234567890123456789
```

**Restart backend** to apply changes.

---

## ✅ Verify Setup

### Check Discord Server

You should now see:

**Categories:**
- 🚪 Landing
- 🐝 Beta Channels

**Channels in Landing:**
- #welcome (with pinned message)

**Channels in Beta Channels:**
- #announcements
- #beta-signals
- #beta-discussion
- #bug-reports
- #support

---

### Test Permissions

#### Test 1: Unverified User
1. Open Discord in Incognito/Private window
2. Join server with invite link
3. ✅ Should see ONLY #welcome
4. ❌ Should NOT be able to send messages

#### Test 2: Verified User
1. Log in with admin account
2. Manually assign "Beta Tester" role to yourself
3. ✅ Should see all beta channels
4. ✅ Should be able to send messages
5. ❌ Should NOT see #welcome

---

## 🎯 What's Configured Automatically

### Permissions Set by Bot

| Channel | @everyone | Beta Tester | Bot |
|---------|-----------|-------------|-----|
| #welcome | View Only | Hidden | Full |
| #announcements | Hidden | Full | Full |
| #beta-signals | Hidden | Full | Full |
| #beta-discussion | Hidden | Full | Full |
| #bug-reports | Hidden | Full | Full |
| #support | Hidden | Full | Full |

### Welcome Message Posted

The bot automatically posts and pins a welcome message with:
- ✅ Step-by-step verification instructions
- ✅ Troubleshooting tips
- ✅ Link to dashboard
- ✅ Support contact info

---

## 🔧 Bot Permissions Needed

Make sure your bot has these permissions in Discord:

**Server-Level Permissions:**
- ✅ Manage Channels
- ✅ Manage Roles
- ✅ Create Instant Invite
- ✅ View Channels
- ✅ Send Messages
- ✅ Manage Messages
- ✅ Read Message History
- ✅ Mention @everyone

**Role Hierarchy:**
- Bot's role must be **ABOVE** "Beta Tester" role
- Go to Server Settings → Roles
- Drag bot role above Beta Tester

---

## 🚨 Common Issues

### Issue 1: "Missing Permissions" Error

**Fix:**
```
1. Server Settings → Roles
2. Find your bot's role
3. Enable "Manage Channels" and "Manage Roles"
4. Drag bot role ABOVE "Beta Tester" role
5. Restart backend
```

### Issue 2: Channels Not Created

**Fix:**
```
1. Check DISCORD_AUTO_SETUP=true in .env
2. Check bot token is correct
3. Check bot is in the server
4. Check console for error messages
```

### Issue 3: Bot Not Responding

**Fix:**
```
1. Check bot is online in Discord
2. Check DISCORD_BOT_TOKEN is correct
3. Enable "SERVER MEMBERS INTENT" and "MESSAGE CONTENT INTENT" in Discord Developer Portal
4. Restart backend
```

---

## 🎉 You're Done!

Your Discord server is now fully configured with:
- ✅ Landing channel for new users
- ✅ Beta channels for verified users
- ✅ Proper permissions
- ✅ Welcome message
- ✅ Auto-verification flow

**Next Steps:**
1. Test the flow with an alt account
2. Customize welcome message if needed
3. Start inviting beta users!

---

## 📚 More Info

- **Full Auto-Setup Guide:** `DISCORD_AUTO_SETUP_GUIDE.md`
- **Manual Setup Guide:** `DISCORD_LANDING_CHANNEL_SETUP.md`
- **Troubleshooting:** Check console logs

---

**Need help?** Contact support@helwa.ai or check the full documentation.

**Total setup time:** 5 minutes ⚡

