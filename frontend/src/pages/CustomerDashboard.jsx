import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Send, Package, Clock, CheckCircle, XCircle, Plus, Store, ShoppingCart, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import NotificationBell from '../components/NotificationBell';

/**
 * Customer Dashboard
 * Allows customers to message retailers and view their requests
 */
const CustomerDashboard = () => {
  const [retailers, setRetailers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [messageForm, setMessageForm] = useState({
    items: [{ item_name: '', quantity: 1 }],
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('message'); // 'message' or 'my-requests'
  const [retailerInventory, setRetailerInventory] = useState([]);
  const [itemAvailability, setItemAvailability] = useState({});
  const [checkingStock, setCheckingStock] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  
  const navigate = useNavigate();

  let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Remove /api suffix if present to avoid double /api/api/
  API_URL = API_URL.replace(/\/api$/, '');
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (!token || localStorage.getItem('userType') !== 'customer') {
      navigate('/login');
      return;
    }
    
    fetchRetailers();
    fetchMyRequests();
  }, [token, navigate]);

  const fetchRetailers = async (search = '') => {
    try {
      const url = `${API_URL}/api/customer-requests/retailers?search=${encodeURIComponent(search)}`;
      console.log('Fetching retailers from:', url);
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      console.log('Retailers response:', result);
      
      if (result.success) {
        setRetailers(result.data.retailers || []);
        if (!result.data.retailers || result.data.retailers.length === 0) {
          toast.error('No retailers found. Please ask a retailer to sign up first.');
        }
      } else {
        toast.error('Failed to load retailers');
      }
    } catch (error) {
      console.error('Fetch retailers error:', error);
      toast.error('Error loading retailers');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/customer`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setRequests(result.data.requests);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    fetchRetailers(query);
  };

  const handleSelectRetailer = async (retailer) => {
    setSelectedRetailer(retailer);
    setShowMessageForm(true);
    setShowInventory(false);
    // Fetch retailer's inventory
    await fetchRetailerInventory(retailer._id);
  };

  const fetchRetailerInventory = async (retailer_id) => {
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/retailer/${retailer_id}/inventory`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        setRetailerInventory(result.data.items || []);
      }
    } catch (error) {
      console.error('Fetch inventory error:', error);
    }
  };

  const checkItemAvailability = async (items) => {
    if (!selectedRetailer || items.length === 0) return;
    
    // Filter out empty items
    const validItems = items.filter(item => item.item_name.trim());
    if (validItems.length === 0) return;

    setCheckingStock(true);
    console.log('🔍 Checking availability for:', validItems);
    
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/retailer/${selectedRetailer._id}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items: validItems })
      });
      
      const result = await response.json();
      console.log('✅ Availability check result:', result);
      
      if (result.success) {
        // Create availability map by item name
        const availMap = {};
        result.data.availability.forEach(item => {
          availMap[item.item_name.toLowerCase()] = item;
          console.log(`📦 ${item.item_name}: ${item.status} (${item.available_quantity} available, ${item.requested_quantity} requested)`);
        });
        setItemAvailability(availMap);
      }
    } catch (error) {
      console.error('❌ Check availability error:', error);
    } finally {
      setCheckingStock(false);
    }
  };

  const handleAddItem = () => {
    setMessageForm({
      ...messageForm,
      items: [...messageForm.items, { item_name: '', quantity: 1 }]
    });
  };

  const handleRemoveItem = (index) => {
    const newItems = messageForm.items.filter((_, i) => i !== index);
    setMessageForm({ ...messageForm, items: newItems });
  };

  const handleItemChange = async (index, field, value) => {
    const newItems = [...messageForm.items];
    newItems[index][field] = field === 'quantity' ? parseInt(value) || 1 : value;
    setMessageForm({ ...messageForm, items: newItems });
    
    // Check availability after change (debounced)
    if (newItems[index].item_name.trim()) {
      setTimeout(() => checkItemAvailability(newItems), 500);
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!selectedRetailer) {
      toast.error('Please select a retailer');
      return;
    }

    const validItems = messageForm.items.filter(item => item.item_name.trim());
    if (validItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    // Check if all items are available before submitting
    // Verify each item has been checked and is available
    for (const item of validItems) {
      const availability = itemAvailability[item.item_name.toLowerCase()];
      if (!availability) {
        toast.error(`Please wait for stock check or remove "${item.item_name}"`);
        return;
      }
      if (!availability.can_order) {
        toast.error(`"${item.item_name}" is unavailable. ${availability.message}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/customer-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          retailer_id: selectedRetailer._id,
          items: validItems,
          notes: messageForm.notes
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Request sent successfully!');
        setShowMessageForm(false);
        setMessageForm({ items: [{ item_name: '', quantity: 1 }], notes: '' });
        setSelectedRetailer(null);
        setItemAvailability({});
        fetchMyRequests();
      } else {
        // Handle stock errors
        if (result.outOfStockItems || result.lowStockItems) {
          const outOfStock = result.outOfStockItems || [];
          const lowStock = result.lowStockItems || [];
          
          if (outOfStock.length > 0) {
            toast.error(`Out of stock: ${outOfStock.map(i => i.item_name).join(', ')}`);
          }
          if (lowStock.length > 0) {
            toast.error(`Insufficient stock: ${lowStock.map(i => `${i.item_name} (only ${i.available} available)`).join(', ')}`);
          }
        } else {
          toast.error(result.message || 'Failed to send request');
        }
      }
    } catch (error) {
      console.error('Submit request error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package, text: 'Processing' },
      billed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Billed' },
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
              <p className="text-sm text-gray-600">Customer Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('message')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'message'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Send className="h-5 w-5" />
            <span>Message Retailer</span>
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'my-requests'
                ? 'bg-primary-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span>My Requests</span>
          </button>
        </div>

        {/* Message Retailer Tab */}
        {activeTab === 'message' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Retailer List */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a Retailer</h2>
              
              {/* Search Bar */}
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by shop name..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Retailer Cards */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {retailers.map((retailer) => (
                  <div
                    key={retailer._id}
                    onClick={() => handleSelectRetailer(retailer)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedRetailer?._id === retailer._id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <Store className="h-6 w-6 text-primary-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{retailer.shop_name || retailer.name}</h3>
                        <p className="text-sm text-gray-600">{retailer.phone}</p>
                        {retailer.language && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded">
                            {retailer.language}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {retailers.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No retailers found</p>
                )}
              </div>
            </div>

            {/* Message Form */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {selectedRetailer ? `Message ${selectedRetailer.shop_name || selectedRetailer.name}` : 'Request Form'}
              </h2>

              {showMessageForm && selectedRetailer ? (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  {/* View Inventory Button */}
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setShowInventory(!showInventory)}
                      className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      <Package className="h-4 w-4" />
                      <span>{showInventory ? 'Hide' : 'View'} Available Items ({retailerInventory.length})</span>
                    </button>
                    {checkingStock && (
                      <span className="text-xs text-gray-500">Checking stock...</span>
                    )}
                  </div>

                  {/* Inventory List */}
                  {showInventory && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Available Inventory</h4>
                      {retailerInventory.length > 0 ? (
                        <div className="space-y-1">
                          {retailerInventory.map((invItem, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-900">{invItem.item_name}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">{invItem.quantity} {invItem.unit || 'units'}</span>
                                {invItem.stock_status === 'out_of_stock' && (
                                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Out of Stock</span>
                                )}
                                {invItem.stock_status === 'low_stock' && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Low Stock</span>
                                )}
                                {invItem.stock_status === 'in_stock' && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">In Stock</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No inventory available</p>
                      )}
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Items *
                    </label>
                    {messageForm.items.map((item, index) => {
                      const availability = item.item_name ? itemAvailability[item.item_name.toLowerCase()] : null;
                      return (
                        <div key={index} className="mb-3">
                          <div className="flex space-x-2">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                list={`inventory-items-${index}`}
                                placeholder="Item name (type or select)"
                                value={item.item_name}
                                onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
                                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                  availability && !availability.can_order ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              <datalist id={`inventory-items-${index}`}>
                                {retailerInventory.filter(i => i.stock_status !== 'out_of_stock').map((invItem, idx) => (
                                  <option key={idx} value={invItem.item_name}>
                                    {invItem.quantity} {invItem.unit || 'units'} available
                                  </option>
                                ))}
                              </datalist>
                            </div>
                            <div className="relative">
                              <input
                                type="number"
                                placeholder="Qty"
                                value={item.quantity}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                min="1"
                                max={availability && availability.can_order ? availability.available_quantity : undefined}
                                className={`w-24 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                                  availability && !availability.can_order ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                }`}
                              />
                              {availability && availability.available_quantity > 0 && (
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                  max: {availability.available_quantity}
                                </span>
                              )}
                            </div>
                            {messageForm.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="px-3 py-2 text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                          {/* Stock Status Message */}
                          {availability && (
                            <div className={`mt-1 text-sm flex items-center justify-between ${
                              availability.can_order ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
                            } px-3 py-2 rounded-md`}>
                              <div className="flex items-center space-x-2">
                                {availability.can_order ? (
                                  <>
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="font-medium">✓ Available</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-4 w-4" />
                                    <span className="font-medium">✗ {availability.status === 'not_found' ? 'Not in Shop' : 'Unavailable'}</span>
                                  </>
                                )}
                              </div>
                              <div className="text-sm font-semibold">
                                {availability.status === 'available' && (
                                  <span className="text-green-800">
                                    Stock: {availability.available_quantity} {availability.unit || 'units'}
                                  </span>
                                )}
                                {availability.status === 'insufficient_stock' && (
                                  <span className="text-red-800">
                                    Only {availability.available_quantity} {availability.unit || 'units'} available
                                  </span>
                                )}
                                {availability.status === 'out_of_stock' && (
                                  <span className="text-red-800">Out of Stock (0 available)</span>
                                )}
                                {availability.status === 'not_found' && (
                                  <span className="text-red-800">Not available in this shop</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="mt-2 flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Item</span>
                    </button>
                  </div>

                  {/* Order Summary */}
                  {Object.keys(itemAvailability).length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                        <Package className="h-4 w-4" />
                        <span>Order Summary</span>
                      </h3>
                      <div className="space-y-2">
                        {messageForm.items.filter(item => item.item_name.trim()).map((item, idx) => {
                          const avail = itemAvailability[item.item_name.toLowerCase()];
                          if (!avail) return null;
                          return (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="font-medium text-gray-900">{item.item_name} × {item.quantity}</span>
                              <div className="flex items-center space-x-2">
                                {avail.can_order ? (
                                  <span className="text-green-700 font-semibold">
                                    ✓ Stock: {avail.available_quantity} {avail.unit || 'units'}
                                  </span>
                                ) : (
                                  <span className="text-red-700 font-semibold">
                                    ✗ {avail.status === 'not_found' ? 'Not available' : `Only ${avail.available_quantity} available`}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {Object.values(itemAvailability).some(item => !item.can_order) && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="font-medium">Cannot proceed: Some items are unavailable or insufficient</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      rows="3"
                      value={messageForm.notes}
                      onChange={(e) => setMessageForm({ ...messageForm, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Any special requests or instructions..."
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isLoading ? 'Sending...' : 'Send Request'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowMessageForm(false);
                        setSelectedRetailer(null);
                        setMessageForm({ items: [{ item_name: '', quantity: 1 }], notes: '' });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Store className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Select a retailer to send a request</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Requests</h2>

            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">{request.retailer_id?.shop_name || request.retailer_id?.name}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">Items:</p>
                    {request.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 flex justify-between">
                        <span>{item.item_name}</span>
                        <span>Qty: {item.quantity} {item.price_per_unit > 0 && `× ₹${item.price_per_unit} = ₹${item.total_price}`}</span>
                      </div>
                    ))}
                  </div>

                  {request.notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Notes:</span> {request.notes}
                    </p>
                  )}

                  {request.bill_details && request.bill_details.total > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span>₹{request.bill_details.subtotal?.toFixed(2)}</span>
                      </div>
                      {request.bill_details.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax:</span>
                          <span>₹{request.bill_details.tax?.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg mt-2">
                        <span>Total:</span>
                        <span className="text-primary-600">₹{request.bill_details.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {requests.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No requests yet</p>
                  <p className="text-sm mt-1">Start by messaging a retailer</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
