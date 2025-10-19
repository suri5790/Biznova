import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

/**
 * Settings Page Component
 * Application and account settings
 */
const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure your application and account settings.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h2 className="text-lg font-medium text-gray-900">Settings Page</h2>
            <p className="text-sm text-gray-500 mt-1">
              Settings functionality will be implemented here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
