import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Brain,
  Search,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { salesAPI, expensesAPI, inventoryAPI, customersAPI, profitAnalyticsAPI, aiAPI } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

  const handleQuickAction = (path) => {
    navigate(path);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      
      const [sRes, eRes, iRes, cRes] = await Promise.all([
        salesAPI.getSales(),
        expensesAPI.getExpenses(),
        inventoryAPI.getInventory(),
        customersAPI.getCustomers(),
      ]);

      const salesData = (sRes?.success && Array.isArray(sRes.data)) ? sRes.data : [];
      const expensesData = (eRes?.success && Array.isArray(eRes.data)) ? eRes.data : [];
      const inventoryData = (iRes?.success && Array.isArray(iRes.data)) ? iRes.data : [];
      const customersData = (cRes?.success && Array.isArray(cRes.data)) ? cRes.data : [];

      setSales(salesData);
      setExpenses(expensesData);
      setInventory(inventoryData);
      setCustomers(customersData);
      
      // Calculate profit manually first
      const totalSales = salesData.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      const totalExpenses = expensesData.reduce((sum, e) => sum + Number(e.amount || 0), 0);
      const totalInventoryValue = inventoryData.reduce((sum, i) => sum + (Number(i.stock_qty || 0) * Number(i.price_per_unit || 0)), 0);
      
      // Calculate profit manually from sales data
      const totalRevenue = salesData.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
      const totalCOGS = salesData.reduce((sum, s) => sum + Number(s.total_cogs || 0), 0);
      const grossProfit = totalRevenue - totalCOGS;
      const netProfit = grossProfit - totalExpenses;
      
      // Try profit API, fallback to manual calculation
      try {
        const pRes = await profitAnalyticsAPI.getProfitAnalysis();
        if (pRes?.success && pRes.data && pRes.data.revenue > 0) {
          setProfitData(pRes.data);
          console.log('✅ Using profit API data:', pRes.data);
        } else {
          throw new Error('Invalid API data, using manual calculation');
        }
      } catch (profitError) {
        console.log('⚠️ Using manual profit calculation');
        setProfitData({
          revenue: totalRevenue,
          totalCOGS: totalCOGS,
          grossProfit: grossProfit,
          netProfit: netProfit,
          netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0,
          salesCount: salesData.length,
          inventoryValue: totalInventoryValue
        });
      }
      
      // Generate recent activities from real data
      generateRecentActivities(salesData, expensesData, inventoryData, customersData);
      
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivities = (salesData, expensesData, inventoryData, customersData) => {
    const activities = [];
    
    salesData.slice(0, 3).forEach(sale => {
      activities.push({
        id: `sale-${sale._id}`,
        type: 'sale',
        icon: ShoppingCart,
        message: `Sale of ₹${sale.total_amount} recorded`,
        time: sale.createdAt || sale.date,
        status: 'success'
      });
    });
    
    expensesData.slice(0, 2).forEach(expense => {
      activities.push({
        id: `expense-${expense._id}`,
        type: 'expense',
        icon: CreditCard,
        message: `${expense.category || 'Expense'}: ₹${expense.amount}`,
        time: expense.createdAt || expense.date,
        status: 'info'
      });
      
    });
    
    const lowStock = inventoryData.filter(item => item.stock_qty <= (item.min_stock_level || 5));
    if (lowStock.length > 0) {
      activities.push({
        id: 'low-stock',
        type: 'inventory',
        icon: AlertCircle,
        message: `${lowStock.length} items low on stock`,
        time: new Date(),
        status: 'warning'
      });
    }
    
    customersData.slice(0, 2).forEach(customer => {
      activities.push({
        id: `customer-${customer._id}`,
        type: 'customer',
        icon: UserPlus,
        message: `Customer ${customer.name} added`,
        time: customer.createdAt,
        status: 'success'
      });
    });
    
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivities(activities.slice(0, 5));
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  // Calculate values
  const totalSales = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const totalInventoryValue = inventory.reduce((sum, i) => sum + (Number(i.stock_qty || 0) * Number(i.price_per_unit || 0)), 0);
  const basicProfit = totalSales - totalExpenses;
  
  // Calculate profit margin properly - use API data only if it has valid values, otherwise calculate
  const actualProfit = (profitData && profitData.revenue > 0) ? profitData.netProfit : basicProfit;
  const actualRevenue = (profitData && profitData.revenue > 0) ? profitData.revenue : totalSales;
  const profitMargin = actualRevenue > 0 ? (actualProfit / actualRevenue * 100) : 0;
  
  console.log('Dashboard Calculation Debug:', {
    totalSales,
    totalExpenses,
    basicProfit,
    profitDataFromAPI: profitData,
    actualProfit,
    actualRevenue,
    profitMargin
  });
  
  // Stats cards with REAL profit values
  const stats = [
    { 
      name: 'Net Profit', 
      value: `₹${actualProfit.toLocaleString()}`, 
      change: `${profitMargin.toFixed(1)}% margin`, 
      changeType: actualProfit >= 0 ? 'positive' : 'negative', 
      icon: TrendingUp 
    },
    { 
      name: 'Total Revenue', 
      value: `₹${(profitData?.revenue || totalSales).toLocaleString()}`, 
      change: `${profitData?.salesCount || sales.length} sales`, 
      changeType: 'positive', 
      icon: DollarSign 
    },
    { 
      name: 'Inventory Value', 
      value: `₹${(profitData?.inventoryValue || totalInventoryValue).toLocaleString()}`, 
      change: `${inventory.length} items`, 
      changeType: 'neutral', 
      icon: Package 
    },
    { 
      name: 'Active Customers', 
      value: String(customers.length), 
      change: 'Growing', 
      changeType: 'positive', 
      icon: Users 
    },
  ];

  // Search functionality
  const filteredData = {
    sales: sales.filter(s => 
      !searchQuery || 
      s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.payment_method?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    expenses: expenses.filter(e => 
      !searchQuery || 
      e.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    inventory: inventory.filter(i => 
      !searchQuery || 
      i.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    customers: customers.filter(c => 
      !searchQuery || 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone?.includes(searchQuery)
    )
  };
  
  const searchResults = [
    ...filteredData.sales.map(s => ({ type: 'Sale', name: s.customer_name || 'Walk-in', amount: s.total_amount })),
    ...filteredData.expenses.map(e => ({ type: 'Expense', name: e.category, amount: e.amount })),
    ...filteredData.inventory.map(i => ({ type: 'Inventory', name: i.item_name, amount: i.stock_qty })),
    ...filteredData.customers.map(c => ({ type: 'Customer', name: c.name, amount: c.phone }))
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          {searchQuery && searchResults.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-10">
              {searchResults.map((result, idx) => (
                <div key={idx} className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-xs font-medium text-indigo-600">{result.type}</span>
                      <p className="text-sm text-gray-900">{result.name}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {result.type === 'Inventory' ? `${result.amount} units` : result.type === 'Customer' ? result.amount : `₹${result.amount}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {searchQuery && searchResults.length === 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 z-10">
              <p className="text-sm text-gray-500 text-center">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                  <dd className="flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className={`ml-2 flex items-baseline text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'}`}>
                      {stat.change}
                    </p>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Daily Digest */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
            <Brain className="h-5 w-5 mr-2 text-indigo-600" />
            Daily Digest
          </h3>
          <div className="space-y-3">
            {actualProfit !== undefined && actualProfit !== null ? (
              <>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm font-semibold text-indigo-900 mb-2">📊 Today's Performance</p>
                  <p className="text-sm text-gray-700">
                    Your net profit is <span className="font-bold text-indigo-600">₹{actualProfit.toLocaleString()}</span> with a {profitMargin.toFixed(1)}% margin. 
                    {actualProfit > 0 ? ' Great work!' : ' Consider reviewing expenses.'}
                  </p>
                </div>
                {inventory.filter(i => i.stock_qty <= (i.min_stock_level || 5)).length > 0 && (
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-semibold text-yellow-900 mb-2">⚠️ Stock Alert</p>
                    <p className="text-sm text-gray-700">
                      {inventory.filter(i => i.stock_qty <= (i.min_stock_level || 5)).length} items are running low. Consider restocking soon.
                    </p>
                  </div>
                )}
                {profitData.salesCount > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-semibold text-green-900 mb-2">✅ Sales Update</p>
                    <p className="text-sm text-gray-700">
                      You've made {profitData.salesCount} sales generating ₹{profitData.revenue?.toLocaleString()} in revenue.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Add some sales and expenses to see AI insights!</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
             <button 
               onClick={() => handleQuickAction('/sales')} 
               className="flex flex-col items-center justify-center gap-3 w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-8 py-8 text-center transition-all shadow-sm hover:shadow-md"
             >
               <ShoppingCart className="h-10 w-10" />
               <span className="text-base font-semibold">Record Sale</span>
             </button>
             <button 
               onClick={() => handleQuickAction('/expenses')} 
               className="flex flex-col items-center justify-center gap-3 w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-8 py-8 text-center transition-all shadow-sm hover:shadow-md"
             >
               <CreditCard className="h-10 w-10" />
               <span className="text-base font-semibold">Add Expense</span>
             </button>
             <button 
               onClick={() => handleQuickAction('/inventory')} 
               className="flex flex-col items-center justify-center gap-3 w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-8 py-8 text-center transition-all shadow-sm hover:shadow-md"
             >
               <Package className="h-10 w-10" />
               <span className="text-base font-semibold">Update Inventory</span>
             </button>
             <button 
               onClick={() => handleQuickAction('/customers')} 
               className="flex flex-col items-center justify-center gap-3 w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg px-8 py-8 text-center transition-all shadow-sm hover:shadow-md"
             >
               <UserPlus className="h-10 w-10" />
               <span className="text-base font-semibold">Add Customer</span>
             </button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
         <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => {
              const ActivityIcon = activity.icon;
              return (
                <div key={activity.id} className="flex items-center space-x-3">
                   <div className={`flex-shrink-0 p-2 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-500' : activity.status === 'warning' ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'}`}>
                    <ActivityIcon className="h-5 w-5" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="text-sm text-gray-900">{activity.message}</p>
                   </div>
                   <p className="text-xs text-gray-500">{timeAgo(activity.time)}</p>
                 </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity. Start by creating a sale or adding inventory!</p>
          )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
