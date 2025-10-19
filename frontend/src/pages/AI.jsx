import React, { useState, useEffect, useRef } from 'react';
import {
    Send,
    Mic,
    MicOff,
    Image,
    Brain,
    Bot,
    User,
    Loader2,
    AlertCircle,
    CheckCircle,
    Package,
    TrendingUp,
    DollarSign,
    Users
} from 'lucide-react';
import { aiAPI, inventoryAPI, salesAPI, customersAPI, expensesAPI } from '../services/api';

const AI = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: "Hello! I'm your AI business assistant. I can help you with inventory questions, sales guidance, customer management, and more. How can I assist you today?",
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [context, setContext] = useState({
        currentPage: 'AI Assistant',
        userActions: [],
        businessData: {}
    });
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Fetch business context when component mounts
        fetchBusinessContext();
    }, []);

    const fetchBusinessContext = async () => {
        try {
            // Fetch current business data for context
            const [inventoryRes, salesRes, customersRes, expensesRes] = await Promise.all([
                inventoryAPI.getInventory().catch(() => ({ success: false, data: [] })),
                salesAPI.getSales().catch(() => ({ success: false, data: [] })),
                customersAPI.getCustomers().catch(() => ({ success: false, data: [] })),
                expensesAPI.getExpenses().catch(() => ({ success: false, data: [] }))
            ]);

            // Calculate today's sales
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaySales = salesRes.success ?
                salesRes.data.filter(sale => new Date(sale.date) >= today) : [];
            const salesToday = todaySales.reduce((sum, sale) => sum + sale.total_amount, 0);

            // Calculate today's expenses
            const todayExpenses = expensesRes.success ?
                expensesRes.data.filter(expense => new Date(expense.date) >= today) : [];
            const expensesToday = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

            setContext(prev => ({
                ...prev,
                businessData: {
                    inventoryCount: inventoryRes.success ? inventoryRes.data.length : 0,
                    salesToday: salesToday,
                    customersCount: customersRes.success ? customersRes.data.length : 0,
                    expensesToday: expensesToday,
                    lowStockItems: inventoryRes.success ?
                        inventoryRes.data.filter(item => item.stock_qty <= 5).length : 0
                }
            }));
        } catch (error) {
            console.error('Error fetching business context:', error);
        }
    };

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
            const response = await aiAPI.chatWithAI({
                message: inputMessage,
                context: context
            });

            if (response.success) {
                const aiMessage = {
                    id: Date.now() + 1,
                    type: 'ai',
                    content: response.data.response || "I understand your request, but I need more information to help you properly.",
                    timestamp: new Date(),
                    suggestions: response.data.suggestions || []
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
                content: "I'm sorry, I'm having trouble processing your request right now. Please try again or check if the backend services are running properly.",
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleVoiceInput = async () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInputMessage(transcript);
            setIsRecording(false);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const handleGenerateImage = async () => {
        if (!inputMessage.trim()) {
            alert('Please enter a description for the image you want to generate.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await aiAPI.generateImage({
                prompt: inputMessage,
                style: 'business'
            });

            if (response.success && response.data.imageUrl) {
                const imageMessage = {
                    id: Date.now(),
                    type: 'ai',
                    content: `Here's the image you requested:`,
                    timestamp: new Date(),
                    imageUrl: response.data.imageUrl
                };
                setMessages(prev => [...prev, imageMessage]);
            }
        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        {
            icon: Package,
            label: 'Check Inventory',
            action: () => setInputMessage('Show me my current inventory levels')
        },
        {
            icon: TrendingUp,
            label: 'Sales Report',
            action: () => setInputMessage('Generate a sales report for today')
        },
        {
            icon: DollarSign,
            label: 'Expense Analysis',
            action: () => setInputMessage('Analyze my expenses for this month')
        },
        {
            icon: Users,
            label: 'Customer Info',
            action: () => setInputMessage('Show me my customer information')
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Brain className="h-8 w-8 mr-3 text-primary-600" />
                        AI Assistant
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Your intelligent business companion for inventory, sales, and customer management
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center text-sm text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        AI Assistant Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Chat Interface */}
                <div className="lg:col-span-3">
                    <div className="card h-[600px] flex flex-col">
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-4 ${message.type === 'user'
                                                ? 'bg-primary-600 text-white'
                                                : message.isError
                                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                                    : 'bg-gray-100 text-gray-900'
                                            }`}
                                    >
                                        <div className="flex items-start space-x-2">
                                            {message.type === 'ai' && (
                                                <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            )}
                                            {message.type === 'user' && (
                                                <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div className="flex-1">
                                                <p className="text-sm">{message.content}</p>
                                                {message.imageUrl && (
                                                    <img
                                                        src={message.imageUrl}
                                                        alt="Generated"
                                                        className="mt-2 rounded-lg max-w-full"
                                                    />
                                                )}
                                                {message.suggestions && message.suggestions.length > 0 && (
                                                    <div className="mt-3 space-y-1">
                                                        {message.suggestions.map((suggestion, index) => (
                                                            <button
                                                                key={index}
                                                                onClick={() => setInputMessage(suggestion)}
                                                                className="block text-xs text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                                <p className="text-xs opacity-70 mt-2">
                                                    {message.timestamp.toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-lg p-4">
                                        <div className="flex items-center space-x-2">
                                            <Bot className="h-5 w-5" />
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm text-gray-600">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="border-t border-gray-200 p-4">
                            <div className="flex space-x-2">
                                <div className="flex-1 relative">
                                    <textarea
                                        ref={inputRef}
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Ask me anything about your business..."
                                        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        rows="2"
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="flex flex-col space-y-2">
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        <span>Send</span>
                                    </button>
                                    <button
                                        onClick={handleVoiceInput}
                                        disabled={isLoading}
                                        className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${isRecording
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                    >
                                        {isRecording ? (
                                            <MicOff className="h-4 w-4" />
                                        ) : (
                                            <Mic className="h-4 w-4" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleGenerateImage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                                    >
                                        <Image className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Context */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className="w-full flex items-center space-x-3 p-3 text-left rounded-lg hover:bg-gray-50 border border-gray-200"
                                >
                                    <action.icon className="h-5 w-5 text-primary-600" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {action.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Business Context */}
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Context</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Current Page:</span>
                                <span className="text-sm font-medium text-gray-900">{context.currentPage}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Inventory Items:</span>
                                <span className="text-sm font-medium text-gray-900">{context.businessData.inventoryCount || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Sales Today:</span>
                                <span className="text-sm font-medium text-gray-900">₹{context.businessData.salesToday || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Low Stock Items:</span>
                                <span className="text-sm font-medium text-gray-900">{context.businessData.lowStockItems || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Expenses Today:</span>
                                <span className="text-sm font-medium text-gray-900">₹{context.businessData.expensesToday || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Capabilities */}
                    <div className="card">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Capabilities</h3>
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">Inventory Management</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">Sales Analysis</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">Customer Support</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600">Voice Input</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">Image Generation</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AI;
