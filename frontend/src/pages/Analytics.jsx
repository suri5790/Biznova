import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);

    // Mock data - in real app, this would come from API
    const salesData = [
        { name: 'Mon', sales: 4000, expenses: 2400 },
        { name: 'Tue', sales: 3000, expenses: 1398 },
        { name: 'Wed', sales: 2000, expenses: 9800 },
        { name: 'Thu', sales: 2780, expenses: 3908 },
        { name: 'Fri', sales: 1890, expenses: 4800 },
        { name: 'Sat', sales: 2390, expenses: 3800 },
        { name: 'Sun', sales: 3490, expenses: 4300 },
    ];

    const categoryData = [
        { name: 'Electronics', value: 400, color: '#8884d8' },
        { name: 'Clothing', value: 300, color: '#82ca9d' },
        { name: 'Food', value: 200, color: '#ffc658' },
        { name: 'Books', value: 100, color: '#ff7300' },
    ];

    const topProducts = [
        { name: 'iPhone 15', sales: 45, revenue: 45000 },
        { name: 'Samsung Galaxy', sales: 32, revenue: 32000 },
        { name: 'MacBook Pro', sales: 28, revenue: 28000 },
        { name: 'iPad Air', sales: 25, revenue: 25000 },
        { name: 'Dell Laptop', sales: 22, revenue: 22000 },
    ];

    useEffect(() => {
        // Simulate loading
        setTimeout(() => setLoading(false), 1000);
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600">Comprehensive business insights and performance metrics</p>
                </div>
                <div className="flex gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="input-field"
                    >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="1y">Last year</option>
                    </select>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹1,25,000</p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">+12.5%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">1,247</p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">+8.2%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShoppingCart className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">New Customers</p>
                            <p className="text-2xl font-bold text-gray-900">89</p>
                            <div className="flex items-center mt-1">
                                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-sm text-green-600">+15.3%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                            <p className="text-2xl font-bold text-gray-900">₹1,002</p>
                            <div className="flex items-center mt-1">
                                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                <span className="text-sm text-red-600">-2.1%</span>
                            </div>
                        </div>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Package className="h-6 w-6 text-orange-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales vs Expenses */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Sales vs Expenses</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="sales" fill="#10b981" name="Sales" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue Trend */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales by Category */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Products */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                    <div className="space-y-3">
                        {topProducts.map((product, index) => (
                            <div key={product.name} className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                        {index + 1}
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">{product.sales} sales</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-900">Sales are up 12.5% this month</p>
                                <p className="text-xs text-gray-500">Compared to last month</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-900">Average order value decreased</p>
                                <p className="text-xs text-gray-500">Consider upselling strategies</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-gray-900">Customer acquisition is strong</p>
                                <p className="text-xs text-gray-500">89 new customers this month</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-900">Generate Sales Report</p>
                            <p className="text-xs text-gray-500">Export detailed sales data</p>
                        </button>
                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-900">View Customer Analytics</p>
                            <p className="text-xs text-gray-500">Customer behavior insights</p>
                        </button>
                        <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                            <p className="text-sm font-medium text-gray-900">Inventory Analysis</p>
                            <p className="text-xs text-gray-500">Stock performance metrics</p>
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Goals & Targets</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Monthly Sales Target</span>
                                <span className="text-gray-900">₹1,25,000 / ₹1,50,000</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Customer Target</span>
                                <span className="text-gray-900">89 / 100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Order Target</span>
                                <span className="text-gray-900">1,247 / 1,500</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '83%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
