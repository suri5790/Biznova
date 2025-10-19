# 🤖 COMPLETE AI INTEGRATION SETUP GUIDE

## 🎯 Overview

This guide will help you set up ALL AI features with multiple API integrations:

- **OpenAI** (GPT-4/3.5 Chat + DALL·E Image Generation)
- **ElevenLabs** (Text-to-Speech Voice Generation)
- **Deepgram** (Speech-to-Text Transcription)
- **Stability AI** (Alternative Image Generation)

---

## 📋 Prerequisites

- Node.js installed
- Backend and Frontend servers configured
- MongoDB running
- Credit card for API services (most have free tiers)

---

## 🔑 Step 1: Get API Keys

### **OpenAI (Required for Advanced AI)**

**Features:** Chat responses, Business analysis, Image generation

**Free Tier:** $5 free credits for new users

**Setup:**
1. Go to: https://platform.openai.com/signup
2. Create account and verify email
3. Go to: https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy the key (starts with `sk-...`)
6. **Save it securely** (you can't see it again!)

**Cost:**
- GPT-3.5-Turbo: $0.002/1K tokens (~500 requests for $1)
- GPT-4: $0.03/1K tokens (more expensive but better)
- DALL·E 3: $0.040/image (1024x1024)

---

### **ElevenLabs (Optional - Voice Generation)**

**Features:** Text-to-Speech, Voice cloning

**Free Tier:** 10,000 characters/month

**Setup:**
1. Go to: https://elevenlabs.io/
2. Sign up with email
3. Go to: https://elevenlabs.io/app/settings/api
4. Copy your API key
5. Choose a voice ID from: https://elevenlabs.io/app/voice-lab

**Popular Voice IDs:**
- `EXAVITQu4vr4xnSDxMaL` - Sarah (Female, Professional)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (Female, Calm)
- `pNInz6obpgDQGcFmaJgB` - Adam (Male, Deep)

**Cost:**
- Free: 10,000 chars/month
- Starter: $5/month (30,000 chars)

---

### **Deepgram (Optional - Speech Recognition)**

**Features:** Speech-to-Text, Voice recognition

**Free Tier:** $200 free credits

**Setup:**
1. Go to: https://deepgram.com/
2. Sign up and verify email
3. Go to: https://console.deepgram.com/project/*/keys
4. Create a new API key
5. Copy the key

**Cost:**
- Nova-2 Model: $0.0043/minute
- Whisper Model: $0.0048/minute

---

### **Stability AI (Optional - Alternative to DALL·E)**

**Features:** Text-to-Image generation (SDXL)

**Free Tier:** 25 credits (≈25 images)

**Setup:**
1. Go to: https://platform.stability.ai/
2. Create account
3. Go to: https://platform.stability.ai/account/keys
4. Generate API key
5. Copy the key (starts with `sk-...`)

**Cost:**
- SDXL 1.0: 6.5 credits per image (~$0.065)

---

## ⚙️ Step 2: Configure Backend

### **Update `.env` File**

Create or edit `backend/.env`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/biznova
PORT=5000

# JWT Authentication
JWT_SECRET=your_jwt_secret_here_change_in_production

# OpenAI (Required for AI features)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ElevenLabs (Optional - for voice generation)
ELEVENLABS_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Deepgram (Optional - for speech-to-text)
DEEPGRAM_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Stability AI (Optional - alternative image generation)
STABILITY_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:**
- Never commit `.env` to Git!
- Keep your keys secret
- Rotate keys if exposed

---

### **Update `server.js`**

Add the new routes:

```javascript
// Import advanced AI routes
const aiRoutesAdvanced = require('./routes/aiRoutesAdvanced');

// Register routes
app.use('/api/ai', aiRoutesAdvanced);
```

Full example:

```javascript
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/sales', require('./routes/salesRoutes'));
app.use('/api/expenses', require('./routes/expensesRoutes'));
app.use('/api/customers', require('./routes/customersRoutes'));
app.use('/api/profit-analytics', require('./routes/profitAnalyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutesAdvanced')); // ✅ NEW

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

---

### **Install Additional Dependencies**

```bash
cd backend
npm install axios multer
```

---

## 🎨 Step 3: Update Frontend

### **Update `services/api.js`**

Add advanced AI API methods:

```javascript
// Advanced AI API
export const aiAPIAdvanced = {
  // Check AI service status
  getStatus: async () => {
    const response = await apiClient.get('/ai/status');
    return response.data;
  },

  // Chat with AI
  chat: async (message, context) => {
    const response = await apiClient.post('/ai/chat', { message, context });
    return response.data;
  },

  // Get business insights
  getInsights: async () => {
    const response = await apiClient.get('/ai/insights');
    return response.data;
  },

  // Generate image
  generateImage: async (prompt, style = 'photographic') => {
    const response = await apiClient.post('/ai/generate-image', { prompt, style });
    return response.data;
  },

  // Text to speech
  textToSpeech: async (text, voiceId) => {
    const response = await apiClient.post('/ai/text-to-speech', { text, voiceId });
    return response.data;
  },

  // Speech to text
  speechToText: async (audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await apiClient.post('/ai/speech-to-text', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
```

---

### **Update `pages/Ai.jsx`**

Replace the existing `handleSendMessage` function:

```javascript
import { aiAPIAdvanced } from '../services/api';

const handleSendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputMessage('');
  setIsLoading(true);

  try {
    // Use advanced AI API
    const response = await aiAPIAdvanced.chat(inputMessage, context);

    if (response.success) {
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions || [],
        usingAI: response.data.usingOpenAI || false
      };
      setMessages(prev => [...prev, aiMessage]);
    } else {
      throw new Error(response.message || 'Failed to get AI response');
    }
  } catch (error) {
    console.error('Error sending message:', error);
    const errorMessage = {
      id: Date.now() + 1,
      type: 'ai',
      content: "I'm sorry, I'm having trouble right now. Please check if the backend is running.",
      timestamp: new Date(),
      isError: true
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
```

Add image generation handler:

```javascript
const handleGenerateImage = async () => {
  if (!inputMessage.trim()) {
    alert('Please enter a description for the image.');
    return;
  }

  setIsLoading(true);
  try {
    const response = await aiAPIAdvanced.generateImage(inputMessage, 'business');

    if (response.success && response.data.imageUrl) {
      const imageMessage = {
        id: Date.now(),
        type: 'ai',
        content: 'Here\'s the generated image:',
        timestamp: new Date(),
        imageUrl: response.data.imageUrl
      };
      setMessages(prev => [...prev, imageMessage]);
      setInputMessage(''); // Clear after success
    }
  } catch (error) {
    console.error('Error generating image:', error);
    alert(error.response?.data?.message || 'Image generation is not configured. Add API keys to enable.');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🧪 Step 4: Test Everything

### **1. Check AI Service Status**

```bash
# After logging in, check status
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/ai/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "services": {
      "openai": { "configured": true, "features": [...] },
      "elevenlabs": { "configured": true, "features": [...] },
      "deepgram": { "configured": false, "features": [...] },
      "imageGeneration": { "configured": false, "features": [...] }
    }
  }
}
```

---

### **2. Test Chat**

Go to AI Assistant page, type:
```
"Show me my inventory status"
```

**With OpenAI configured:**
- You'll get intelligent, contextual responses
- Natural language understanding
- Better recommendations

**Without OpenAI (fallback):**
- Rule-based responses
- Still functional
- Uses your business data

---

### **3. Test Image Generation**

Type in chat:
```
"A professional business logo with modern design"
```

Click the image button (purple icon).

**Requirements:**
- OPENAI_API_KEY configured OR
- STABILITY_API_KEY configured

---

### **4. Test Business Insights**

Create a new API call from frontend:

```javascript
const insights = await aiAPIAdvanced.getInsights();
console.log(insights);
```

Should return analysis of your business data with recommendations.

---

## 📊 Step 5: Full End-to-End Test

Follow your exact scenario:

### **Test Scenario:**

```
1. Add 100 smartphones @ ₹200 cost
2. Sell 5 smartphones @ ₹300 each
3. Add ₹50 sales expense
4. Check results
```

**Expected Results:**
- Inventory: 95 units (100 - 5) ✅
- COGS: ₹1,000 (5 × ₹200) ✅
- Revenue: ₹1,500 (5 × ₹300) ✅
- Gross Profit: ₹500 (₹1,500 - ₹1,000) ✅
- Net Profit: ₹450 (₹500 - ₹50) ✅

**Then ask AI:**
```
"Analyze my business performance"
```

AI will respond with insights about your sales, profit margins, and recommendations!

---

## 💰 Cost Estimates

### **Minimal Setup (OpenAI only):**
```
Cost per month: ~$5-10
- 500 chat messages: ~$1
- 20 business insights: ~$0.50
- 50 images (DALL·E): ~$2
```

### **Full Setup (All APIs):**
```
Cost per month: ~$15-25
- OpenAI: $5-10
- ElevenLabs: $5 (starter plan)
- Deepgram: $5 (200 minutes)
- Stability AI: $5 (50 images)
```

### **Free Tier Only:**
```
Cost: $0/month
- OpenAI: $5 free credits (one-time)
- ElevenLabs: 10,000 chars/month free
- Deepgram: $200 free credits (one-time)
- Stability AI: 25 free images

Can last 1-2 months with moderate usage!
```

---

## 🚨 Troubleshooting

### **Error: "OpenAI API key not configured"**
- Check `.env` file has `OPENAI_API_KEY=sk-...`
- Restart backend server
- Verify key is valid at https://platform.openai.com/api-keys

### **Error: "Insufficient quota"**
- Your API credits are exhausted
- Add payment method or wait for free tier reset

### **Error: "Invalid API key"**
- Key is wrong or expired
- Generate new key
- Update `.env` and restart server

### **Image generation not working**
- Verify OPENAI_API_KEY or STABILITY_API_KEY is set
- Check API credits
- See error message in backend logs

### **Voice features not working**
- ELEVENLABS_API_KEY (TTS) or DEEPGRAM_API_KEY (STT) not set
- Check free tier limits
- Verify keys in console

---

## ✅ Success Checklist

- [ ] All API keys added to `.env`
- [ ] Backend dependencies installed (`axios`, `multer`)
- [ ] Routes registered in `server.js`
- [ ] Backend server restarted
- [ ] Frontend API service updated
- [ ] AI page component updated
- [ ] `/api/ai/status` returns configured services
- [ ] Chat works (with fallback if no OpenAI)
- [ ] Business insights generated
- [ ] Image generation works (if configured)
- [ ] Voice features work (if configured)
- [ ] Inventory/sales/expenses system working
- [ ] Dashboard shows correct values
- [ ] Analytics shows profit metrics

---

## 🎉 You're All Set!

Your AI assistant now has:

✅ **Smart Chat** - OpenAI or rule-based fallback
✅ **Business Insights** - AI-powered analysis
✅ **Image Generation** - DALL·E 3 or Stability AI
✅ **Voice Generation** - ElevenLabs TTS
✅ **Speech Recognition** - Deepgram STT
✅ **Real Business Data** - Inventory, sales, expenses
✅ **Profit Calculations** - COGS, revenue, net profit
✅ **Dashboard Updates** - Real-time metrics

**Start with just OpenAI (cheapest) and add other services as needed!**

---

## 📞 Need Help?

**API Documentation:**
- OpenAI: https://platform.openai.com/docs
- ElevenLabs: https://docs.elevenlabs.io
- Deepgram: https://developers.deepgram.com
- Stability AI: https://platform.stability.ai/docs

**Common Issues:**
1. Keys not working → Regenerate and update
2. Quota exceeded → Add credits or wait
3. Network errors → Check firewall/proxy
4. CORS errors → Verify backend CORS settings

**Test API Keys:**
```bash
# Test OpenAI
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Test ElevenLabs
curl https://api.elevenlabs.io/v1/voices \
  -H "xi-api-key: $ELEVENLABS_API_KEY"
```

Happy building! 🚀
