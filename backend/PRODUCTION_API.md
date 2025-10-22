# 🚀 Production Backend API - Ready to Use

## Backend URL
```
https://tradingbot-w843.onrender.com
```

---

## 📊 API Endpoints

### 1. Health Check
**GET** `/api/health`

```bash
curl https://tradingbot-w843.onrender.com/api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T00:25:03.872Z",
  "service": "Honeypot AI Backend"
}
```

---

### 2. Get Waitlist Remaining Spots
**GET** `/api/waitlist/remaining`

```bash
curl https://tradingbot-w843.onrender.com/api/waitlist/remaining
```

**Response:**
```json
{
  "success": true,
  "remaining": 98,
  "total": 100,
  "filled": 2
}
```

---

### 3. Join Waitlist
**POST** `/api/waitlist/join`

```bash
curl -X POST https://tradingbot-w843.onrender.com/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully added to waitlist!",
  "userId": "abc123xyz",
  "position": 3
}
```

**Response (Duplicate):**
```json
{
  "success": false,
  "message": "This email is already on the waitlist",
  "alreadyExists": true
}
```

**Response (Full):**
```json
{
  "success": false,
  "message": "Waitlist is currently full (100/100 spots filled)"
}
```

---

### 4. Submit Contact Form
**POST** `/api/contact`

```bash
curl -X POST https://tradingbot-w843.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "message": "I have a question about...",
    "subject": "Question"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "messageId": "xyz789abc"
}
```

---

## 🧪 Test Results (Verified on Oct 22, 2025)

✅ **Health Check:** PASSED
✅ **Waitlist Remaining:** PASSED
✅ **Join Waitlist:** PASSED  
✅ **Duplicate Check:** PASSED
✅ **Contact Form:** PASSED
✅ **Firebase Integration:** PASSED

---

## ⚠️ Important Notes

### Free Tier Behavior
- **Cold starts:** Backend spins down after 15 minutes of inactivity
- **Wake-up time:** ~30 seconds for first request after spin-down
- **Subsequent requests:** Fast (normal response times)
- **Monthly limit:** 750 hours (more than enough for pre-launch)

### CORS Configuration
Currently configured to allow all origins (`*`). Update in production if you want to restrict to your frontend domain only.

```javascript
// In server.js, update CORS to restrict to your domain:
const corsOptions = {
  origin: 'https://your-frontend-domain.vercel.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}
app.use(cors(corsOptions))
```

---

## 📁 Firebase Data Storage

### Collections:
1. **waitlist** - Stores all waitlist signups
   - Fields: `email`, `firstName`, `lastName`, `timestamp`, `position`

2. **contact-messages** - Stores all contact form submissions
   - Fields: `email`, `firstName`, `lastName`, `message`, `subject`, `timestamp`

### Firebase Console:
https://console.firebase.google.com/project/tradingbot-cb932

---

## 🔧 Render Dashboard

**Service URL:** https://dashboard.render.com/web/srv-d3s23ivgi27c739q85t0

**View Logs:** 
- Click on your service → "Logs" tab
- See real-time output and errors

**Environment Variables:**
- `NODE_ENV=production`
- `FIREBASE_SERVICE_ACCOUNT={...JSON...}`

---

## 🎯 Integration with Frontend

When connecting your Next.js frontend, use these endpoints:

```typescript
// Example: Join waitlist from frontend
const handleJoinWaitlist = async (email: string, firstName: string, lastName: string) => {
  try {
    const response = await fetch('https://tradingbot-w843.onrender.com/api/waitlist/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, firstName, lastName })
    })
    
    const data = await response.json()
    
    if (data.success) {
      // Show success message
      console.log(`Joined waitlist at position ${data.position}`)
    } else {
      // Show error message
      console.error(data.message)
    }
  } catch (error) {
    console.error('Network error:', error)
  }
}
```

---

## 🚀 Status

**Backend:** ✅ LIVE  
**Firebase:** ✅ CONNECTED  
**All Endpoints:** ✅ WORKING  
**Production Ready:** ✅ YES

---

Last tested: October 22, 2025

