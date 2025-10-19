import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  Package, 
  Users, 
  Brain, 
  BarChart3,
  Settings
} from 'lucide-react';

/**
 * Sidebar Component
 * Navigation menu on the left side with indigo color scheme
 */
const Sidebar = ({ isOpen, onClose }) => {
  const menu = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Expenses', href: '/expenses', icon: Receipt },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'AI Assistant', href: '/ai', icon: Brain },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar header */}
      <div className="p-5 text-2xl font-bold text-indigo-600 border-b">BizNova</div>
      
      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
      
      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-100">
        <NavLink
          to="/settings"
          onClick={onClose}
          className="w-full flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition"
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
        <p className="text-xs text-gray-400 mt-3">BizNova v1.0.0</p>
      </div>
    </div>
  );
};

export default Sidebar;
