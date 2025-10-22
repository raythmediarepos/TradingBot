# Firebase Setup Guide

Complete step-by-step guide to set up Firebase for Honeypot AI backend.

## 📋 Prerequisites

- Google account
- 15 minutes of your time

---

## 🔥 Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. **Project name:** `honeypot-ai` (or your preferred name)
4. Click **Continue**
5. **Google Analytics:** You can disable this for now (optional)
6. Click **Create project**
7. Wait for project to be created
8. Click **Continue** when done

---

## 🗄️ Step 2: Enable Firestore Database

1. In your Firebase project, click **"Build"** in the left sidebar
2. Click **"Firestore Database"**
3. Click **"Create database"**
4. **Start in production mode** (select this option)
5. Choose a **location** (select one close to your users):
   - `us-central` (USA)
   - `us-east1` (USA)
   - `europe-west` (Europe)
   - `asia-southeast1` (Asia)
6. Click **Enable**
7. Wait for Firestore to be provisioned

### Create Collections

Firestore will automatically create collections when you first add data, but you can create them manually:

1. Click **"Start collection"**
2. **Collection ID:** `waitlist`
3. Click **Next**
4. Add a test document (you can delete this later):
   - **Document ID:** `test`
   - **Field:** `email` | **Type:** string | **Value:** `test@example.com`
5. Click **Save**

Repeat for `contact-messages` collection.

---

## 🔑 Step 3: Generate Service Account Key

This is the most important step!

1. Click the **⚙️ Settings icon** (top left, next to "Project Overview")
2. Click **"Project settings"**
3. Go to the **"Service accounts"** tab
4. You'll see: **"Firebase Admin SDK"**
5. Select **Node.js** (should be selected by default)
6. Click **"Generate new private key"**
7. A popup will warn you: **"Your private key gives access to your project's Firebase services..."**
8. Click **"Generate key"**
9. A JSON file will download: `honeypot-ai-firebase-adminsdk-xxxxx.json`

---

## 📁 Step 4: Add Service Account Key to Backend

### Rename the file:

1. Find the downloaded JSON file
2. Rename it to exactly: `serviceAccountKey.json`
3. Move it to your backend directory:

```
HoneyPot AI/Website/backend/serviceAccountKey.json
```

### Your backend folder should look like:

```
backend/
├── api/
├── config/
├── services/
├── serviceAccountKey.json  ← Add this file here
├── server.js
├── package.json
└── ...
```

### ⚠️ IMPORTANT: Never Commit This File!

The `serviceAccountKey.json` contains sensitive credentials. It's already in `.gitignore`:

```gitignore
# backend/.gitignore
serviceAccountKey.json  ← Already protected
firebase-adminsdk-*.json
```

**Double-check:**
```bash
cd backend
git status
# serviceAccountKey.json should NOT appear in the list
```

---

## 🌐 Step 5: Get Firebase Web Config (Optional)

If you need Firebase in your frontend later:

1. Go to **Project settings** (⚙️ icon)
2. Scroll down to **"Your apps"**
3. Click the **</>** (Web) icon
4. **App nickname:** `Honeypot AI Web`
5. **Don't** check "Also set up Firebase Hosting"
6. Click **Register app**
7. Copy the `firebaseConfig` object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "honeypot-ai.firebaseapp.com",
  projectId: "honeypot-ai",
  storageBucket: "honeypot-ai.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

8. Save this for later (you'll need it for frontend Firebase)

---

## 🛠️ Step 6: Install Dependencies & Run

```bash
cd backend
npm install
```

### Create `.env` file:

```bash
cp env-example.txt .env
```

### Edit `.env` file:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# You don't need these for the service account approach
# But keep them if you want to use the web SDK
FIREBASE_PROJECT_ID=honeypot-ai
```

### Start the server:

```bash
# Development mode (auto-reload)
npm run dev

# Or production mode
npm start
```

You should see:
```
✅ Firebase Admin initialized successfully
🚀 Honeypot AI Backend running on port 5000
🌍 Environment: development
📡 Frontend URL: http://localhost:3000
```

---

## ✅ Step 7: Test the Backend

### Test 1: Health Check

```bash
curl http://localhost:5000/api/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "service": "Honeypot AI Backend"
}
```

### Test 2: Check Waitlist Spots

```bash
curl http://localhost:5000/api/waitlist/remaining
```

**Expected response:**
```json
{
  "success": true,
  "remaining": 100,
  "total": 100,
  "filled": 0
}
```

### Test 3: Join Waitlist

```bash
curl -X POST http://localhost:5000/api/waitlist/join \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Successfully added to waitlist!",
  "userId": "abc123def456",
  "position": 1
}
```

### Test 4: Verify in Firebase Console

1. Go to Firebase Console
2. Click **Firestore Database**
3. You should see the `waitlist` collection
4. Click on it to see your test user!

---

## 🚀 Step 8: Deploy to Production

### For Heroku:

```bash
# Don't commit serviceAccountKey.json!
# Instead, set it as an environment variable

# Convert JSON to single line
cat serviceAccountKey.json | jq -c '.' > service-account-single-line.json

# Set as environment variable
heroku config:set FIREBASE_SERVICE_ACCOUNT="$(cat service-account-single-line.json)"
heroku config:set NODE_ENV=production
```

### For Vercel/Railway:

Add `FIREBASE_SERVICE_ACCOUNT` as an environment variable in the dashboard:

1. Copy the contents of `serviceAccountKey.json`
2. Minify it (remove all line breaks)
3. Paste into environment variable

### For Google Cloud Run:

Google Cloud Run automatically uses Application Default Credentials, so you don't need to set anything!

---

## 🔒 Security Rules for Firestore

Set up Firestore security rules:

1. Go to **Firestore Database** → **Rules** tab
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Waitlist collection - only backend can write
    match /waitlist/{document} {
      allow read: if false;  // No public reads
      allow write: if false; // Only backend (admin) can write
    }
    
    // Contact messages - only backend can write
    match /contact-messages/{document} {
      allow read: if false;  // No public reads
      allow write: if false; // Only backend (admin) can write
    }
  }
}
```

3. Click **Publish**

This ensures only your backend (with admin credentials) can read/write data!

---

## 🐛 Troubleshooting

### Error: "Cannot find module './serviceAccountKey.json'"

**Solution:** Make sure the file is named exactly `serviceAccountKey.json` and is in the `backend/` directory.

### Error: "Credential implementation provided to initializeApp() via credential property failed"

**Solution:** Your `serviceAccountKey.json` might be corrupted. Re-download it from Firebase Console.

### Error: "PERMISSION_DENIED: Missing or insufficient permissions"

**Solution:** 
1. Check Firestore security rules
2. Make sure you're using the admin SDK (not client SDK)
3. Verify service account has proper permissions

### Error: "Port 5000 already in use"

**Solution:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

---

## 📧 Next Steps

### 1. Implement Email Sending

Uncomment and implement the email functions in:
- `services/waitlistService.js` - `sendWaitlistConfirmationEmail()`
- `services/contactService.js` - `sendContactConfirmationEmail()`

Choose an email provider:
- **Resend** (recommended): https://resend.com
- **SendGrid**: https://sendgrid.com
- **Firebase Extensions**: Install "Trigger Email" extension

### 2. Add Authentication

Protect admin endpoints with Firebase Auth:
- Create `middleware/auth.js`
- Add `authenticateAdmin` middleware
- Apply to admin routes

### 3. Connect Frontend

Update your Next.js API route to call your backend:

```javascript
// app/api/subscribe/route.ts
export async function POST(request: Request) {
  const { email, firstName, lastName } = await request.json()
  
  const response = await fetch(`${process.env.BACKEND_URL}/api/waitlist/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, firstName, lastName })
  })
  
  return Response.json(await response.json())
}
```

---

## ✅ Checklist

- [ ] Created Firebase project
- [ ] Enabled Firestore Database
- [ ] Downloaded `serviceAccountKey.json`
- [ ] Added file to `backend/` directory
- [ ] Installed dependencies (`npm install`)
- [ ] Created `.env` file
- [ ] Started server (`npm run dev`)
- [ ] Tested health endpoint
- [ ] Tested waitlist endpoint
- [ ] Verified data in Firebase Console
- [ ] Set up Firestore security rules
- [ ] Ready to connect frontend!

---

## 🆘 Need Help?

- Firebase Docs: https://firebase.google.com/docs
- Firestore Docs: https://firebase.google.com/docs/firestore
- Contact: support@honeypot.ai

---

🎉 **You're all set! Your Firebase backend is ready to go!** 🐝🍯

