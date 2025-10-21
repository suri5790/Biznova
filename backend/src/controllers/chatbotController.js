/**
 * AI Chatbot Controller - Handles intelligent business queries with database access
 * Supports multilingual conversations with full business context
 */

const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ttsService = require('../services/ttsService');
const mongoose = require('mongoose');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ChatbotController {
    /**
     * Process chatbot query with business context
     */
    async chat(req, res) {
        try {
            const { message, language = 'en' } = req.body;
            const userId = req.user._id;

            if (!message || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            console.log(`🤖 Chatbot Query [${language}]: "${message}" from user ${userId}`);

            // Fetch ALL business data for context (no limits)
            const [sales, inventory, expenses, customers] = await Promise.all([
                Sale.find({ user_id: userId }).sort({ createdAt: -1 }),
                Inventory.find({ user_id: userId }),
                Expense.find({ user_id: userId }).sort({ date: -1 }),
                Customer.find({ user_id: userId }).sort({ createdAt: -1 })
            ]);

            // Debug: Log what data was fetched
            console.log(`📊 Data fetched for user ${userId}:`);
            console.log(`   - Sales: ${sales.length} records`);
            console.log(`   - Inventory: ${inventory.length} items`);
            console.log(`   - Expenses: ${expenses.length} records`);
            console.log(`   - Customers: ${customers.length} records`);

            // Calculate business metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
            const totalCOGS = sales.reduce((sum, sale) => sum + (sale.total_cogs || 0), 0);
            const totalGrossProfit = sales.reduce((sum, sale) => sum + (sale.gross_profit || 0), 0);
            const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            
            // Calculate profits
            const grossProfit = totalGrossProfit || (totalRevenue - totalCOGS);
            const netProfit = grossProfit - totalExpenses;

            // Debug: Log calculated totals
            console.log(`💰 Financial Summary:`);
            console.log(`   - Total Revenue: ₹${totalRevenue}`);
            console.log(`   - Total COGS: ₹${totalCOGS}`);
            console.log(`   - Gross Profit: ₹${grossProfit}`);
            console.log(`   - Total Expenses: ₹${totalExpenses}`);
            console.log(`   - Net Profit: ₹${netProfit}`);

            // Get today's data
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySales = sales.filter(s => new Date(s.createdAt) >= today);
            const todayRevenue = todaySales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
            const todayCOGS = todaySales.reduce((sum, s) => sum + (s.total_cogs || 0), 0);
            const todayGrossProfitTotal = todaySales.reduce((sum, s) => sum + (s.gross_profit || 0), 0);
            const todayExpenses = expenses.filter(e => new Date(e.date) >= today);
            const todayExpenseAmount = todayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            
            // Calculate today's profits
            const todayGrossProfit = todayGrossProfitTotal || (todayRevenue - todayCOGS);
            const todayNetProfit = todayGrossProfit - todayExpenseAmount;

            // Today's item-level analysis
            const todayItemSales = {};
            todaySales.forEach(sale => {
                sale.items.forEach(item => {
                    if (!todayItemSales[item.item_name]) {
                        todayItemSales[item.item_name] = { 
                            quantity: 0, 
                            revenue: 0,
                            cogs: 0,
                            profit: 0
                        };
                    }
                    todayItemSales[item.item_name].quantity += item.quantity;
                    todayItemSales[item.item_name].revenue += item.quantity * item.price_per_unit;
                    todayItemSales[item.item_name].cogs += item.quantity * (item.cost_per_unit || 0);
                    todayItemSales[item.item_name].profit += (item.price_per_unit - (item.cost_per_unit || 0)) * item.quantity;
                });
            });
            const todayTopItems = Object.entries(todayItemSales)
                .sort((a, b) => b[1].revenue - a[1].revenue);

            // Get this month's data
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthSales = sales.filter(s => new Date(s.createdAt) >= firstDayOfMonth);
            const monthRevenue = monthSales.reduce((sum, s) => sum + (s.total_amount || 0), 0);
            const monthCOGS = monthSales.reduce((sum, s) => sum + (s.total_cogs || 0), 0);
            const monthGrossProfitTotal = monthSales.reduce((sum, s) => sum + (s.gross_profit || 0), 0);
            const monthExpenses = expenses.filter(e => new Date(e.date) >= firstDayOfMonth);
            const monthExpenseAmount = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
            
            // Calculate month's profits
            const monthGrossProfit = monthGrossProfitTotal || (monthRevenue - monthCOGS);
            const monthNetProfit = monthGrossProfit - monthExpenseAmount;

            // Detailed item-level analysis with profit
            const itemSales = {};
            sales.forEach(sale => {
                sale.items.forEach(item => {
                    if (!itemSales[item.item_name]) {
                        itemSales[item.item_name] = { 
                            quantity: 0, 
                            revenue: 0,
                            cogs: 0,
                            profit: 0
                        };
                    }
                    itemSales[item.item_name].quantity += item.quantity;
                    itemSales[item.item_name].revenue += item.quantity * item.price_per_unit;
                    itemSales[item.item_name].cogs += item.quantity * (item.cost_per_unit || 0);
                    itemSales[item.item_name].profit += (item.price_per_unit - (item.cost_per_unit || 0)) * item.quantity;
                });
            });
            const topItems = Object.entries(itemSales)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .slice(0, 10);

            // Low stock items
            const lowStockItems = inventory.filter(item => item.stock_qty <= (item.reorder_level || 10));

            // Payment method breakdown
            const paymentBreakdown = {};
            sales.forEach(sale => {
                if (!paymentBreakdown[sale.payment_method]) {
                    paymentBreakdown[sale.payment_method] = { count: 0, total: 0 };
                }
                paymentBreakdown[sale.payment_method].count++;
                paymentBreakdown[sale.payment_method].total += sale.total_amount;
            });

            // Expense category breakdown
            const expenseCategories = {};
            expenses.forEach(exp => {
                if (!expenseCategories[exp.category]) {
                    expenseCategories[exp.category] = { count: 0, total: 0 };
                }
                expenseCategories[exp.category].count++;
                expenseCategories[exp.category].total += exp.amount;
            });

            // Get date context
            const currentDate = new Date().toLocaleDateString('en-IN', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
            });
            const currentTime = new Date().toLocaleTimeString('en-IN', { 
                hour: '2-digit', minute: '2-digit' 
            });

            // Build comprehensive context
            const businessContext = `
You are a helpful AI business assistant for a retail store. Answer questions about the business in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.

📅 CURRENT DATE & TIME:
- Date: ${currentDate}
- Time: ${currentTime}
- Note: Use this for "today", "this week", "this month" queries

🔍 QUICK BUSINESS INSIGHTS:
- Best Selling Item: ${topItems.length > 0 ? `${topItems[0][0]} (${topItems[0][1].quantity} units sold, ₹${topItems[0][1].revenue.toLocaleString('en-IN')} revenue)` : 'No sales yet'}
- Lowest Stock Item: ${lowStockItems.length > 0 ? `${lowStockItems[0].item_name} (${lowStockItems[0].stock_qty} units left)` : 'All items well stocked'}
- Total Items in Inventory: ${inventory.length} items
- Total Active Customers: ${customers.length} customers
- Customers with Credit: ${customers.filter(c => c.credit_balance > 0).length}
- Total Sales Transactions: ${sales.length}
- Average Sale Value: ₹${sales.length > 0 ? (totalRevenue / sales.length).toFixed(2) : 0}
- Profit Margin: ${totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(2) : 0}%

IMPORTANT LANGUAGE INSTRUCTIONS:
- User's preferred language: ${language === 'hi' ? 'Hindi (हिंदी)' : language === 'te' ? 'Telugu (తెలుగు)' : 'English'}
- Respond ONLY in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}
- If user writes Hindi/Telugu in English letters (transliteration), understand it and respond in proper ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}
- Use natural, conversational tone
- Be concise but informative

CURRENT BUSINESS DATA (Indian Rupees ₹):

IMPORTANT FINANCIAL TERMS:
- Revenue (రాబడి/आय): Total sales amount = ₹${totalRevenue.toLocaleString('en-IN')}
- COGS (వ్యయం/लागत): Cost of goods sold = ₹${totalCOGS.toLocaleString('en-IN')}
- Gross Profit (స్థూల లాభం/सकल लाभ): Revenue - COGS = ₹${grossProfit.toLocaleString('en-IN')}
- Operating Expenses (నిర్వహణ ఖర్చులు/परिचालन व्यय): Business expenses = ₹${totalExpenses.toLocaleString('en-IN')}
- Net Profit (నికర లాభం/शुद्ध लाभ): Gross Profit - Expenses = ₹${netProfit.toLocaleString('en-IN')}

📊 OVERALL METRICS (ALL TIME):
- Total Sales Transactions: ${sales.length}
- Total Revenue (రాబడి/आय): ₹${totalRevenue.toLocaleString('en-IN')}
- Total COGS (వ్యయం/लागत): ₹${totalCOGS.toLocaleString('en-IN')}
- Total Gross Profit (స్థూల లాభం/सकल लाभ): ₹${grossProfit.toLocaleString('en-IN')}
- Total Operating Expenses: ₹${totalExpenses.toLocaleString('en-IN')}
- Total Net Profit (నికర లాభం/शुद्ध लाभ): ₹${netProfit.toLocaleString('en-IN')}

📅 TODAY'S PERFORMANCE:
- Sales Today: ${todaySales.length} transactions
- Revenue Today (రాబడి/आय): ₹${todayRevenue.toLocaleString('en-IN')}
- COGS Today: ₹${todayCOGS.toLocaleString('en-IN')}
- Gross Profit Today (స్థూల లాభం/सकल लाभ): ₹${todayGrossProfit.toLocaleString('en-IN')}
- Expenses Today: ₹${todayExpenseAmount.toLocaleString('en-IN')}
- Net Profit Today (నికర లాభం/शुद्ध लाभ): ₹${todayNetProfit.toLocaleString('en-IN')}

📱 TODAY'S ITEM-WISE SALES & PROFIT:
${todayTopItems.length > 0 ? todayTopItems.map(([name, data], i) => {
    return `${i + 1}. ${name}:
   - Quantity Sold: ${data.quantity} units
   - Revenue: ₹${data.revenue.toLocaleString('en-IN')}
   - COGS: ₹${data.cogs.toLocaleString('en-IN')}
   - Gross Profit: ₹${data.profit.toLocaleString('en-IN')}
   - Profit per unit: ₹${(data.profit / data.quantity).toFixed(2)}`;
}).join('\n') : 'No sales today yet'}

📆 THIS MONTH:
- Sales This Month: ${monthSales.length} transactions
- Revenue This Month (రాబడి/आय): ₹${monthRevenue.toLocaleString('en-IN')}
- COGS This Month: ₹${monthCOGS.toLocaleString('en-IN')}
- Gross Profit This Month (స్థూల లాభం/सकल लाभ): ₹${monthGrossProfit.toLocaleString('en-IN')}
- Expenses This Month: ₹${monthExpenseAmount.toLocaleString('en-IN')}
- Net Profit This Month (నికర లాభం/शुद्ध लाभ): ₹${monthNetProfit.toLocaleString('en-IN')}

🏆 DETAILED ITEM-LEVEL SALES & PROFIT:
${topItems.map(([name, data], i) => {
    return `${i + 1}. ${name}:
   - Quantity Sold: ${data.quantity} units
   - Revenue: ₹${data.revenue.toLocaleString('en-IN')}
   - COGS: ₹${data.cogs.toLocaleString('en-IN')}
   - Gross Profit: ₹${data.profit.toLocaleString('en-IN')}
   - Profit per unit: ₹${(data.profit / data.quantity).toFixed(2)}`;
}).join('\n')}

📦 INVENTORY STATUS:
- Total Items: ${inventory.length}
- Low Stock Items: ${lowStockItems.length}

COMPLETE INVENTORY DETAILS (ALL ${inventory.length} Items):
${inventory.map((item, i) => {
    return `${i + 1}. ${item.item_name}:
   - Stock Quantity: ${item.stock_qty} units
   - Price per Unit: ₹${item.price_per_unit}
   - Cost per Unit: ₹${item.cost_per_unit || 0}
   - Category: ${item.category || 'N/A'}
   - Status: ${item.stock_qty <= (item.reorder_level || 10) ? '⚠️ LOW STOCK' : '✅ Good'}`;
}).join('\n')}

👥 CUSTOMERS:
- Total Customers: ${customers.length}

COMPLETE CUSTOMER DETAILS (ALL ${customers.length} Customers):
${customers.map((c, i) => {
    return `${i + 1}. ${c.name || 'No Name'}:
   - Phone: ${c.phone || 'N/A'}
   - Email: ${c.email || 'N/A'}
   - Credit Balance: ₹${c.credit_balance || 0}`;
}).join('\n')}

💰 ALL SALES (${sales.length} total, showing most recent ${Math.min(sales.length, 50)}):
${sales.slice(0, 50).map((s, i) => {
    const date = new Date(s.createdAt).toLocaleDateString('en-IN');
    const customerInfo = s.customer_name ? `Customer: ${s.customer_name}${s.customer_phone ? ` (${s.customer_phone})` : ''}` : 'Walk-in Customer';
    return `${i + 1}. ₹${s.total_amount.toLocaleString('en-IN')} on ${date}
   - ${customerInfo}
   - Items: ${s.items.map(item => `${item.item_name} (${item.quantity})`).join(', ')}
   - Payment: ${s.payment_method}
   - Gross Profit: ₹${s.gross_profit || 0}`;
}).join('\n')}

💸 ALL EXPENSES (${expenses.length} total, showing most recent ${Math.min(expenses.length, 30)}):
${expenses.slice(0, 30).map((e, i) => {
    const date = new Date(e.date).toLocaleDateString('en-IN');
    return `${i + 1}. ${e.category}: ₹${e.amount.toLocaleString('en-IN')} on ${date}${e.description ? ` - ${e.description}` : ''}`;
}).join('\n')}

💳 PAYMENT METHOD BREAKDOWN:
${Object.keys(paymentBreakdown).length > 0 ? Object.entries(paymentBreakdown).map(([method, data]) => {
    return `- ${method}: ${data.count} transactions, Total: ₹${data.total.toLocaleString('en-IN')}`;
}).join('\n') : 'No payment data available'}

📊 EXPENSE CATEGORY BREAKDOWN:
${Object.keys(expenseCategories).length > 0 ? Object.entries(expenseCategories)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, data]) => {
    return `- ${category}: ${data.count} expenses, Total: ₹${data.total.toLocaleString('en-IN')}`;
}).join('\n') : 'No expense categories available'}

USER QUESTION: ${message}

IMPORTANT ANSWERING GUIDELINES:
1. When user asks about "profit" (లాభం/लाभ/aadayam/laabam/munafa), respond with NET PROFIT unless they specifically ask for gross profit
2. Clearly differentiate between Revenue (రాబడి/आय) and Profit (లాభం/लाभ)
3. If asked about "aadayam" in Telugu context, it means PROFIT (net profit), NOT revenue
4. If asked about "laabam" or "munafa", it means PROFIT (net profit)
5. Always provide exact numbers from the data above
6. Use Indian Rupee format (₹) for all amounts
7. Be concise but complete in your answers

8. **INVENTORY QUERIES:**
   - COMPLETE INVENTORY DETAILS section has EVERY item with stock quantities
   - When asked about stock/inventory, list the items with their stock_qty
   - Example: "What stock do we have?" → List all items from COMPLETE INVENTORY DETAILS

9. **CUSTOMER QUERIES:**
   - COMPLETE CUSTOMER DETAILS section has ALL customer info including phone numbers
   - When asked about customer contact, provide the phone number from this section
   - Example: "What is Satwik's phone?" → Look in COMPLETE CUSTOMER DETAILS for Satwik's phone

10. **SALES QUERIES:**
   - RECENT SALES section shows customer name and phone for each sale
   - Use this to connect sales to customers
   - Example: "Who bought books?" → Check RECENT SALES for the customer name

11. **ITEM PROFIT QUERIES:**
   - Use the DETAILED ITEM-LEVEL SALES & PROFIT data
   - It contains quantity, revenue, COGS, and profit for EACH item
   - Example: "iPhones dwara entha laabham?" → Look at iPhone's profit in the item list

12. **TODAY'S vs OVERALL:**
   - For TODAY'S queries: Use "TODAY'S ITEM-WISE SALES & PROFIT" section
   - For OVERALL queries: Use "DETAILED ITEM-LEVEL SALES & PROFIT" section

13. **SPECIFIC ITEM QUERIES:**
   - "How much [item] do we have?" → Check COMPLETE INVENTORY DETAILS for stock_qty
   - "What's the price of [item]?" → Check COMPLETE INVENTORY DETAILS for price_per_unit
   - "How many [item] sold?" → Check DETAILED ITEM-LEVEL SALES & PROFIT for quantity

14. **CUSTOMER-SPECIFIC QUERIES:**
   - "Who is [customer]?" → Check COMPLETE CUSTOMER DETAILS for all info
   - "What did [customer] buy?" → Check ALL SALES for that customer_name
   - "Does [customer] owe money?" → Check credit_balance in COMPLETE CUSTOMER DETAILS

15. **DATE/TIME QUERIES:**
   - Today = ${currentDate}
   - "This week" = Last 7 days from today
   - "This month" = Current month data from THIS MONTH section
   - "Yesterday" = 1 day before today

16. **COMPARISON QUERIES:**
   - "What's selling most?" → Use DETAILED ITEM-LEVEL SALES sorted by revenue/quantity
   - "Who spends most?" → Analyze ALL SALES by customer_name and sum amounts
   - "Most expensive expense?" → Check ALL EXPENSES for highest amount

17. **TREND & ANALYSIS QUERIES:**
   - Use the financial data to calculate averages, totals, percentages
   - Compare today vs overall, this month vs overall
   - Identify patterns from the sales and expense data

18. **GENERAL RULES:**
   - ALWAYS use exact numbers from the data - never estimate or guess
   - If data shows 0, say exactly that - don't make up numbers
   - For any query, there IS data above - search carefully
   - Reference specific customer names, item names, amounts from the lists
   - Be helpful and precise

Answer the question naturally and conversationally using the EXACT data provided above. 
DO NOT say you don't have access to information - ALL the data you need is provided above.
Search through ALL sections (inventory, customers, sales, expenses) to find the answer.
`;

            // Generate AI response with retry logic
            let aiResponse;
            let attempts = 0;
            const maxAttempts = 3;

            while (attempts < maxAttempts) {
                try {
                    attempts++;
                    // Use gemini-2.0-flash (the working model)
                    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                    const result = await model.generateContent(businessContext);
                    const response = await result.response;
                    aiResponse = response.text();
                    break; // Success, exit retry loop
                } catch (retryError) {
                    if (retryError.status === 503 && attempts < maxAttempts) {
                        console.log(`⚠️ Gemini overloaded, retrying (${attempts}/${maxAttempts})...`);
                        await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
                    } else {
                        throw retryError; // Give up after max attempts
                    }
                }
            }

            console.log('✅ Chatbot response generated successfully');

            return res.status(200).json({
                success: true,
                data: {
                    message: aiResponse,
                    language: language,
                    timestamp: new Date()
                }
            });

        } catch (error) {
            console.error('❌ Chatbot Error:', error);
            
            // Provide user-friendly error messages
            let errorMessage = 'Failed to process your question. Please try again.';
            if (error.status === 503) {
                errorMessage = 'AI service is currently busy. Please wait a moment and try again.';
            } else if (error.status === 429) {
                errorMessage = 'Too many requests. Please wait a few seconds and try again.';
            }
            
            return res.status(500).json({
                success: false,
                message: errorMessage,
                error: error.message
            });
        }
    }

    /**
     * Get chatbot health status
     */
    async getStatus(req, res) {
        try {
            const geminiStatus = process.env.GEMINI_API_KEY ? 'Active' : 'Not configured';
            
            return res.status(200).json({
                success: true,
                data: {
                    status: 'Online',
                    gemini: geminiStatus,
                    supportedLanguages: ['en', 'hi', 'te'],
                    features: ['text', 'voice', 'multilingual', 'database_access']
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * Text-to-Speech endpoint
     */
    async textToSpeech(req, res) {
        try {
            const { text, language = 'en' } = req.body;

            if (!text || text.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Text is required'
                });
            }

            // Validate language
            const supportedLanguages = ['en', 'hi', 'te'];
            if (!supportedLanguages.includes(language)) {
                return res.status(400).json({
                    success: false,
                    message: `Language '${language}' not supported. Use: ${supportedLanguages.join(', ')}`
                });
            }

            console.log(`🔊 TTS Request [${language}]: "${text.substring(0, 50)}..."`);

            // Check if TTS service is available
            if (!ttsService.isAvailable()) {
                return res.status(503).json({
                    success: false,
                    message: 'TTS service not configured',
                    useBrowserFallback: true
                });
            }

            // Generate speech
            const audioBuffer = await ttsService.synthesizeSpeech(text, language);

            // Set headers for audio streaming
            res.set({
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.length,
                'Cache-Control': 'no-cache'
            });

            console.log('✅ TTS audio sent successfully');
            return res.send(audioBuffer);

        } catch (error) {
            console.error('❌ TTS Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate speech',
                error: error.message,
                useBrowserFallback: true
            });
        }
    }
}

module.exports = new ChatbotController();
