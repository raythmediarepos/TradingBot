# 🤖 Discord Auto-Setup Guide

## 🎯 Overview

Your Discord bot can now **automatically set up your entire server** with proper channels, categories, and permissions! No more manual configuration.

---

## ✨ What Gets Created Automatically

### 📁 Categories

1. **🚪 Landing** - For unverified users
2. **🐝 Beta Channels** - For verified beta testers

### 📺 Channels

#### Landing Category (Public)
- `#welcome` - New users see ONLY this channel until verified
  - Read-only for unverified users
  - Pinned welcome message with instructions

#### Beta Channels Category (Beta Testers Only)
- `#announcements` - Important updates
- `#beta-signals` - Real-time trading signals
- `#beta-discussion` - General chat for testers
- `#bug-reports` - Bug submissions (1-minute slowmode)
- `#support` - Help and questions

### 🔐 Permissions (Automatically Configured)

#### @everyone (Unverified Users)
- ✅ Can VIEW `#welcome` (read-only)
- ❌ CANNOT see any other channels
- ❌ CANNOT send messages

#### Beta Tester Role (Verified Users)
- ❌ CANNOT see `#welcome` (they don't need it)
- ✅ CAN see all beta channels
- ✅ CAN send messages, attach files, embed links

#### Bot
- ✅ Full access to all channels
- ✅ Can send messages, DMs, create invites

---

## 🚀 How to Enable Auto-Setup

### Method 1: Automatic on Bot Startup (Recommended)

The bot will check and create missing channels **every time it starts**.

**Already enabled in your `.env`:**
```bash
DISCORD_AUTO_SETUP=true
```

**To disable:**
```bash
DISCORD_AUTO_SETUP=false
```

### Method 2: Manual Trigger via API (Admin Only)

If you prefer manual control, you can trigger setup via API endpoint.

**Endpoint:**
```
POST /api/admin/discord/setup
```

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Example (cURL):**
```bash
curl -X POST https://your-backend.com/api/admin/discord/setup \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Example (JavaScript):**
```javascript
const response = await fetch('https://your-backend.com/api/admin/discord/setup', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json',
  },
})

const result = await response.json()
console.log(result)
```

**Response:**
```json
{
  "success": true,
  "message": "Discord server setup completed",
  "data": {
    "categoriesCreated": ["Landing", "Beta Channels"],
    "channelsCreated": ["welcome", "announcements", "beta-signals", "beta-discussion", "bug-reports", "support"],
    "messagesPosted": ["Welcome message in #welcome"],
    "welcomeChannelId": "1234567890123456789"
  }
}
```

---

## 📋 Setup Process

When the bot runs auto-setup, it follows this process:

### 1. Check Existing Structure
- Searches for existing categories and channels
- **Does NOT duplicate** if they already exist
- Only creates what's missing

### 2. Create Categories
- **Landing** category (position 0 - at the top)
- **Beta Channels** category (position 1)

### 3. Create Welcome Channel
- Creates `#welcome` in Landing category
- Sets read-only permissions for @everyone
- Hides from Beta Testers

### 4. Create Beta Channels
- Creates all 5 beta channels
- Hides from @everyone
- Allows Beta Testers full access

### 5. Post Welcome Message
- Posts comprehensive instructions in `#welcome`
- Automatically pins the message
- Includes troubleshooting tips

### 6. Log Results
- Console logs show what was created
- Provides Welcome Channel ID for `.env`

---

## 📊 Console Output Example

When auto-setup runs, you'll see:

```
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
   → Categories created: 2
   → Channels created: 6
   → Messages posted: 1
   → Welcome Channel ID: 1234567890123456789
   → Add to .env: DISCORD_WELCOME_CHANNEL_ID=1234567890123456789
```

**If already set up:**
```
🔧 [DISCORD BOT] Auto-setup enabled, checking server structure...
ℹ️  [DISCORD BOT] Server already configured
```

---

## 🔧 Configuration

### Required Environment Variables

```bash
# DISCORD BOT (Required)
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_BETA_ROLE_ID=your_beta_role_id_here

# DISCORD AUTO-SETUP (Optional)
DISCORD_AUTO_SETUP=true  # Set to false to disable

# DISCORD WELCOME CHANNEL (Auto-filled after first setup)
DISCORD_WELCOME_CHANNEL_ID=auto_generated_after_first_run
```

### How to Get IDs

#### Server ID (DISCORD_GUILD_ID)
1. Right-click your Discord server icon
2. Click "Copy Server ID"

#### Role ID (DISCORD_BETA_ROLE_ID)
1. Server Settings → Roles
2. Right-click "Beta Tester" role
3. Click "Copy Role ID"

#### Welcome Channel ID (After Setup)
- Bot will log it in console: `DISCORD_WELCOME_CHANNEL_ID=1234567890`
- Copy and add to `.env`
- OR get it manually: Right-click #welcome → Copy Channel ID

---

## 🎯 Use Cases

### Scenario 1: Fresh Discord Server
You just created a brand new Discord server.

**Steps:**
1. Invite bot to server
2. Create "Beta Tester" role
3. Add IDs to `.env`
4. Set `DISCORD_AUTO_SETUP=true`
5. Start backend
6. ✅ Bot creates everything automatically!

### Scenario 2: Existing Server with Some Channels
You have some channels but want to add missing ones.

**Steps:**
1. Keep `DISCORD_AUTO_SETUP=true`
2. Start backend
3. Bot will:
   - ✅ Keep existing channels
   - ✅ Create only missing channels
   - ✅ Not duplicate anything

### Scenario 3: Manual Control
You want to set up channels yourself manually.

**Steps:**
1. Set `DISCORD_AUTO_SETUP=false`
2. Follow manual setup guide: `DISCORD_LANDING_CHANNEL_SETUP.md`
3. Or trigger setup once via API when ready

### Scenario 4: Reset/Rebuild Server
You want to completely rebuild the server structure.

**Steps:**
1. Manually delete all channels in Discord
2. Keep `DISCORD_AUTO_SETUP=true`
3. Restart backend
4. ✅ Bot recreates everything from scratch

---

## 🔍 Admin Dashboard Integration (Future)

You can add a button to your admin dashboard to trigger setup:

```typescript
// Example: Admin Dashboard Button
const handleSetupDiscord = async () => {
  try {
    const response = await fetch('/api/admin/discord/setup', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    })
    
    const result = await response.json()
    
    if (result.success) {
      alert(`✅ Setup complete!\nCreated: ${result.data.channelsCreated.length} channels`)
    } else {
      alert(`❌ Setup failed: ${result.message}`)
    }
  } catch (error) {
    console.error(error)
    alert('Error setting up Discord')
  }
}
```

---

## 📊 Check Bot Status (Admin API)

**Endpoint:**
```
GET /api/admin/discord/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "botReady": true,
    "guildName": "Helwa AI Beta",
    "guildId": "1401079321476731052",
    "betaRoleName": "Beta Tester",
    "betaRoleId": "1433005563192676485",
    "memberCount": 42
  }
}
```

---

## 🚨 Troubleshooting

### Bot Says "Missing Permissions"

**Cause:** Bot doesn't have necessary permissions in Discord.

**Fix:**
1. Go to Discord Server Settings → Roles
2. Find your bot's role (usually same name as bot)
3. Enable these permissions:
   - ✅ Manage Channels
   - ✅ Manage Roles
   - ✅ Create Instant Invite
   - ✅ View Channels
   - ✅ Send Messages
   - ✅ Manage Messages
   - ✅ Read Message History
   - ✅ Mention @everyone, @here, and All Roles

### Bot Role Must Be Above Beta Tester Role

**Cause:** Discord role hierarchy - bot can only manage roles below it.

**Fix:**
1. Server Settings → Roles
2. **Drag bot's role ABOVE "Beta Tester" role**
3. Save changes
4. Restart backend

### Auto-Setup Not Running

**Cause:** Environment variable not set or set to false.

**Fix:**
```bash
# Check .env file
DISCORD_AUTO_SETUP=true  # Make sure this is set to true
```

### Channels Created But Permissions Wrong

**Cause:** Bot created channels before role permissions were set.

**Fix:**
1. Delete the incorrectly configured channels
2. Make sure bot role is above Beta Tester role
3. Restart backend (auto-setup will recreate with correct permissions)

### Welcome Message Not Posted

**Cause:** Bot might not have permission to send messages.

**Fix:**
1. Manually trigger setup via API: `POST /api/admin/discord/setup`
2. Check bot permissions in #welcome channel

---

## ✅ Verification Checklist

After auto-setup runs, verify everything is correct:

- [ ] Two categories created: "Landing" and "Beta Channels"
- [ ] #welcome channel exists in Landing category
- [ ] 5 beta channels exist in Beta Channels category
- [ ] Unverified user can ONLY see #welcome
- [ ] Unverified user CANNOT send messages in #welcome
- [ ] Beta Tester role can see all beta channels
- [ ] Beta Tester role CANNOT see #welcome
- [ ] Bot can send messages in all channels
- [ ] Welcome message is posted and pinned in #welcome
- [ ] `DISCORD_WELCOME_CHANNEL_ID` is added to `.env`

**Test with Alt Account:**
1. Create new Discord account
2. Join server with beta invite link
3. Verify you only see #welcome
4. Send verification code to bot
5. Verify you now see all beta channels
6. Verify #welcome disappears

---

## 🎨 Customization

### Change Channel Names

Edit `backend/services/discordSetupService.js`:

```javascript
const betaChannels = [
  {
    name: 'announcements',  // ← Change this
    topic: 'Your custom topic',
    slowmode: 0,
  },
  // ... add more channels
]
```

### Change Welcome Message

Edit `backend/services/discordSetupService.js`:

```javascript
const welcomeMessage = await welcomeChannel.send({
  content: `Your custom welcome message here...`
})
```

### Add More Channels

Add to the `betaChannels` array:

```javascript
{
  name: 'trading-tips',
  topic: '💡 Pro tips for halal trading',
  slowmode: 0,
},
```

### Change Category Names

Edit the category creation section:

```javascript
landingCategory = await guild.channels.create({
  name: '🚪 Your Custom Name',  // ← Change this
  type: ChannelType.GuildCategory,
  position: 0,
})
```

---

## 🎉 Benefits of Auto-Setup

✅ **Save Time** - No more manual channel creation  
✅ **Consistent** - Same setup every time  
✅ **No Mistakes** - Permissions set correctly automatically  
✅ **Idempotent** - Safe to run multiple times, won't duplicate  
✅ **Self-Healing** - Recreates missing channels on restart  
✅ **Scalable** - Easy to add to multiple servers  
✅ **Documented** - Welcome message included automatically  

---

## 📚 Related Docs

- **Manual Setup Guide:** `DISCORD_LANDING_CHANNEL_SETUP.md`
- **Bot Service Code:** `backend/services/discordBotService.js`
- **Setup Service Code:** `backend/services/discordSetupService.js`
- **Admin Routes:** `backend/routes/admin.js`

---

## 🆘 Need Help?

If auto-setup isn't working:

1. **Check console logs** for error messages
2. **Verify bot permissions** in Discord
3. **Ensure bot role is above Beta Tester role**
4. **Check all environment variables are set**
5. **Try manual trigger via API**
6. **Contact support** if issue persists

---

**Your Discord server setup is now automated! 🎉**

Just start your backend and the bot handles the rest!

