import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Phone, Lock, User, Building, Brain, Mail, MapPin, Store, User as UserIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

/**
 * Unified Register Page with Retailer/Customer Tabs
 * Handles registration for both user types
 */
const RegisterNew = () => {
  const [userType, setUserType] = useState('retailer'); // 'retailer' or 'customer'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Retailer specific
    shop_name: '',
    language: 'Hindi',
    upi_id: '',
    // Customer specific
    email: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleTabChange = (type) => {
    setUserType(type);
    // Keep common fields, reset specific fields
    setFormData({
      name: formData.name,
      phone: formData.phone,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      shop_name: '',
      language: 'Hindi',
      upi_id: '',
      email: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Common validations
    if (!formData.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (!formData.password) {
      toast.error('Please enter a password');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!formData.confirmPassword) {
      toast.error('Please confirm your password');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Retailer specific validations
    if (userType === 'retailer') {
      if (!formData.shop_name.trim()) {
        toast.error('Please enter your shop/business name');
        return;
      }

      if (!formData.upi_id.trim()) {
        toast.error('Please enter your UPI ID');
        return;
      }

      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/.test(formData.upi_id)) {
        toast.error('Please enter a valid UPI ID (e.g., yourname@paytm)');
        return;
      }
    }

    // Customer specific validations
    if (userType === 'customer') {
      if (!formData.email.trim()) {
        toast.error('Please enter your email');
        return;
      }

      if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (userType === 'retailer') {
        const { confirmPassword, email, address, ...registrationData } = formData;
        const result = await register(registrationData);
        if (result.success) {
          toast.success('Account created successfully! Welcome to BizNova');
          // Delay navigation to show toast
          setTimeout(() => navigate('/'), 1000);
        } else {
          toast.error(result.message || 'Registration failed. Please try again.');
        }
      } else {
        // Customer registration - API call
        let API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        // Remove /api suffix if present to avoid double /api/api/
        API_BASE_URL = API_BASE_URL.replace(/\/api$/, '');
        const response = await fetch(`${API_BASE_URL}/api/customer-auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: formData.address
          })
        });

        const result = await response.json();

        if (result.success) {
          localStorage.setItem('token', result.data.token);
          localStorage.setItem('userType', 'customer');
          localStorage.setItem('user', JSON.stringify(result.data.customer));
          toast.success('Account created successfully! Welcome to BizNova');
          // Delay navigation to show toast
          setTimeout(() => navigate('/customer-dashboard'), 1000);
        } else {
          toast.error(result.message || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-full shadow-lg">
              <Brain className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Join BizNova
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your account
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

        {/* Registration Form */}
        <form className="mt-8 space-y-6 bg-white rounded-lg shadow-md p-8" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number *
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

            {/* Conditional Fields based on userType */}
            {userType === 'customer' && (
              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address *
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

            {userType === 'retailer' && (
              <>
                <div>
                  <label htmlFor="shop_name" className="block text-sm font-medium text-gray-700">
                    Shop/Business Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="shop_name"
                      name="shop_name"
                      type="text"
                      value={formData.shop_name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Your shop/business name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Preferred Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Hindi">Hindi</option>
                    <option value="English">English</option>
                    <option value="Tamil">Tamil</option>
                    <option value="Telugu">Telugu</option>
                    <option value="Bengali">Bengali</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Kannada">Kannada</option>
                    <option value="Malayalam">Malayalam</option>
                    <option value="Punjabi">Punjabi</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="upi_id" className="block text-sm font-medium text-gray-700">
                    UPI ID *
                  </label>
                  <input
                    id="upi_id"
                    name="upi_id"
                    type="text"
                    value={formData.upi_id}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="yourname@paytm"
                  />
                </div>
              </>
            )}

            {userType === 'customer' && (
              <>
                <div className="md:col-span-2">
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="address.street"
                      name="address.street"
                      type="text"
                      value={formData.address.street}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Street address"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700">
                    City
                  </label>
                  <input
                    id="address.city"
                    name="address.city"
                    type="text"
                    value={formData.address.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700">
                    State
                  </label>
                  <input
                    id="address.state"
                    name="address.state"
                    type="text"
                    value={formData.address.state}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700">
                    Pincode
                  </label>
                  <input
                    id="address.pincode"
                    name="address.pincode"
                    type="text"
                    value={formData.address.pincode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="6-digit pincode"
                    maxLength="6"
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <button type="button" className="text-primary-600 hover:text-primary-500">
                Terms and Conditions
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </button>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in here
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterNew;
