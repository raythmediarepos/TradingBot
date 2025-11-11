# Database Schema for Email Reminder System

This document describes the database fields added to support the automated email reminder system.

## betaUsers Collection

### New Fields for Email Reminders:

#### **Journey Stage Tracking:**
```javascript
{
  journeyStage: string,  // Current stage in user journey
  // Possible values:
  // - 'signup' - Just signed up, email not verified
  // - 'email_verification' - Email verified, no payment
  // - 'payment' - Payment complete, no Discord invite
  // - 'discord_invite' - Discord invite generated, not joined
  // - 'discord_verification' - In Discord, not verified
  // - 'active' - Fully onboarded
  
  lastJourneyUpdate: Timestamp  // When journey stage last changed
}
```

#### **Email Verification Reminders:**
```javascript
{
  emailRemindersSent: {
    tenMinute: Timestamp | null,        // 10-min reminder sent at
    oneHour: Timestamp | null,          // 1-hour reminder sent at
    twentyFourHour: Timestamp | null    // 24-hour reminder sent at
  }
}
```

#### **Payment Reminders:**
```javascript
{
  paymentRemindersSent: {
    oneHour: Timestamp | null,      // 1-hour reminder sent at
    twentyFourHour: Timestamp | null,  // 24-hour reminder sent at
    threeDays: Timestamp | null      // 3-day reminder sent at
  }
}
```

#### **Discord Invite Reminders:**
```javascript
{
  discordInviteRemindersSent: {
    oneHour: Timestamp | null,         // 1-hour reminder sent at
    twentyFourHour: Timestamp | null   // 24-hour reminder sent at
  }
}
```

#### **Discord Verification Reminders:**
```javascript
{
  discordVerificationRemindersSent: {
    thirtyMinute: Timestamp | null,    // 30-min reminder sent at
    twentyFourHour: Timestamp | null   // 24-hour reminder sent at
  }
}
```

---

## emailAnalytics Collection (Optional - for tracking)

Track email engagement metrics:

```javascript
{
  emailType: string,  // Type of email sent
  // Possible values:
  // - 'verification_reminder_10min'
  // - 'verification_reminder_1hr'
  // - 'verification_reminder_24hr'
  // - 'payment_reminder_1hr'
  // - 'payment_reminder_24hr'
  // - 'payment_reminder_3days'
  // - 'discord_invite_reminder_1hr'
  // - 'discord_invite_reminder_24hr'
  // - 'discord_verification_reminder_30min'
  // - 'discord_verification_reminder_24hr'
  
  sentAt: Timestamp,             // When email was sent
  userId: string,                // Reference to betaUsers document
  userEmail: string,             // User's email address
  
  // Engagement metrics (requires email provider webhooks)
  opened: boolean,               // Email was opened
  openedAt: Timestamp | null,    // When email was opened
  clicked: boolean,              // Link was clicked
  clickedAt: Timestamp | null,   // When link was clicked
  converted: boolean,            // User completed the action
  convertedAt: Timestamp | null, // When user converted
  
  // Additional metadata
  resendEmailId: string | null,  // Resend API email ID
  bounced: boolean,              // Email bounced
  complained: boolean            // User marked as spam
}
```

---

## Migration Notes

**These fields are added automatically** when reminders are sent, so no migration script is needed.

However, to track journey stage from the start, you may want to:

1. Set `journeyStage: 'signup'` for new user signups
2. Update `journeyStage` when users complete each step
3. Use `journeyStage` to show progress in dashboard

---

## Indexes Needed

For optimal query performance, create these Firestore indexes:

### 1. **Unverified Users (Email Reminders):**
```
Collection: betaUsers
Fields:
  - emailVerified (Ascending)
```

### 2. **Pending Payments (Payment Reminders):**
```
Collection: betaUsers
Fields:
  - emailVerified (Ascending)
  - isFree (Ascending)
  - paymentStatus (Ascending)
```

### 3. **Unused Discord Invites (Verification Reminders):**
```
Collection: discordInvites
Fields:
  - used (Ascending)
  - expiresAt (Ascending)
```

---

## Example Queries

### Find users needing email verification reminder:
```javascript
const unverifiedUsers = await db.collection('betaUsers')
  .where('emailVerified', '==', false)
  .get()
```

### Find users needing payment reminder:
```javascript
const pendingPaymentUsers = await db.collection('betaUsers')
  .where('emailVerified', '==', true)
  .where('isFree', '==', false)
  .where('paymentStatus', 'in', ['pending', 'unpaid'])
  .get()
```

### Track reminder effectiveness (if using analytics):
```javascript
const reminderStats = await db.collection('emailAnalytics')
  .where('emailType', '==', 'verification_reminder_10min')
  .where('converted', '==', true)
  .get()

const conversionRate = (reminderStats.size / totalSent) * 100
```

---

## Cron Schedule

Reminders run every 5 minutes:

```
*/5 * * * * - Every 5 minutes
```

This ensures:
- 10-minute reminders sent between 10-15 minutes
- 1-hour reminders sent between 60-65 minutes
- 24-hour reminders sent between 1440-1445 minutes
- etc.

---

## Email Template Types

All templates are defined in `backend/services/emailService.js`:

1. **`sendEmailVerificationReminder(email, firstName, reminderType, token)`**
   - reminderType: 'first', 'second', 'final'

2. **`sendAbandonedPaymentReminder(email, firstName, reminderType, spotsLeft)`**
   - reminderType: 'first', 'second', 'final'

3. **`sendDiscordInviteReminder(email, firstName, reminderType)`**
   - reminderType: 'first', 'second'

4. **`sendDiscordVerificationReminder(email, firstName, reminderType, token)`**
   - reminderType: 'first', 'second'

---

## Testing

To test the reminder system manually:

```javascript
// In Node REPL or test script
const { runAllReminders } = require('./services/emailReminderService')

// Run all reminder checks once
await runAllReminders()
```

Or test individual reminder types:

```javascript
const {
  sendEmailVerificationReminders,
  sendPaymentReminders,
  sendDiscordInviteReminders,
  sendDiscordVerificationReminders
} = require('./services/emailReminderService')

// Test one type
await sendEmailVerificationReminders()
```

---

## Monitoring

Check logs for reminder activity:

```bash
# Backend logs
grep "REMINDER CRON" backend.log

# Email sending logs
grep "EMAIL SUCCESS" backend.log
grep "EMAIL ERROR" backend.log
```

---

## Future Enhancements

1. **Email Analytics Dashboard** - Track open/click rates
2. **A/B Testing** - Test different subject lines/content
3. **Personalization** - Dynamic content based on user behavior
4. **Unsubscribe Management** - Allow users to opt out
5. **Frequency Capping** - Prevent email fatigue
6. **SMS Reminders** - Alternative to email for critical steps
7. **Push Notifications** - For mobile app (future)

