import React, { useState } from 'react';
import { Menu, Bell, Search, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';

/**
 * Header Component
 * Top navigation bar with user controls and notifications
 */
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm border-b border-gray-200 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left section - Mobile menu button */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Center - Search bar */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative">
              {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search business data..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              /> */}
            </div>
          </div>

          {/* Right section - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationBell />

            {/* Profile dropdown */}
            <div className="relative">
              <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Business Owner'}</p>
                  <p className="text-xs text-gray-500">{user?.phone || 'Phone'}</p>
                </div>
              </div>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name || 'Business Owner'}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.shop_name || 'BizNova Shop'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
