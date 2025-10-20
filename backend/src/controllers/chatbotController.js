/**
 * AI Chatbot Controller - Handles intelligent business queries with database access
 * Supports multilingual conversations with full business context
 */

const Sale = require('../models/Sale');
const Inventory = require('../models/Inventory');
const Expense = require('../models/Expense');
const Customer = require('../models/Customer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ChatbotController {
    /**
     * Process chatbot query with business context
     */
    async chat(req, res) {
        try {
            const { message, language = 'en' } = req.body;
            const userId = req.user.userId;

            if (!message || message.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            console.log(`🤖 Chatbot Query [${language}]: "${message}" from user ${userId}`);

            // Fetch all business data for context
            const [sales, inventory, expenses, customers] = await Promise.all([
                Sale.find({ user: userId }).sort({ createdAt: -1 }).limit(100),
                Inventory.find({ user: userId }),
                Expense.find({ user: userId }).sort({ date: -1 }).limit(100),
                Customer.find({ user: userId }).sort({ createdAt: -1 }).limit(50)
            ]);

            // Calculate business metrics
            const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total_amount || 0), 0);
            const totalCOGS = sales.reduce((sum, sale) => sum + (sale.total_cogs || 0), 0);
            const totalGrossProfit = sales.reduce((sum, sale) => sum + (sale.gross_profit || 0), 0);
            const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            
            // Calculate profits
            const grossProfit = totalGrossProfit || (totalRevenue - totalCOGS);
            const netProfit = grossProfit - totalExpenses;

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

            // Build comprehensive context
            const businessContext = `
You are a helpful AI business assistant for a retail store. Answer questions about the business in ${language === 'hi' ? 'Hindi' : language === 'te' ? 'Telugu' : 'English'}.

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
${lowStockItems.length > 0 ? `- Critical: ${lowStockItems.map(i => `${i.item_name} (${i.stock_qty} left)`).join(', ')}` : ''}

👥 CUSTOMERS:
- Total Customers: ${customers.length}
- Recent Customers: ${customers.slice(0, 5).map(c => c.name || c.phone).join(', ')}

💰 RECENT SALES (Last 5):
${sales.slice(0, 5).map((s, i) => {
    const date = new Date(s.createdAt).toLocaleDateString('en-IN');
    return `${i + 1}. ₹${s.total_amount.toLocaleString('en-IN')} on ${date} - ${s.items.map(item => item.item_name).join(', ')}`;
}).join('\n')}

💸 RECENT EXPENSES (Last 5):
${expenses.slice(0, 5).map((e, i) => {
    const date = new Date(e.date).toLocaleDateString('en-IN');
    return `${i + 1}. ${e.category}: ₹${e.amount.toLocaleString('en-IN')} on ${date}`;
}).join('\n')}

USER QUESTION: ${message}

IMPORTANT ANSWERING GUIDELINES:
1. When user asks about "profit" (లాభం/लाभ/aadayam/laabam/munafa), respond with NET PROFIT unless they specifically ask for gross profit
2. Clearly differentiate between Revenue (రాబడి/आय) and Profit (లాభం/लाभ)
3. If asked about "aadayam" in Telugu context, it means PROFIT (net profit), NOT revenue
4. If asked about "laabam" or "munafa", it means PROFIT (net profit)
5. Always provide exact numbers from the data above
6. Use Indian Rupee format (₹) for all amounts
7. Be concise but complete in your answers
8. **IMPORTANT: When asked about specific items (like "iPhone", "Samsung", etc.):**
   - Use the DETAILED ITEM-LEVEL SALES & PROFIT data above
   - It contains quantity, revenue, COGS, and profit for EACH item
   - Don't say you need COGS - IT'S ALREADY THERE in the item-level data
   - Example: "iPhones dwara entha laabham?" → Look at iPhone's profit in the item list
9. **For TODAY'S item queries:** Use the "TODAY'S ITEM-WISE SALES & PROFIT" section
10. **For OVERALL item queries:** Use the "DETAILED ITEM-LEVEL SALES & PROFIT" section

Answer the question naturally and conversationally using the exact data provided above.
`;

            // Generate AI response
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
            const result = await model.generateContent(businessContext);
            const response = await result.response;
            const aiResponse = response.text();

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
            return res.status(500).json({
                success: false,
                message: 'Failed to process your question. Please try again.',
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
}

module.exports = new ChatbotController();
