# 🤖 AI Features Setup Guide - Biznova

## Prerequisites

You need a **Google Gemini API Key**. If you don't have one:
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the API key

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
npm install @google/generative-ai
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install react-markdown
```

### 3. Configure Environment Variables

Add your Gemini API key to the backend `.env` file:

```env
# Add this to backend/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

Example:
```env
GEMINI_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvw
```

### 4. Restart Backend Server

```bash
cd backend
npm start
```

### 5. Start Frontend (if not running)

```bash
cd frontend
npm start
```

## ✅ Features Implemented

### 1. **Demand Forecasting** 📈
- Analyzes last 30 days of sales
- Identifies top-selling products
- Predicts stock requirements
- Recommends reorder points
- Prevents stockouts

**API Endpoint:** `GET /api/ai-insights/generate/demand-forecast?days=30`

### 2. **Revenue Optimization** 💰
- Analyzes pricing vs demand
- Identifies margin opportunities
- Suggests optimal price points
- Recommends bundling strategies
- Maximizes profitability

**API Endpoint:** `GET /api/ai-insights/generate/revenue-optimization`

### 3. **Expense Forecasting** 📅
- Analyzes last 90 days of expenses
- Considers Indian seasons & festivals
- Predicts next month's costs
- Weather impact analysis (AC, logistics)
- Budget recommendations

**API Endpoint:** `GET /api/ai-insights/generate/expense-forecast`

### 4. **AI Chat Assistant** 💬
- General business questions
- Context-aware responses
- Uses your business data

**API Endpoint:** `POST /api/ai-insights/chat`

## 🎨 UI Routes

- **Main AI Insights:** `/ai` - Three feature tabs
- **AI Chat (old):** `/ai-chat` - Chat interface

## 🧪 Testing

1. Navigate to **AI** page in sidebar
2. Click any of the three feature cards
3. Click "Generate AI Insights"
4. Wait 10-30 seconds for Gemini to analyze
5. View detailed AI-generated insights

## 📊 Data Requirements

For best results, ensure you have:
- ✅ At least 10 sales records
- ✅ Inventory items with pricing
- ✅ Some expense records

## 🔍 Troubleshooting

### Error: "GEMINI_API_KEY is not defined"
- Check backend `.env` file has the API key
- Restart backend server after adding key

### Error: "No sales data available"
- Add some sales in the Sales page first
- Each feature needs specific data

### Error: "Failed to generate AI response"
- Check API key is valid
- Verify internet connection
- Check Gemini API quotas

### Response takes too long
- Normal: AI analysis takes 10-30 seconds
- Complex data may take longer
- Wait patiently for first generation

## 🌟 Gemini AI Context

The AI receives:
- **Sales Data:** Recent transactions, items sold, revenue
- **Inventory:** Stock levels, pricing, categories
- **Expenses:** Categorized spending, trends
- **Seasonal Context:** Indian festivals, weather, monsoon
- **Business Metrics:** Revenue, margins, customer data

## 💡 Tips for Best Results

1. **Generate regularly:** Weekly for demand, monthly for expenses
2. **More data = better insights:** 30+ days of sales ideal
3. **Update inventory:** Keep stock levels current
4. **Categorize expenses:** Mark sales vs operating correctly
5. **Act on insights:** Implement AI recommendations

## 🔐 Security

- API key stored in backend `.env` only
- Never exposed to frontend
- All routes require authentication
- User data stays isolated

## 📝 Notes

- Each generation counts toward Gemini API quota
- Free tier: 60 requests per minute
- Insights are generated fresh each time
- No caching to ensure latest data

## 🚀 Next Steps

After setup is complete:
1. Generate Demand Forecast
2. Review stock recommendations
3. Generate Revenue Optimization
4. Implement pricing strategies
5. Generate Expense Forecast
6. Plan budget accordingly

---

**Need help?** Check the backend console for AI generation logs marked with 🤖
