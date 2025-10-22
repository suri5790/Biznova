# 🚀 BizNova Phase 7 - Installation & Setup Guide

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js (v14 or higher)
- ✅ MongoDB (running locally or cloud)
- ✅ Google Gemini API Key (free tier available)

---

## 📦 Installation Steps

### Step 1: Check Current Installation

```bash
cd c:/Users/satwi/OneDrive/Desktop/biznova/Biznova

# Check if dependencies are installed
cd backend
npm list @google/generative-ai
# Should show: @google/generative-ai@^0.24.1

cd ../frontend
npm list
# All dependencies should be installed
```

**Result:** ✅ All required packages are already installed! No new installations needed.

---

## 🔑 Step 2: Get Your Gemini API Key

### Option A: Get a New Key (Recommended)

1. Go to: **https://makersuite.google.com/app/apikey**
2. Click **"Create API Key"**
3. Select **"Create API key in new project"**
4. Copy the generated key (looks like: `AIzaSyC...`)

### Option B: Use Existing Key

If you already have a Gemini API key, use that.

**Free Tier Limits:**
- 60 requests per minute
- Completely free
- No credit card required

---

## ⚙️ Step 3: Configure Environment Variables

### Backend Configuration

```bash
cd c:/Users/satwi/OneDrive/Desktop/biznova/Biznova/backend

# Check if .env file exists
# If not, create it:
notepad .env
```

Add this to your `.env` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/biznova
PORT=5000

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_32_chars

# Google Gemini API (REQUIRED FOR PHASE 7)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (for advanced features)
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
DEEPGRAM_API_KEY=
```

**Replace `your_gemini_api_key_here` with your actual API key from Step 2**

---

## ▶️ Step 4: Start the Application

### Option A: Use Windows Batch Script (Easiest)

```bash
cd c:/Users/satwi/OneDrive/Desktop/biznova/Biznova
start-dev.bat
```

This will:
- Start MongoDB (if not already running)
- Start backend server on port 5000
- Start frontend on port 3000
- Open browser automatically

### Option B: Manual Start (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd c:/Users/satwi/OneDrive/Desktop/biznova/Biznova/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd c:/Users/satwi/OneDrive/Desktop/biznova/Biznova/frontend
npm start
```

**Terminal 3 - MongoDB (if not running as service):**
```bash
mongod
```

---

## ✅ Step 5: Verify Installation

### 1. Check Backend Health

Open: **http://localhost:5000/health**

Expected response:
```json
{
  "success": true,
  "message": "BizNova Backend Server is running",
  "version": "1.0.0"
}
```

### 2. Check Frontend

Open: **http://localhost:3000**

You should see the BizNova login page.

### 3. Test Gemini API

After logging in:
1. Click the floating **AI Assistant** button (bottom right)
2. Type: **"Record 2 Pepsi sold for ₹40"**
3. You should see a confirmation message

If you see the confirmation, **Phase 7 is working!** ✅

---

## 🧪 Testing Phase 7 Features

### Test 1: Add Sale (English)
```
Input: "Record 5 Maggi sold for ₹100"
Expected: Confirmation message appears
Action: Click "Yes"
Result: ✅ Sale added successfully
```

### Test 2: Add Expense (Hindi)
```
Language: Switch to हिंदी
Input: "₹500 किराया जोड़ें"
Expected: Confirmation in Hindi
Action: Click "हां"
Result: ✅ Expense added
```

### Test 3: Update Inventory (Telugu)
```
Language: Switch to తెలుగు
Input: "10 Biscuits జోడించండి"
Expected: Confirmation in Telugu
Action: Click "అవును"
Result: ✅ Stock updated
```

### Test 4: Ask Question
```
Input: "What is my profit today?"
Expected: Direct answer (no confirmation)
Result: AI responds with profit data
```

---

## 🐛 Troubleshooting

### Issue 1: "Failed to parse intent"

**Cause:** Gemini API key not set or invalid

**Solution:**
```bash
# Check your .env file
cd backend
notepad .env

# Verify GEMINI_API_KEY is set correctly
# No spaces, no quotes around the key
# Example: GEMINI_API_KEY=AIzaSyC1234...
```

### Issue 2: Backend won't start

**Cause:** Port 5000 already in use

**Solution:**
```bash
# Option A: Change port in .env
PORT=5001

# Option B: Kill the process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Issue 3: Frontend won't start

**Cause:** Port 3000 already in use

**Solution:**
```bash
# It will ask if you want to use another port
# Type: Y (yes)
# It will use port 3001 instead
```

### Issue 4: MongoDB connection failed

**Cause:** MongoDB not running

**Solution:**
```bash
# Option A: Start MongoDB service
net start MongoDB

# Option B: Run mongod manually
mongod --dbpath "C:\data\db"

# Option C: Use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your Atlas connection string
```

### Issue 5: Chatbot says "Service busy"

**Cause:** Gemini API rate limit (60 requests/min)

**Solution:** Wait a few seconds and try again

---

## 🔍 Verifying Gemini API Key

### Test your API key:

```bash
# Create a test file
cd backend
notepad test-gemini.js
```

Add this code:
```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent('Say hello');
        const response = await result.response;
        console.log('✅ Gemini API is working!');
        console.log('Response:', response.text());
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
    }
}

test();
```

Run the test:
```bash
node test-gemini.js
```

Expected output:
```
✅ Gemini API is working!
Response: Hello! How can I help you today?
```

---

## 📊 System Requirements

### Minimum:
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Storage:** 500 MB free space
- **Internet:** Required for Gemini API

### Recommended:
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 2 GB free space
- **Internet:** Stable connection (API calls)

---

## 🎯 What's Installed

### Backend Packages:
- ✅ `@google/generative-ai` - Gemini AI SDK
- ✅ `express` - Web server
- ✅ `mongoose` - MongoDB ORM
- ✅ `jsonwebtoken` - Authentication
- ✅ `bcryptjs` - Password hashing
- ✅ `cors` - Cross-origin requests
- ✅ `dotenv` - Environment variables

### Frontend Packages:
- ✅ `react` - UI framework
- ✅ `react-router-dom` - Routing
- ✅ `axios` - HTTP client
- ✅ `lucide-react` - Icons
- ✅ `tailwindcss` - Styling
- ✅ `react-markdown` - Markdown rendering

**No new packages needed for Phase 7!** Everything is already installed.

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a strong, unique value
- [ ] Use environment-specific API keys
- [ ] Enable MongoDB authentication
- [ ] Add rate limiting to API endpoints
- [ ] Use HTTPS for all connections
- [ ] Set `NODE_ENV=production`
- [ ] Never commit `.env` to Git

---

## 📞 Need Help?

1. **Check the logs:**
   ```bash
   # Backend logs show API errors
   cd backend
   npm run dev
   # Watch the console output
   ```

2. **Check browser console:**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for error messages

3. **Common fixes:**
   - Restart both servers
   - Clear browser cache
   - Verify `.env` file format
   - Check MongoDB is running

---

## ✅ Installation Complete!

Your BizNova Phase 7 is now ready! 🎉

**Next Steps:**
1. Login to BizNova
2. Click the AI Assistant button
3. Try: "Record 2 Pepsi sold for ₹40"
4. Click "Yes" to confirm
5. Check your sales page - the sale is there!

**Enjoy your conversational business manager!** 🚀

---

**Note:** All dependencies are already installed in your project. You only need to:
1. Add Gemini API key to `.env`
2. Start the servers
3. Start using Phase 7!

No `npm install` commands required! ✨
