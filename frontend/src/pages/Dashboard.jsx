import React from 'react';
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

/**
 * Dashboard Page Component
 * Main dashboard with business overview and key metrics
 * Ready for Phase 2-6 development with real data integration
 */
const Dashboard = () => {
  // Placeholder data - will be replaced with real API calls in Phase 2
  const stats = [
    { name: 'Total Sales', value: '₹0', change: '+0%', changeType: 'positive', icon: TrendingUp },
    { name: 'Total Expenses', value: '₹0', change: '+0%', changeType: 'negative', icon: DollarSign },
    { name: 'Inventory Items', value: '0', change: '+0%', changeType: 'neutral', icon: Package },
    { name: 'Active Customers', value: '0', change: '+0%', changeType: 'positive', icon: Users },
  ];

  const recentActivities = [
    { id: 1, type: 'sale', message: 'New sale recorded', time: '2 hours ago', status: 'success' },
    { id: 2, type: 'expense', message: 'Expense added', time: '4 hours ago', status: 'info' },
    { id: 3, type: 'inventory', message: 'Low stock alert', time: '6 hours ago', status: 'warning' },
    { id: 4, type: 'customer', message: 'New customer registered', time: '1 day ago', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your business command center. All systems ready for Phase 2-6 development.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-primary-600" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stat.changeType === 'positive' ? 'text-green-600' : 
                        stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* AI Daily Digest */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2 text-primary-600" />
              AI Daily Digest
            </h3>
            <span className="text-xs text-gray-500">Ready for Phase 3</span>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-primary-50 rounded-lg">
              <p className="text-sm text-gray-600">
                AI-powered business insights will appear here once GPT-4o integration is complete.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              <p>• Sales performance analysis</p>
              <p>• Expense optimization suggestions</p>
              <p>• Customer behavior insights</p>
              <p>• Market trend predictions</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              Record New Sale
            </button>
            <button className="w-full btn-secondary text-left">
              Add Expense
            </button>
            <button className="w-full btn-secondary text-left">
              Update Inventory
            </button>
            <button className="w-full btn-secondary text-left">
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700">
            View all
          </button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 ${
                activity.status === 'success' ? 'text-green-500' :
                activity.status === 'warning' ? 'text-yellow-500' : 'text-blue-500'
              }`}>
                {activity.status === 'success' ? <CheckCircle className="h-5 w-5" /> :
                 activity.status === 'warning' ? <AlertCircle className="h-5 w-5" /> :
                 <BarChart3 className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{activity.message}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Development Status */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Development Status
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>✅ Phase 1: MERN Stack Foundation Complete</p>
              <p>🔄 Phase 2: Core Features (Ready to implement)</p>
              <p>⏳ Phase 3: AI Integration (GPT-4o, Whisper, DALL·E)</p>
              <p>⏳ Phase 4: Communication (WhatsApp API)</p>
              <p>⏳ Phase 5: Analytics (Advanced Charts)</p>
              <p>⏳ Phase 6: Mobile & Deployment</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
