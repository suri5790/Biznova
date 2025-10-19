import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Wallet, Receipt } from 'lucide-react';
import { profitAnalyticsAPI } from '../services/api';

const Analytics = () => {
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [profitData, setProfitData] = useState(null);
    const [inventoryStatus, setInventoryStatus] = useState(null);
    const [timeSeriesData, setTimeSeriesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);

    useEffect(() => {
        const fetchAnalyticsData = async () => {
            try {
                setLoading(true);
                
                // Map timeRange to days
                const daysMap = {
                    '7d': 7,
                    '30d': 30,
                    '90d': 90,
                    '1y': 365
                };
                const days = daysMap[timeRange] || 7;
                
                const [profitRes, inventoryRes, timeSeriesRes, categoryRes, topProductsRes] = await Promise.all([
                    profitAnalyticsAPI.getProfitAnalysis().catch(err => {
                        console.warn('⚠️ Profit analytics API error:', err.message);
                        return { success: false };
                    }),
                    profitAnalyticsAPI.getInventoryStatus().catch(err => {
                        console.warn('⚠️ Inventory status API error:', err.message);
                        return { success: false };
                    }),
                    profitAnalyticsAPI.getTimeSeries({ days }).catch(err => {
                        console.warn('⚠️ Time series API error:', err.message);
                        return { success: false };
                    }),
                    profitAnalyticsAPI.getSalesByCategory({ days }).catch(err => {
                        console.warn('⚠️ Sales by category API error:', err.message);
                        return { success: false };
                    }),
                    profitAnalyticsAPI.getTopProducts({ days, limit: 5 }).catch(err => {
                        console.warn('⚠️ Top products API error:', err.message);
                        return { success: false };
                    })
                ]);
                
                if (profitRes?.success) {
                    setProfitData(profitRes.data);
                }
                
                if (inventoryRes?.success) {
                    setInventoryStatus(inventoryRes.data);
                }
                
                if (timeSeriesRes?.success) {
                    setTimeSeriesData(timeSeriesRes.data);
                }
                
                if (categoryRes?.success) {
                    setCategoryData(categoryRes.data);
                }
                
                if (topProductsRes?.success) {
                    setTopProducts(topProductsRes.data);
                }
            } catch (error) {
                console.error('❌ Error fetching analytics data:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchAnalyticsData();
    }, [timeRange]);

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

            {/* Profit Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">₹{profitData?.revenue?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">{profitData?.salesCount || 0} sales</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* COGS */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">COGS</p>
                            <p className="text-2xl font-bold text-gray-900">₹{profitData?.cogs?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Cost of goods sold</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Receipt className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                {/* Gross Profit */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Gross Profit</p>
                            <p className="text-2xl font-bold text-gray-900">₹{profitData?.grossProfit?.toLocaleString() || 0}</p>
                            <p className="text-xs text-green-600 mt-1">{profitData?.grossProfitMargin || 0}% margin</p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Net Profit */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Net Profit</p>
                            <p className="text-2xl font-bold text-gray-900">₹{profitData?.netProfit?.toLocaleString() || 0}</p>
                            <p className="text-xs text-purple-600 mt-1">{profitData?.netProfitMargin || 0}% margin</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Wallet className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Expenses & Inventory Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sales Expenses */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <p className="text-sm font-medium text-gray-600">Sales Expenses</p>
                            <p className="text-xl font-bold text-gray-900">₹{profitData?.salesExpenses?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Marketing, commissions, shipping</p>
                        </div>
                    </div>
                </div>

                {/* Operating Expenses */}
                <div className="card">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <p className="text-sm font-medium text-gray-600">Operating Expenses</p>
                            <p className="text-xl font-bold text-gray-900">₹{profitData?.operatingExpenses?.toLocaleString() || 0}</p>
                            <p className="text-xs text-gray-500 mt-1">Rent, utilities, salaries</p>
                        </div>
                    </div>
                </div>

                {/* Remaining Inventory Value */}
                <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between">
                        <div className="w-full">
                            <p className="text-sm font-medium text-gray-600 flex items-center">
                                <Package className="h-4 w-4 mr-1" />
                                Remaining Inventory Value
                            </p>
                            <p className="text-xl font-bold text-indigo-900">₹{profitData?.inventoryValue?.toLocaleString() || 0}</p>
                            <p className="text-xs text-indigo-600 mt-1">{inventoryStatus?.totalItems || 0} items in stock</p>
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
                        <BarChart data={timeSeriesData}>
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
                        <LineChart data={timeSeriesData}>
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
                    {categoryData && categoryData.length > 0 ? (
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
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <p>No category data available</p>
                        </div>
                    )}
                </div>

                {/* Top Products */}
                <div className="card">
                    <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
                    {topProducts && topProducts.length > 0 ? (
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div key={product.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                            {index + 1}
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                                            <p className="text-xs text-gray-500">{product.sales} units sold</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">₹{product.revenue.toLocaleString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <p>No product sales data available</p>
                        </div>
                    )}
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
