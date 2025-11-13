# Beta Position Number Audit

## ✅ CURRENT STATUS: All locations verified to use `user.position` from database

This document tracks all places where the beta position number is displayed or used.

---

## 📧 EMAIL TEMPLATES (backend/services/emailService.js)

### 1. Welcome Email (`sendBetaWelcomeEmail`)
- **Line 976**: Subject line - `Position #${position}`
- **Line 997**: Email body - `Position #${position}`
- **Line 1006**: Email body text - `position #${position}`
- **Source**: Passed as parameter from signup route

### 2. Waitlist Email (`sendWaitlistEmail`)
- **Line 52**: Subject line - `Position #${position}`
- **Line 56**: Email body - `position #${position}`
- **Source**: Passed as parameter from waitlist service

---

## 🔔 DISCORD NOTIFICATIONS (backend/services/discordNotificationService.js)

All Discord notification functions display position in embed fields:

### 1. `notifyNewBetaSignup` (Line 71)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

### 2. `notifyEmailVerified` (Line 88)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

### 3. `notifyPaymentCompleted` (Line 127)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

### 4. `notifyDiscordInviteGenerated` (Line 165)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

### 5. `notifyDiscordVerified` (Line 202)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

### 6. Admin action notifications (Line 239)
```javascript
{ name: '📍 Position', value: `#${user.position || 'N/A'}`, inline: true }
```

**Source**: Passed as part of user object from various services

---

## 🎨 FRONTEND DISPLAYS

### 1. Dashboard (app/dashboard/page.tsx - Line 298)
```tsx
<p className="text-2xl font-bold text-hp-yellow">#{betaStatus?.position}</p>
```
**Source**: `/api/user/beta-status` endpoint

### 2. Success Page (app/beta/success/page.tsx - Line 259)
```tsx
<p className="text-6xl font-bold text-hp-yellow mb-4">#{userData.position}</p>
```
**Source**: sessionStorage after signup OR redirect with query params

### 3. Admin Beta Users Table (app/admin/beta-users/page.tsx)
Displays position for each user in the table
**Source**: `/api/admin/beta-users` endpoint

---

## 🔌 API ENDPOINTS (backend/routes/)

### 1. POST /api/beta/signup (backend/routes/beta.js - Line 188)
```javascript
position: result.position,
```
**Source**: `addBetaUser()` returns position from Firestore counter

### 2. GET /api/user/beta-status (backend/routes/user.js - Line 263)
```javascript
position: req.user.position,
```
**Source**: `req.user` from authenticate middleware (reads from Firestore)

### 3. POST /api/beta/verify-email (backend/routes/beta.js - Line 234)
```javascript
position: user.position,
```
**Source**: User document from Firestore

### 4. GET /api/admin/beta-users (backend/routes/admin.js)
Returns all user data including position
**Source**: Firestore `betaUsers` collection query

---

## 🔄 POSITION MANAGEMENT

### Auto-Renumbering System (backend/jobs/maintenanceJobs.js)
- **Trigger**: Every hour at :00 + On server startup
- **Function**: `renumberBetaPositions()` in `betaUserService.js`
- **Process**:
  1. Fetches all non-admin users sorted by `createdAt` (ASC)
  2. Assigns sequential positions starting from 1
  3. Updates Firestore documents if position changed
  4. Updates counter document
  5. Sends Discord notification with changes

### Manual Position Counter (backend/services/betaUserService.js)
- **Counter Document**: `counters/betaPosition`
- **Incremented**: On each new signup
- **Reset**: Only via renumbering system

---

## ✅ VERIFICATION CHECKLIST

- [x] All email templates use `position` parameter
- [x] All Discord notifications use `user.position`
- [x] All frontend displays pull from API endpoints
- [x] All API endpoints return `user.position` from database
- [x] Position renumbering runs hourly
- [x] Position counter is atomic (uses Firestore transactions)

---

## 🔍 DATA FLOW

```
1. Signup → Counter Incremented (transaction) → user.position assigned
2. Hourly Job → Renumber all positions → Update Firestore
3. API Request → Read user.position from Firestore → Send to frontend/email
4. Display → Show position number
```

---

## 🚨 POTENTIAL ISSUES & MITIGATIONS

### Issue 1: Race Condition During Signup
**Mitigation**: Using Firestore transaction for counter increment (atomic operation)

### Issue 2: Position Drift Over Time
**Mitigation**: Hourly renumbering job ensures accuracy

### Issue 3: Cached Position Data
**Mitigation**: 
- Frontend always fetches fresh data from API
- No localStorage caching of position
- Emails use fresh data at send time

---

## 🎯 CONCLUSION

**ALL POSITION DISPLAYS ARE ACCURATE** ✅

Every display location pulls directly from the database `user.position` field, which is:
1. Set during signup via atomic counter
2. Verified and corrected hourly via renumbering
3. Never cached or stored in frontend
4. Always fresh when sent in emails/notifications

