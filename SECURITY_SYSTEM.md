# 🔒 Discord Security & Access Control System

## ✅ Complete Security Features

### 1. **Unique, Single-Use Discord Invites** 🎯

**How It Works:**
- Each user gets a **UNIQUE Discord server invite link**
- Each invite can only be used **ONCE** (maxUses: 1)
- Invites expire after **7 days**
- No one else can use your invite link

**Example:**
- User A gets: `https://discord.gg/abc123` (unique, 1 use)
- User B gets: `https://discord.gg/xyz789` (different, 1 use)

---

### 2. **Unique Verification Tokens** 🔐

**How It Works:**
- Each user gets a **unique verification token**
- Format: `discord_a39076939bd263bdf56c0cf0e2750d850bd63148464c09de`
- Token can only be used **ONCE**
- Token expires after **7 days**
- Only the correct user can verify with their token

---

### 3. **Two-Step Verification Process** ✅✅

**Step 1: Join Server (Unique Invite)**
- User clicks their unique Discord invite link
- Discord allows them to join ONCE
- No one else can use that same link

**Step 2: Verify Identity (Unique Token)**
- Bot sends DM with instructions
- User sends their verification token
- Bot verifies token matches the user who joined
- Bot assigns "Beta Tester" role

---

### 4. **Role-Based Channel Access** 🚪

**How It Works:**
- Create private beta channels
- Set permissions: Only "Beta Tester" role can see them
- Unverified members see nothing

**Channel Permission Example:**
```
#general          → Everyone can see
#beta-signals     → Only Beta Testers
#beta-discussion  → Only Beta Testers
#beta-updates     → Only Beta Testers
```

---

## 🔄 Complete User Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User signs up for beta                                   │
│    → Creates account in database                            │
│    → Gets position #X                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. User verifies email                                      │
│    → Clicks link in welcome email                           │
│    → Email verified ✅                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. User generates Discord access                            │
│    → Clicks "Generate Discord Invite" in dashboard          │
│    → System creates:                                        │
│       • Unique server invite (1 use, 7 days)                │
│       • Unique verification token (1 use, 7 days)           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. User joins Discord server                                │
│    → Clicks their unique invite link                        │
│    → Joins server (link now expired/used)                   │
│    → Bot detects new member                                 │
│    → Bot sends DM with verification instructions            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User verifies their identity                             │
│    → Sends verification token to bot via DM                 │
│    → Bot validates token:                                   │
│       ✓ Token exists                                        │
│       ✓ Token not used                                      │
│       ✓ Token not expired                                   │
│       ✓ Token matches this user                             │
│    → Bot assigns "Beta Tester" role                         │
│    → Token marked as "used" ✅                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. User has full beta access                                │
│    → Can see all beta channels                              │
│    → Can receive trading signals                            │
│    → Database updated: discordJoined: true                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Security Guarantees

### ✅ One Person Per Invite
- Each Discord invite link can only be used **once**
- After use, the link is invalid
- Cannot share invite with others

### ✅ Identity Verification
- Verification token is **unique per user**
- Token is tied to specific email/user account
- Only correct user can verify

### ✅ Cannot Bypass System
- Must have valid email verification
- Must have valid payment (if not in first 20)
- Must complete Discord verification
- All three checks required

### ✅ Automatic Access Control
- Bot automatically assigns role after verification
- Channel permissions control what they see
- No manual intervention needed

### ✅ Audit Trail
- Database tracks all invites
- Database tracks when invites are used
- Database tracks Discord usernames
- Database tracks verification status

---

## 📊 Database Structure

### Discord Invites Collection

```javascript
{
  id: "doc-id-123",
  userId: "user-firebase-id",
  email: "user@example.com",
  token: "discord_a39076939bd263bdf56c0cf0e2750d850bd63148464c09de",
  discordInviteUrl: "https://discord.gg/abc123",    // Unique per user
  discordInviteCode: "abc123",                      // Discord code
  used: false,                                      // True after verification
  createdAt: Timestamp,
  expiresAt: Timestamp,                             // +7 days
  usedAt: Timestamp,                                // When verified
  discordUserId: "1234567890",                      // Discord user ID
  discordUsername: "user#1234"                      // Discord username
}
```

---

## 🎮 Setting Up Channel Permissions

### 1. Create Beta Channels

Create private channels for beta testers:
- `#beta-announcements`
- `#beta-signals`
- `#beta-discussion`
- `#beta-support`

### 2. Set Channel Permissions

For each beta channel:

1. **Click channel settings** → Permissions
2. **Remove @everyone** access (or set to "X" / deny View Channel)
3. **Add "Beta Tester" role** → Set "✓ View Channel"
4. **Save**

### 3. Verify

- Unverified members: **Cannot see beta channels**
- Verified members (with Beta Tester role): **Can see everything**

---

## 🚨 What Happens If...

### Someone Shares Their Invite Link?
- Link only works **once**
- After first use, link is invalid
- Second person gets "Invite Invalid" error

### Someone Joins Without Verifying?
- They're in the server but see **nothing**
- No access to beta channels
- Must complete verification to get role

### Someone Tries to Use Someone Else's Token?
- Token is tied to specific user
- Bot checks token validity
- Only correct user can verify

### Invite Expires?
- User can generate a **new invite** from dashboard
- Old invite becomes invalid
- New unique invite created

---

## 🔧 Admin Controls

### View All Invites
Check Firebase Console → Firestore → `discordInvites` collection

### Revoke Access
1. Go to Discord → Server Members
2. Remove "Beta Tester" role from user
3. (Optional) Kick user from server

### Track Usage
Query database:
- `used: true` → Verified users
- `used: false` → Pending users
- `expiresAt < now` → Expired invites

---

## 🎯 Summary

Your system now has **THREE layers of security**:

1. **🔒 Unique Server Invites** → Only one person can join per link
2. **🔐 Unique Verification Tokens** → Only correct user can verify
3. **🚪 Role-Based Access** → Only verified users see channels

**Result**: Complete 1:1 mapping from signup → verified Discord member! 🎉

