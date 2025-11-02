# 🎭 Discord Two-Role Security Setup

## 🎯 Why Two Roles?

Using **two explicit roles** instead of relying on @everyone provides:
- ✅ **Explicit control** - Clear separation between verified and unverified users
- ✅ **Better security** - Unverified users can ONLY see #welcome
- ✅ **Easy management** - Add/remove roles instead of managing complex permissions
- ✅ **No loopholes** - Users can't bypass restrictions

---

## 📋 Complete Setup Guide

### Step 1: Create "Unverified" Role

1. **Open Discord Server Settings**
2. Go to **Roles** tab
3. Click **Create Role** button
4. Configure the role:
   - **Name:** `Unverified`
   - **Color:** Gray or Yellow (optional, for visibility)
   - **Permissions:** Leave ALL unchecked (no special permissions)
   - **Display role members separately:** Optional
5. **Save Changes**
6. **Right-click the "Unverified" role** → **Copy Role ID**
7. **Save this ID** - you'll need it for `.env`

---

### Step 2: Verify "Beta Tester" Role Exists

You should already have this, but verify:

1. **Server Settings** → **Roles**
2. Find **"Beta Tester"** role
3. If it doesn't exist, create it:
   - **Name:** `Beta Tester`
   - **Color:** Your choice (e.g., Blue or Purple)
   - **Permissions:** Leave default or customize
4. **Right-click "Beta Tester"** → **Copy Role ID**
5. **Verify this matches** your `.env` file

---

### Step 3: Set Role Hierarchy (CRITICAL!)

**Discord roles work by hierarchy** - higher roles can manage lower roles.

1. **Server Settings** → **Roles**
2. **Drag roles in this order (top to bottom):**

```
   1. [Your name] (Owner)
   2. Bot Role (e.g., "Helwa AI Trading Bot")  ← Must be here!
   3. Beta Tester
   4. Unverified
   5. @everyone
```

**⚠️ CRITICAL:** The bot's role **MUST** be above both "Beta Tester" and "Unverified" or it won't be able to assign/remove them!

---

### Step 4: Configure @everyone Permissions

Make @everyone have NO permissions by default:

1. **Server Settings** → **Roles** → **@everyone**
2. In the **Permissions** tab, scroll through and ensure these are **OFF** (X or gray):
   - View Channels: ❌
   - Send Messages: ❌
   - Create Invites: ❌
   - Everything else: ❌
3. **Save Changes**

---

### Step 5: Configure #welcome Channel Permissions

**Right-click your #welcome channel** → **Edit Channel** → **Permissions** tab

#### Add Permission Overrides:

**1. @everyone**
- Click **"+"** → Select **@everyone**
- ❌ **View Channel:** Red X (Deny)
- **Save**

**2. Unverified Role**
- Click **"+"** → Select **Unverified**
- ✅ **View Channel:** Green ✓ (Allow)
- ❌ **Send Messages:** Red X (Deny)
- ❌ **Add Reactions:** Red X (Deny)
- ❌ **Create Public Threads:** Red X (Deny)
- ❌ **Create Private Threads:** Red X (Deny)
- **Save**

**3. Beta Tester Role**
- Click **"+"** → Select **Beta Tester**
- ❌ **View Channel:** Red X (Deny) - They don't need this channel!
- **Save**

**4. Bot Role (Your bot)**
- Click **"+"** → Select your bot's role
- ✅ **View Channel:** Green ✓ (Allow)
- ✅ **Send Messages:** Green ✓ (Allow)
- ✅ **Embed Links:** Green ✓ (Allow)
- ✅ **Mention @everyone, @here, and All Roles:** Green ✓ (Allow)
- **Save**

**Click "Save Changes" at the bottom**

---

### Step 6: Configure ALL Beta Channels

For **EVERY** beta channel (#announcements, #beta-signals, #beta-discussion, etc.):

**Right-click channel** → **Edit Channel** → **Permissions** tab

#### Add Permission Overrides:

**1. @everyone**
- Click **"+"** → Select **@everyone**
- ❌ **View Channel:** Red X (Deny)
- **Save**

**2. Unverified Role**
- Click **"+"** → Select **Unverified**
- ❌ **View Channel:** Red X (Deny)
- **Save**

**3. Beta Tester Role**
- Click **"+"** → Select **Beta Tester**
- ✅ **View Channel:** Green ✓ (Allow)
- ✅ **Send Messages:** Green ✓ (Allow)
- ✅ **Read Message History:** Green ✓ (Allow)
- ✅ **Add Reactions:** Green ✓ (Allow)
- ✅ **Attach Files:** Green ✓ (Allow)
- ✅ **Embed Links:** Green ✓ (Allow)
- **Save**

**Click "Save Changes" at the bottom**

**Repeat for ALL beta channels!**

---

### Step 7: Update Backend .env

Add your Unverified Role ID to the `.env` file:

```bash
# Open backend/.env
cd backend
nano .env  # or use your preferred editor
```

Add this line (replace with your copied Role ID):

```bash
DISCORD_UNVERIFIED_ROLE_ID=YOUR_UNVERIFIED_ROLE_ID_HERE
```

Example:
```bash
DISCORD_UNVERIFIED_ROLE_ID=1433012345678901234
```

**Save and exit**

---

### Step 8: Restart Backend

```bash
# If running with npm start
cd backend
npm start

# Or if using nodemon (auto-restarts)
# Just save the .env file and wait for auto-restart
```

**Watch the console output:**
```
🤖 [DISCORD BOT] Connected successfully
   → Bot User: Helwa AI Trading Bot#1234
   → Bot ID: 1234567890
   → Fetching guild: 1401079321476731052
   → Bot is in 1 server(s)
      • Your Server Name (ID: 1401079321476731052)
   → Guild: Your Server Name
   → Beta Role: Beta Tester
   → Unverified Role: Unverified  ← Should see this!
✅ [DISCORD BOT] Ready to process requests
```

---

## 🎯 How It Works Now

### When User Joins:
```
1. User clicks invite link → Joins Discord server
2. Bot IMMEDIATELY assigns "Unverified" role
3. User can ONLY see #welcome channel
4. Bot sends DM with verification instructions
5. Bot posts in #welcome: "Welcome @user, check DMs"
```

### When User Verifies:
```
1. User sends verification code to bot via DM
2. Bot validates the code
3. Bot REMOVES "Unverified" role
4. Bot ADDS "Beta Tester" role
5. #welcome disappears (user can't see it anymore)
6. All beta channels appear
7. User is fully verified! ✅
```

---

## ✅ Testing Checklist

### Test 1: New User (Unverified)
1. Use an alt Discord account or ask a friend
2. Join server with invite link
3. **Expected results:**
   - ✅ Automatically get "Unverified" role
   - ✅ Can see ONLY #welcome channel
   - ❌ Cannot see any beta channels
   - ❌ Cannot send messages in #welcome

### Test 2: Verified User
1. Send verification code to bot in DM
2. **Expected results:**
   - ✅ "Unverified" role is removed
   - ✅ "Beta Tester" role is added
   - ✅ Can see all beta channels
   - ✅ Can send messages in beta channels
   - ❌ #welcome channel disappears

### Test 3: Existing Member
1. Manually assign "Beta Tester" role to yourself
2. **Expected results:**
   - ✅ Can see all beta channels
   - ❌ Cannot see #welcome

---

## 🔍 Troubleshooting

### Issue: Bot can't assign roles

**Cause:** Bot role is not high enough in hierarchy

**Fix:**
1. Server Settings → Roles
2. Drag bot role ABOVE "Beta Tester" and "Unverified"
3. Save and test again

---

### Issue: Unverified users can still see beta channels

**Cause:** Channel permissions not set correctly

**Fix:**
1. For each beta channel: Right-click → Edit Channel → Permissions
2. Make sure "Unverified" role has View Channel: **DENY** (Red X)
3. Make sure "@everyone" role has View Channel: **DENY** (Red X)
4. Only "Beta Tester" should have View Channel: **ALLOW** (Green ✓)

---

### Issue: Bot doesn't assign Unverified role on join

**Cause:** `DISCORD_UNVERIFIED_ROLE_ID` not set in .env

**Fix:**
1. Check `.env` file has the correct Unverified Role ID
2. Restart backend
3. Check console logs for "→ Unverified Role: Unverified"

---

### Issue: Verified users still see #welcome

**Cause:** #welcome permissions allow Beta Tester role to view

**Fix:**
1. Right-click #welcome → Edit Channel → Permissions
2. Find "Beta Tester" role
3. Set View Channel: **DENY** (Red X)
4. Save

---

## 📊 Permission Matrix

Quick reference for what each role should see:

| Channel | @everyone | Unverified | Beta Tester | Bot |
|---------|-----------|------------|-------------|-----|
| #welcome | ❌ Deny | ✅ View Only | ❌ Deny | ✅ Full |
| #announcements | ❌ Deny | ❌ Deny | ✅ Full | ✅ Full |
| #beta-signals | ❌ Deny | ❌ Deny | ✅ Full | ✅ Full |
| #beta-discussion | ❌ Deny | ❌ Deny | ✅ Full | ✅ Full |
| #bug-reports | ❌ Deny | ❌ Deny | ✅ Full | ✅ Full |
| #support | ❌ Deny | ❌ Deny | ✅ Full | ✅ Full |

**Legend:**
- ❌ Deny = Cannot see or access
- ✅ View Only = Can see, cannot send messages
- ✅ Full = Can see and interact

---

## 🎉 Benefits of This Setup

✅ **Maximum Security** - No way for unverified users to see beta content  
✅ **Clean User Experience** - Users only see what they should  
✅ **Automatic** - Bot handles everything  
✅ **Easy to Manage** - Just assign/remove roles  
✅ **Scalable** - Works for any number of users  
✅ **Professional** - Clear onboarding flow  

---

## 🔄 Role Assignment Flow Diagram

```
┌─────────────────────────────────────────────────┐
│ User Joins Discord Server                       │
│ (Clicks invite link)                            │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Bot: Auto-assign "Unverified" Role              │
│ ✅ Can see: #welcome                            │
│ ❌ Can't see: All beta channels                 │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ User Receives DM from Bot                       │
│ "Send your verification code"                   │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ User Goes to Dashboard                          │
│ Generates/Copies Verification Code              │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ User Sends Code to Bot (via DM)                 │
│ Format: discord_xxxxxxxxxxxxx                   │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Bot: Validates Token                            │
│ - Checks if token exists                        │
│ - Checks if not expired                         │
│ - Checks if not already used                    │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ Bot: Update Roles                                │
│ ❌ Remove: "Unverified" role                    │
│ ✅ Add: "Beta Tester" role                      │
└───────────────┬─────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────┐
│ User Now Has Full Access! 🎉                    │
│ ✅ Can see: All beta channels                   │
│ ❌ Can't see: #welcome (no longer needed)       │
└─────────────────────────────────────────────────┘
```

---

**Your Discord server is now fully secured with two-role verification! 🔒**

New users can only see the welcome channel until they verify their identity.

