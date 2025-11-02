# Discord Integration Setup

## ✅ What We Have

1. **Discord Bot Token** ✓
   - `DISCORD_BOT_TOKEN` is set in `.env`
   - Value: `MTQzMjk5ODgwOTg4NDk1NDY2NA.G6Z-5v...`

2. **Discord Server/Guild ID** ✓
   - `DISCORD_GUILD_ID` is set in `.env`
   - Value: `1401079321476731052`

3. **Discord Bot Code** ✓
   - Full Discord bot service implemented in `backend/services/discordBotService.js`
   - Handles new members, token verification, role assignment
   - DM verification system
   - Beta role management functions

4. **Discord Invite System** ✓
   - Token generation and validation
   - Email integration
   - Database tracking

## ❌ What We're Missing

### 1. **Discord Beta Role ID** (REQUIRED)
   - `DISCORD_BETA_ROLE_ID` is empty in `.env`
   - This is the role that gets assigned to verified beta users

### 2. **Discord Welcome Channel ID** (OPTIONAL)
   - `DISCORD_WELCOME_CHANNEL_ID` not set
   - Used for welcome messages when users join

### 3. **Discord Server Invite URL** (OPTIONAL)
   - `DISCORD_SERVER_INVITE_URL` not set
   - Used in emails to direct users to join the server

## 🔧 Environment Variable Issue

**MISMATCH FOUND:**
- `.env` file uses: `DISCORD_GUILD_ID`
- Code expects: `DISCORD_SERVER_ID`

This needs to be fixed!

## 📝 Steps to Complete Setup

### Step 1: Fix Environment Variable Name
Add to `.env`:
```bash
DISCORD_SERVER_ID=1401079321476731052
```

### Step 2: Get Beta Role ID
1. Open Discord
2. Go to Settings → Advanced → Enable "Developer Mode"
3. Go to your server
4. Right-click on the "Beta Tester" role (or whatever you named it)
5. Click "Copy ID"
6. Add to `.env`:
```bash
DISCORD_BETA_ROLE_ID=YOUR_ROLE_ID_HERE
```

### Step 3: (Optional) Get Welcome Channel ID
1. Right-click on the channel where you want welcome messages
2. Click "Copy ID"
3. Add to `.env`:
```bash
DISCORD_WELCOME_CHANNEL_ID=YOUR_CHANNEL_ID_HERE
```

### Step 4: (Optional) Create Server Invite
1. In Discord, right-click your server
2. Click "Invite People"
3. Create a permanent invite link
4. Add to `.env`:
```bash
DISCORD_SERVER_INVITE_URL=https://discord.gg/YOUR_INVITE_CODE
```

### Step 5: Restart Backend
```bash
cd backend
npm run dev
```

## 🤖 How It Works

1. **User signs up for beta** → Gets verification email
2. **User clicks verification link** → Email verified, gets Discord invite email
3. **User joins Discord server** → Bot sends them a DM with instructions
4. **User sends verification token in DM** → Bot assigns beta role
5. **User has access** → Can see all beta channels

## 🔍 Testing Checklist

- [ ] Bot connects successfully (check server logs)
- [ ] Bot can fetch guild information
- [ ] Bot can fetch beta role
- [ ] New members receive welcome DM
- [ ] Token verification works
- [ ] Beta role gets assigned
- [ ] Discord status updates in database

## 📱 Bot Permissions Required

Make sure your bot has these permissions:
- ✅ Read Messages/View Channels
- ✅ Send Messages
- ✅ Manage Roles
- ✅ Kick Members (for revocation)
- ✅ Create Invite
- ✅ View Server Members

## 🚨 Common Issues

1. **Bot not starting:** Check `DISCORD_BOT_TOKEN` is valid
2. **Can't assign roles:** Bot's role must be higher than Beta role
3. **DMs not working:** User has DMs disabled
4. **Invalid token:** Token expired (7 days) or already used

