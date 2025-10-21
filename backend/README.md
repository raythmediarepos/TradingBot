# Honeypot AI Backend

Backend services for Honeypot AI Trading Bot, built with Node.js, Express, and Firebase.

## 🚀 Features

### ✅ Implemented
- **Waitlist Management**
  - Add users to waitlist (max 100 members)
  - Check remaining spots
  - Duplicate email prevention
  - Automatic timestamp tracking
  
- **Contact Form**
  - Submit contact messages
  - Store in Firebase
  - Email validation
  - Message length validation

- **Email Notifications (Stubbed)**
  - Waitlist confirmation emails (ready to implement)
  - Contact form auto-replies (ready to implement)
  - Admin notifications (ready to implement)

## 📁 Structure

```
backend/
├── api/
│   └── routes.js          # API endpoints
├── services/
│   ├── waitlistService.js # Waitlist logic
│   └── contactService.js  # Contact form logic
├── firebase-config.js     # Firebase configuration
├── server.js             # Express server
├── package.json          # Dependencies
├── env-example.txt       # Environment variables template
└── README.md            # This file
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Set Up Firebase

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "honeypot-ai" (or your preferred name)
3. Enable Firestore Database:
   - Go to Build → Firestore Database
   - Click "Create database"
   - Choose "Start in production mode"
   - Select a location close to your users

#### Generate Service Account Key
1. Go to Project Settings (⚙️ icon) → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `serviceAccountKey.json` in the `backend/` directory
4. **IMPORTANT:** Never commit this file to git (it's in `.gitignore`)

#### Get Firebase Config
1. Go to Project Settings → General
2. Scroll down to "Your apps"
3. Click "Add app" → Web app icon
4. Register app (name: "Honeypot AI Web")
5. Copy the config values

### 3. Configure Environment Variables

```bash
# Copy the example file
cp env-example.txt .env

# Edit .env and add your Firebase credentials
```

Example `.env` file:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=honeypot-ai.firebaseapp.com
FIREBASE_PROJECT_ID=honeypot-ai
FIREBASE_STORAGE_BUCKET=honeypot-ai.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### 4. Update Firebase Config

Edit `firebase-config.js` if you prefer to use environment variables (already set up).

### 5. Start the Server

```bash
# Development mode (with nodemon for auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Waitlist Endpoints

#### Get Remaining Spots
```http
GET /api/waitlist/remaining
```

**Response:**
```json
{
  "success": true,
  "remaining": 87,
  "total": 100,
  "filled": 13
}
```

#### Join Waitlist
```http
POST /api/waitlist/join
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Successfully added to waitlist!",
  "userId": "abc123def456",
  "position": 14
}
```

**Error Responses:**
- **400** - Invalid input
- **409** - Email already exists
- **400** - Waitlist full

#### Get All Waitlist Members (Admin Only)
```http
GET /api/waitlist/all
```

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": "abc123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "joinedAt": "2025-11-01T12:00:00Z",
      "status": "pending",
      "listType": "trading-bot"
    }
  ],
  "count": 13
}
```

### Contact Endpoints

#### Submit Contact Message
```http
POST /api/contact
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "message": "I'm interested in learning more about your trading bot.",
  "subject": "Product Inquiry",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you for contacting us! We will get back to you soon.",
  "messageId": "msg123abc"
}
```

#### Get Contact Messages (Admin Only)
```http
GET /api/contact/messages?status=new&limit=50
```

#### Update Message Status (Admin Only)
```http
PATCH /api/contact/messages/:id/status
Content-Type: application/json

{
  "status": "read"
}
```

### Utility Endpoints

#### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "service": "Honeypot AI Backend"
}
```

## 🗄️ Firebase Collections

### `waitlist` Collection

```javascript
{
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
  joinedAt: Timestamp,
  status: "pending",        // pending | approved | notified
  listType: "trading-bot"   // trading-bot | chatbot
}
```

### `contact-messages` Collection

```javascript
{
  firstName: "Jane",
  lastName: "Smith",
  email: "jane@example.com",
  message: "Message content...",
  subject: "Product Inquiry",
  phone: "+1234567890",
  submittedAt: Timestamp,
  status: "new",            // new | read | responded | archived
  priority: "normal",       // low | normal | high
  source: "website"         // website | email | discord
}
```

## 📧 Email Integration (To Implement)

The email functions are currently **stubbed**. To implement them:

### Option 1: SendGrid
```bash
npm install @sendgrid/mail
```

```javascript
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: userData.email,
  from: 'noreply@honeypot.ai',
  subject: 'Welcome to Honeypot AI Waitlist! 🐝',
  html: emailTemplate
}

await sgMail.send(msg)
```

### Option 2: Resend (Recommended)
```bash
npm install resend
```

```javascript
const { Resend } = require('resend')
const resend = new Resend(process.env.RESEND_API_KEY)

await resend.emails.send({
  from: 'Honeypot AI <noreply@honeypot.ai>',
  to: userData.email,
  subject: 'Welcome to Honeypot AI Waitlist! 🐝',
  html: emailTemplate
})
```

### Option 3: Firebase Extensions
1. Go to Firebase Console → Extensions
2. Install "Trigger Email" extension
3. Configure SMTP settings
4. Use Firestore triggers to send emails

## 🔒 Security

### TODO: Add Authentication
Admin endpoints currently have no authentication. Add middleware:

```javascript
// middleware/auth.js
const admin = require('firebase-admin')

const authenticateAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1]
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }
    
    const decodedToken = await admin.auth().verifyIdToken(token)
    req.user = decodedToken
    
    // Check if user is admin (add custom claims in Firebase)
    if (!req.user.admin) {
      return res.status(403).json({ error: 'Unauthorized' })
    }
    
    next()
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { authenticateAdmin }
```

### Apply to Admin Routes
```javascript
const { authenticateAdmin } = require('../middleware/auth')

router.get('/waitlist/all', authenticateAdmin, async (req, res) => {
  // ... handler code
})
```

## 🚀 Deployment

### Deploy to Heroku
```bash
heroku create honeypot-ai-backend
heroku config:set $(cat .env | xargs)
git push heroku main
```

### Deploy to Railway
```bash
railway init
railway up
```

### Deploy to Google Cloud Run
```bash
gcloud run deploy honeypot-ai-backend \
  --source . \
  --platform managed \
  --region us-central1
```

## 🧪 Testing

Test the API:

```bash
# Get remaining spots
curl http://localhost:5000/api/waitlist/remaining

# Join waitlist
curl -X POST http://localhost:5000/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User"}'

# Submit contact message
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","email":"jane@example.com","message":"Test message"}'
```

## 📝 Next Steps

1. ✅ Set up Firebase project
2. ✅ Test waitlist endpoints
3. ✅ Test contact endpoints
4. ⬜ Implement email service (SendGrid/Resend)
5. ⬜ Add authentication for admin endpoints
6. ⬜ Deploy backend to production
7. ⬜ Connect frontend to backend
8. ⬜ Add rate limiting
9. ⬜ Add request validation middleware
10. ⬜ Add logging service (Winston/Morgan)

## 🐛 Troubleshooting

### Firebase Connection Issues
- Check that `serviceAccountKey.json` is in the correct location
- Verify Firebase project ID matches your console
- Ensure Firestore is enabled

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### CORS Errors
- Check `FRONTEND_URL` in `.env`
- Update `corsOptions` in `server.js` if needed

## 📞 Support

For questions or issues, contact: support@honeypot.ai

---

Built with 🍯 by the Honeypot AI Team
