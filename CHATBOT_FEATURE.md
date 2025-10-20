# 🤖 AI Chatbot Feature - Multilingual Voice-Enabled Assistant

## ✅ What's Been Built

A **floating AI chatbot** that's accessible from all pages with:
- 🎤 **Voice Input** (Speech-to-Text)
- 🔊 **Voice Output** (Text-to-Speech)
- 🌍 **Multilingual** (English, Hindi, Telugu)
- 🗄️ **Database Access** (Sales, Inventory, Expenses, Customers)
- ✨ **Cool Animations**
- 📱 **Floating Button** (Bottom-right corner)

---

## 🎯 Features

### 1. **Multilingual Support**
- **English** 🇬🇧
- **Hindi (हिंदी)** 🇮🇳
- **Telugu (తెలుగు)** 🇮🇳

**Smart Language Handling:**
- Understands transliterated text (Hindi/Telugu written in English)
- Example: "kitna sales hua aaj" → Understands and responds in Hindi
- Example: "inventory lo em undi" → Understands and responds in Telugu

### 2. **Voice Input (Speech-to-Text)**
- Click microphone button to speak
- Automatically converts speech to text
- Language-specific recognition
- Works in Chrome, Edge, Safari

### 3. **Voice Output (Text-to-Speech)**
- AI responses are spoken aloud
- Natural voice in selected language
- Toggle ON/OFF with speaker button
- Auto-speaks new messages

### 4. **Business Intelligence**
- Access to ALL your business data:
  - ✅ Sales transactions
  - ✅ Inventory items & stock levels
  - ✅ Expenses by category
  - ✅ Customer information
  - ✅ Today's metrics
  - ✅ Monthly performance
  - ✅ Top-selling items
  - ✅ Low stock alerts

### 5. **Floating UI**
- Beautiful button at bottom-right
- Pulsing animation to attract attention
- Accessible from ALL pages
- Doesn't interfere with content

---

## 🚀 How to Use

### Opening the Chatbot
1. Look for the **purple pulsing button** at bottom-right corner
2. Has a message icon with sparkle
3. Click to open chat window

### Text Input
1. Type your question in the input field
2. Press **Enter** or click **Send** button
3. Get instant AI response

### Voice Input
1. Click the **Microphone** button
2. Speak your question clearly
3. Text appears automatically
4. Click **Send** or press **Enter**

### Changing Language
1. Use the dropdown at top-right
2. Select: 🇬🇧 English | 🇮🇳 हिंदी | 🇮🇳 తెలుగు
3. All responses switch to that language
4. Voice recognition adjusts automatically

### Voice Output Control
- **Speaker ON** 🔊 - AI speaks responses
- **Speaker OFF** 🔇 - Silent text-only mode
- Click speaker icon to toggle

---

## 💬 Example Queries

### English
```
"What were my sales today?"
"Which items are low in stock?"
"Show me my top selling products"
"How much profit did I make this month?"
"Who are my recent customers?"
"What are my biggest expenses?"
```

### Hindi (हिंदी)
```
"आज की बिक्री कितनी है?"
"कौन से सामान कम हैं?"
"मेरे सबसे ज्यादा बिकने वाले उत्पाद कौन से हैं?"
"इस महीने कितना मुनाफा हुआ?"
"मेरे हालिया ग्राहक कौन हैं?"
```

### Telugu (తెలుగు)
```
"ఈరోజు అమ్మకాలు ఎంత?"
"ఏ వస్తువులు తక్కువగా ఉన్నాయి?"
"నా అత్యధికంగా అమ్ముడయ్యే ఉత్పత్తులు ఏమిటి?"
"ఈ నెలలో ఎంత లాభం వచ్చింది?"
"నా ఇటీవలి కస్టమర్లు ఎవరు?"
```

### Transliterated (Hindi/Telugu in English)
```
"kitna sales hua aaj?" (Hindi)
"stock me kya kam hai?" (Hindi)
"inventory lo em undi?" (Telugu)
"ee month lo entha profit?" (Telugu)
```

The AI understands and responds correctly!

---

## 🛠️ Technology Stack

### Backend
- **Google Gemini 2.0 Flash** - AI model for understanding & responses
- **Express.js** - API endpoints
- **MongoDB** - Database queries for business data
- **Node.js** - Server runtime

### Frontend
- **React** - UI component
- **Web Speech API** - Voice input/output (FREE!)
- **Tailwind CSS** - Styling & animations
- **Lucide React** - Icons

### Voice Technology (FREE & Browser-Native)
- **SpeechRecognition API** - Speech-to-Text
  - Languages: en-IN, hi-IN, te-IN
  - No API key needed
  - Works offline after initial load
  
- **SpeechSynthesis API** - Text-to-Speech
  - Natural voices in all 3 languages
  - No external service
  - Free forever

---

## 📊 Data Access

The chatbot has real-time access to:

### Sales Data
- Total sales count & revenue
- Today's sales
- Monthly performance
- Recent transactions (last 100)
- Items sold with quantities

### Inventory Data
- All inventory items
- Current stock levels
- Low stock items
- Item prices & categories

### Expense Data
- Total expenses
- Today's expenses
- Recent expenses (last 100)
- Expense categories

### Customer Data
- Total customers
- Recent customers (last 50)
- Customer names & phones

### Calculated Metrics
- Gross Profit
- Net Profit
- Top-selling items
- Revenue trends

---

## 🎨 UI Features

### Floating Button
- **Position:** Bottom-right, fixed
- **Color:** Purple-blue gradient
- **Animation:** Pulsing glow effect
- **Icon:** Message bubble with sparkle
- **Hover:** Scale up + shadow effect
- **Tooltip:** Shows on hover

### Chat Window
- **Size:** 384px × 600px (w × h)
- **Position:** Bottom-right
- **Style:** Modern card with shadow
- **Header:** Gradient purple-blue
- **Messages:** Speech bubble design
- **Scrollable:** Auto-scroll to latest

### Message Bubbles
- **User:** Purple gradient, right-aligned
- **Bot:** White with border, left-aligned
- **Timestamp:** Small text below message
- **Loading:** Animated spinner
- **Speaking:** Pulsing speaker icon

### Controls
- **Language Selector:** Dropdown at top
- **Voice Toggle:** Speaker icon
- **Close Button:** X at top-right
- **Mic Button:** Left of input
- **Send Button:** Right of input

---

## 🔧 Installation

### Backend
```bash
cd backend
# Packages already installed (Gemini AI from previous features)
npm start
```

### Frontend
```bash
cd frontend
# No new packages needed! Web Speech API is browser-native
npm start
```

### Environment
Make sure `backend/.env` has:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🌟 Key Highlights

### 1. **No Additional Costs**
- Web Speech API is **FREE**
- Browser-native, no external service
- No API keys for voice
- Only Gemini AI (we already have)

### 2. **Works Offline (Partially)**
- Voice recognition works after initial load
- AI responses need internet (Gemini API)

### 3. **Natural Conversations**
- Contextual responses
- Remembers conversation in session
- Uses YOUR actual business data
- Specific numbers, not generic advice

### 4. **Privacy & Security**
- Voice processed locally in browser
- Data only sent to Gemini (encrypted)
- User-specific data (auth required)
- No third-party voice services

### 5. **Multilingual Intelligence**
- Understands code-mixing (Hinglish, Tenglish)
- Handles transliteration
- Responds in user's preferred language
- Smart context understanding

---

## 💡 Use Cases

### For Daily Operations
```
User: "What's my stock status?"
Bot: Lists low stock items with quantities

User: "How much did I earn today?"
Bot: Shows today's revenue, transactions, profit

User: "Which product sells the most?"
Bot: Lists top 5 items with quantities & revenue
```

### For Planning
```
User: "Show my expenses this month"
Bot: Breakdown by category with amounts

User: "Do I have enough iPhone stock?"
Bot: Current stock + recent sales trend

User: "Who bought from me recently?"
Bot: Lists last 5 customers with purchase details
```

### In Hindi
```
User: "आज कितने ग्राहक आए?"
Bot: "आज 12 ग्राहक आए। कुल बिक्री ₹45,000 की हुई।"

User: "कौन सा सामान ख़त्म हो रहा है?"
Bot: "ये सामान कम हैं: iPhone 15 (5 बचे), AirPods (3 बचे)"
```

### In Telugu
```
User: "ఈరోజు ఎంత లాభం?"
Bot: "ఈరోజు మొత్తం లాభం ₹15,000. 8 విక్రయాలు జరిగాయి।"

User: "ఏ కస్టమర్లు వచ్చారు?"
Bot: "ఇటీవలి కస్టమర్లు: రాజ్, సునీత, విజయ్..."
```

---

## 🔍 Browser Compatibility

### Fully Supported ✅
- **Chrome** (Desktop & Mobile)
- **Edge** (Desktop)
- **Safari** (Desktop & iOS)
- **Opera** (Desktop)

### Partially Supported ⚠️
- **Firefox** - Text works, voice may be limited

### Recommended
- **Chrome** on Desktop - Best experience
- **Chrome** on Android - Full support
- **Safari** on iOS - Works well

---

## ⚙️ Configuration

### Default Settings
```javascript
language: 'en'           // Default: English
autoSpeak: true          // Auto-speak responses
continuous: false        // One question at a time
interimResults: false    // Final results only
```

### Customization
Users can:
- ✅ Change language anytime
- ✅ Toggle auto-speak ON/OFF
- ✅ Close/open chatbot
- ✅ Scroll through message history

---

## 📝 API Endpoints

### POST `/api/chatbot/chat`
**Request:**
```json
{
  "message": "What were my sales today?",
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Today you had 8 sales totaling ₹45,000...",
    "language": "en",
    "timestamp": "2025-10-20T15:30:00.000Z"
  }
}
```

### GET `/api/chatbot/status`
**Response:**
```json
{
  "success": true,
  "data": {
    "status": "Online",
    "gemini": "Active",
    "supportedLanguages": ["en", "hi", "te"],
    "features": ["text", "voice", "multilingual", "database_access"]
  }
}
```

---

## 🐛 Troubleshooting

### Microphone not working
- Check browser permissions
- Allow microphone access
- Use HTTPS (required for mic)
- Try Chrome (best support)

### Voice not speaking
- Check speaker icon is ON (not muted)
- Increase device volume
- Check browser audio permissions
- Wait for voices to load (first time)

### Wrong language detected
- Speak clearly
- Select correct language first
- Use language dropdown
- Try typing instead

### Chatbot not responding
- Check GEMINI_API_KEY in backend
- Verify backend is running
- Check console for errors
- Restart backend server

### Button not visible
- Check z-index (should be 50)
- Clear browser cache
- Check if logged in
- Refresh page

---

## ✨ Cool Features

### 1. **Pulsing Animation**
The floating button has a beautiful pulse effect that attracts attention without being annoying.

### 2. **Real-time Indicators**
- 🔴 **Red mic** when listening
- 💬 **"Thinking..."** when processing
- 🔊 **"Speaking..."** when reading aloud
- ✅ **Green dot** shows bot is online

### 3. **Smart Scroll**
Auto-scrolls to latest message, smooth animation.

### 4. **Timestamp**
Every message shows time sent (HH:MM format).

### 5. **Welcome Message**
Greeted in selected language when opened.

---

## 🎯 Future Enhancements (Possible)

- [ ] Save conversation history
- [ ] Voice commands ("Open sales page")
- [ ] Proactive suggestions
- [ ] Image analysis (product photos)
- [ ] WhatsApp integration
- [ ] Scheduled reports via chat
- [ ] Multi-turn conversations with memory
- [ ] Chart/graph generation in chat

---

## 📋 Files Created

### Backend
1. **`chatbotController.js`** - Main chatbot logic
2. **`chatbotRoutes.js`** - API routes

### Frontend
1. **`FloatingChatbot.jsx`** - Main component
2. **Updated `api.js`** - Chatbot API methods
3. **Updated `App.jsx`** - Added chatbot to all pages

### Documentation
1. **`CHATBOT_FEATURE.md`** - This file

---

## 🎉 Summary

You now have a **powerful multilingual AI chatbot** that:
- 🎤 Understands voice in 3 languages
- 🗣️ Speaks responses naturally
- 🧠 Knows your entire business
- 📊 Answers with real data
- 🌍 Handles transliteration
- ✨ Looks beautiful
- 📱 Floats on all pages
- 🆓 Costs nothing extra!

**Access it from anywhere in your app with the purple pulsing button at bottom-right!**

---

**The chatbot is ready to revolutionize how you interact with your business data!** 🚀🤖✨
