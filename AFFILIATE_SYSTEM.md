# Affiliate System Documentation

## Overview
Complete affiliate program system with backend API, email notifications, and frontend integration.

## Features Implemented

### Backend Services

#### 1. Affiliate Service (`backend/services/affiliateService.js`)
- **Generate Unique Affiliate Codes**: 8-character hex codes
- **Create Affiliate Applications**: Store new affiliate applications in Firebase
- **Approve Affiliates**: Admin function to approve pending applications
- **Track Clicks**: Track when affiliate links are clicked
- **Track Conversions**: Track when referrals convert to paid subscriptions
- **Get Affiliate Stats**: Retrieve affiliate performance metrics

#### 2. Email Service Updates (`backend/services/emailService.js`)
- **Application Confirmation Email**: Sent immediately when affiliate applies
- **Approval Email**: Sent when admin approves application (includes login credentials)
- Emails match website design (dark theme with golden yellow accents)

#### 3. API Routes (`backend/routes/affiliates.js`)
- `POST /api/affiliates/apply` - Submit affiliate application
- `POST /api/affiliates/login` - Affiliate login
- `GET /api/affiliates/stats/:affiliateId` - Get affiliate dashboard stats
- `POST /api/affiliates/track-click` - Track affiliate link clicks
- `GET /api/affiliates/all` - Admin: Get all affiliates
- `POST /api/affiliates/approve/:affiliateId` - Admin: Approve affiliate

### Frontend Integration

#### Updated Affiliate Page (`app/affiliates/page.tsx`)
- Connected form to backend API
- Real-time form validation
- Success message with affiliate code display
- Error handling with user-friendly messages
- Loading states during submission

### Database Schema (Firebase Firestore)

#### Affiliates Collection
```javascript
{
  name: string,
  email: string,
  platform: string, // youtube, instagram, twitter, tiktok, blog, podcast, newsletter, discord, other
  audienceSize: string | null,
  websiteUrl: string | null,
  affiliateCode: string, // Unique 8-char code
  affiliateLink: string, // https://honeypotai.com/?ref={code}
  tempPassword: string, // Temporary password (should be hashed in production)
  passwordChanged: boolean,
  status: 'pending' | 'approved' | 'rejected' | 'suspended',
  commissionRate: 0.10, // 10%
  totalEarnings: number,
  totalReferrals: number,
  activeReferrals: number,
  clicks: number,
  conversions: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  approvedAt: timestamp | null,
  lastLoginAt: timestamp | null
}
```

#### Commissions Collection
```javascript
{
  affiliateId: string,
  affiliateCode: string,
  userId: string, // The referred user
  subscriptionAmount: number,
  commissionRate: number,
  commissionAmount: number,
  status: 'pending' | 'paid',
  type: 'recurring',
  createdAt: timestamp,
  paidAt: timestamp | null
}
```

## User Flow

### 1. Affiliate Application
1. User fills out application form on `/affiliates` page
2. Form data sent to `POST /api/affiliates/apply`
3. Backend:
   - Validates email format
   - Checks for duplicate applications
   - Generates unique affiliate code
   - Creates temporary password
   - Saves to Firebase with status "pending"
   - Sends confirmation email
4. User receives success message with affiliate code

### 2. Admin Approval
1. Admin reviews applications via `GET /api/affiliates/all`
2. Admin approves affiliate via `POST /api/affiliates/approve/:affiliateId`
3. Backend:
   - Updates status to "approved"
   - Sends approval email with:
     - Login credentials (email + temp password)
     - Unique referral link
     - Instructions to access dashboard

### 3. Affiliate Promotion
1. Approved affiliate receives email with referral link
2. Affiliate shares link: `https://honeypotai.com/?ref={CODE}`
3. When link is clicked, track via `POST /api/affiliates/track-click`
4. When referral subscribes, track via `POST /api/affiliates/track-conversion`

### 4. Commission Tracking
- When a user subscribes using a referral link:
  - Create commission record in Firebase
  - Calculate 10% of subscription amount
  - Update affiliate's totalEarnings, totalReferrals, activeReferrals
  - Commission continues monthly as long as user stays subscribed

## Environment Variables

Required environment variables in backend `.env`:
```
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=onboarding@resend.dev
EMAIL_FROM_NAME=Honeypot AI
```

Frontend `.env.local`:
```
NEXT_PUBLIC_API_URL=https://tradingbot-w843.onrender.com
```

## Next Steps / Future Enhancements

### Security (High Priority)
1. **Hash passwords**: Use bcrypt to hash temporary passwords instead of storing plain text
2. **JWT Authentication**: Implement JWT tokens for secure API access
3. **Admin Authentication**: Add admin middleware to protect admin-only routes
4. **Rate Limiting**: Add rate limiting to prevent abuse

### Affiliate Dashboard
1. Create `/affiliates/dashboard` page showing:
   - Total earnings
   - Active referrals
   - Click-through rate
   - Conversion rate
   - Recent activity
   - Downloadable marketing materials
2. Allow password change
3. Copy referral link functionality
4. View commission history

### Admin Panel
1. Create `/admin/affiliates` dashboard
2. View all applications
3. Approve/reject applications
4. View affiliate performance metrics
5. Manage commission payouts

### Payment Integration
1. Integrate Stripe Connect for automated payouts
2. Set up monthly payout schedule
3. Generate tax documents (1099 forms)

### Analytics
1. Track affiliate link sources (social media, website, etc.)
2. Geographic data
3. Conversion funnels
4. A/B testing support

## Testing

### Test Affiliate Application
1. Navigate to `https://your-domain.com/affiliates`
2. Fill out the application form
3. Check backend logs for successful creation
4. Check email for confirmation
5. Verify Firebase document created with status "pending"

### Test Admin Approval
Use API testing tool (Postman/Insomnia):
```bash
POST https://tradingbot-w843.onrender.com/api/affiliates/approve/{affiliateId}
```

### Test Click Tracking
```bash
POST https://tradingbot-w843.onrender.com/api/affiliates/track-click
Content-Type: application/json

{
  "affiliateCode": "ABC12345"
}
```

## Dependencies

No new dependencies required! Uses existing packages:
- `express` - Web framework
- `firebase-admin` - Database
- `resend` - Email service
- `crypto` - Node.js built-in for generating codes

## Notes

- Affiliate codes are 8 characters (16 hex digits = 4 bytes)
- Commission rate is hardcoded at 10% but stored in database for flexibility
- Temporary passwords are 16 characters (8 bytes hex)
- All emails match website design (dark theme with golden yellow)
- System supports unlimited affiliates
- Referral tracking happens client-side (add tracking script to website)

## Support

For questions or issues:
- Backend logs: Check Render dashboard
- Frontend errors: Check browser console
- Email issues: Check Resend dashboard
- Database: Check Firebase console

