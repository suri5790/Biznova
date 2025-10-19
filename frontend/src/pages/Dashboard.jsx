import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Brain,
  BarChart3,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { salesAPI, expensesAPI, inventoryAPI, customersAPI } from '../services/api';

/**
 * Dashboard Page Component
 * Main dashboard content with business overview and key metrics
 */

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);

  const handleQuickAction = (path) => {
    navigate(path);
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [sRes, eRes, iRes, cRes] = await Promise.all([
          salesAPI.getSales(),
          expensesAPI.getExpenses(),
          inventoryAPI.getInventory(),
          customersAPI.getCustomers(),
        ]);

        if (sRes?.success) setSales(Array.isArray(sRes.data) ? sRes.data : []);
        if (eRes?.success) setExpenses(Array.isArray(eRes.data) ? eRes.data : []);
        if (iRes?.success) setInventory(Array.isArray(iRes.data) ? iRes.data : []);
        if (cRes?.success) setCustomers(Array.isArray(cRes.data) ? cRes.data : []);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const inventoryCount = inventory.length;
  const customersCount = customers.length;

  const stats = [
    { name: 'Total Sales', value: `₹${totalSales}`, change: '+0%', changeType: 'positive', icon: TrendingUp },
    { name: 'Total Expenses', value: `₹${totalExpenses}`, change: '+0%', changeType: 'negative', icon: DollarSign },
    { name: 'Inventory Items', value: String(inventoryCount), change: '+0%', changeType: 'neutral', icon: Package },
    { name: 'Active Customers', value: String(customersCount), change: '+0%', changeType: 'positive', icon: Users },
  ];

  const recentActivities = [
    { id: 1, type: 'sale', message: 'New sale recorded', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'expense', message: 'Expense added', time: '4 hours ago', status: 'info' },
    { id: 3, type: 'inventory', message: 'Low stock alert', time: '6 hours ago', status: 'warning' },
    { id: 4, type: 'customer', message: 'New customer registered', time: '1 day ago', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your business command center. All systems ready for Phase 2-6 development.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
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
            AI Daily Digest
          </h3>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">AI-powered business insights will appear here once integration is complete.</p>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
             <button onClick={() => handleQuickAction('/sales')} className="w-full text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Record Sale</button>
             <button onClick={() => handleQuickAction('/expenses')} className="w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Expense</button>
             <button onClick={() => handleQuickAction('/inventory')} className="w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Update Inventory</button>
             <button onClick={() => handleQuickAction('/customers')} className="w-full text-gray-900 bg-gray-100 hover:bg-gray-200 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Add Customer</button>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
         <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
         <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
               <div className={`flex-shrink-0 p-2 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-500' : activity.status === 'warning' ? 'bg-yellow-100 text-yellow-500' : 'bg-blue-100 text-blue-500'}`}>
                {activity.status === 'success' ? <CheckCircle className="h-5 w-5" /> : activity.status === 'warning' ? <AlertCircle className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
               </div>
               <div className="flex-1 min-w-0">
                 <p className="text-sm text-gray-900">{activity.message}</p>
               </div>
               <p className="text-xs text-gray-500">{activity.time}</p>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
