import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, Brain, Mail, Store, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

/**
 * Unified Login Page with Retailer/Customer Tabs
 * Handles authentication for both user types
 */
const LoginNew = () => {
  const [userType, setUserType] = useState('retailer'); // 'retailer' or 'customer'
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Retailer fields
    phone: '',
    // Customer fields
    email: '',
    // Common
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleTabChange = (type) => {
    setUserType(type);
    // Clear form when switching tabs
    setFormData({
      phone: '',
      email: '',
      password: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userType === 'retailer') {
      // Validate retailer fields
      if (!formData.phone.trim()) {
        toast.error('Please enter your phone number');
        return;
      }
      if (!formData.password) {
        toast.error('Please enter your password');
        return;
      }
    } else {
      // Validate customer fields
      if (!formData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }
      if (!formData.password) {
        toast.error('Please enter your password');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (userType === 'retailer') {
        const result = await login({ phone: formData.phone, password: formData.password });
        if (result.success) {
          toast.success('Welcome back to BizNova!');
          // Delay navigation to show toast
          setTimeout(() => navigate('/'), 1000);
        } else {
          toast.error(result.message || 'Login failed. Please try again.');
        }
      } else {
        // Customer login - API call
        let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // Remove /api suffix if present to avoid double /api/api/
        API_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
        const response = await fetch(`${API_BASE_URL}/api/customer-auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userType', 'customer');
          localStorage.setItem('user', JSON.stringify(result.data.customer));
          toast.success('Welcome to BizNova!');
          // Delay navigation to show toast
          setTimeout(() => navigate('/customer-dashboard'), 1000);
        } else {
          toast.error(result.message || 'Login failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Welcome to BizNova
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {/* Tab Selection */}
        <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
          <button
            type="button"
            onClick={() => handleTabChange('retailer')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              userType === 'retailer'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Store className="h-5 w-5" />
            <span>Retailer</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('customer')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              userType === 'customer'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <UserIcon className="h-5 w-5" />
            <span>Customer</span>
          </button>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-md p-8" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {userType === 'retailer' ? (
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button type="button" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Sign up here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginNew;
