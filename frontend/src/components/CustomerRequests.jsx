import React, { useState, useEffect } from 'react';
import { Clock, Package, CheckCircle, XCircle, User, Phone, MapPin, DollarSign, Edit } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Customer Requests Component for Retailer Dashboard
 * Displays and manages customer requests sent to the retailer
 */
const CustomerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [billForm, setBillForm] = useState({ items: [], taxRate: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'processing', 'billed', 'completed', 'cancelled'

  let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  // Remove /api suffix if present to avoid double /api/api/
  API_URL = API_URL.replace(/\/api$/, '');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const fetchRequests = async () => {
    try {
      const url = filter === 'all' 
        ? `${API_URL}/api/customer-requests/retailer`
        : `${API_URL}/api/customer-requests/retailer?status=${filter}`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      
      if (result.success) {
        // Sort: Active requests first, then completed/cancelled
        const sorted = result.data.requests.sort((a, b) => {
          const statusOrder = { pending: 1, processing: 2, billed: 3, completed: 4, cancelled: 5 };
          return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
        });
        setRequests(sorted);
      }
    } catch (error) {
      console.error('Fetch requests error:', error);
    }
  };

  const handleOpenCancelModal = (request) => {
    setSelectedRequest(request);
    setCancellationReason('');
    setShowCancelModal(true);
  };

  const handleCancelRequest = async () => {
    if (!cancellationReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'cancelled',
          cancellation_reason: cancellationReason 
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Request cancelled successfully');
        setShowCancelModal(false);
        setCancellationReason('');
        fetchRequests();
      } else {
        toast.error(result.message || 'Failed to cancel request');
      }
    } catch (error) {
      console.error('Cancel request error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCompleteModal = (request) => {
    setSelectedRequest(request);
    setPaymentMethod('Cash');
    setShowCompleteModal(true);
  };

  const handleCompleteRequest = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/${selectedRequest._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: 'completed',
          payment_method: paymentMethod 
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('✅ Request completed! Sales entry created and inventory updated');
        setShowCompleteModal(false);
        setPaymentMethod('Cash');
        fetchRequests();
      } else {
        toast.error(result.message || 'Failed to complete request');
      }
    } catch (error) {
      console.error('Complete request error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/customer-requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (result.success) {
        const successMessages = {
          processing: 'Request marked as processing',
          billed: 'Bill generated successfully',
          completed: '✅ Request completed! Sales entry created and inventory updated',
          cancelled: 'Request cancelled'
        };
        toast.success(successMessages[newStatus] || `Status updated to ${newStatus}`);
        fetchRequests();
      } else {
        toast.error(result.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('An error occurred');
    }
  };

  const handleOpenBillModal = (request) => {
    setSelectedRequest(request);
    setBillForm({
      items: request.items.map(item => ({
        ...item,
        price_per_unit: item.price_per_unit || 0
      })),
      taxRate: 0
    });
    setShowBillModal(true);
  };

  const handlePriceChange = (index, price) => {
    const newItems = [...billForm.items];
    newItems[index].price_per_unit = parseFloat(price) || 0;
    setBillForm({ ...billForm, items: newItems });
  };

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    
    if (!selectedRequest) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/customer-requests/${selectedRequest._id}/bill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: billForm.items,
          taxRate: billForm.taxRate
        })
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Bill generated successfully!');
        setShowBillModal(false);
        setSelectedRequest(null);
        fetchRequests();
      } else {
        toast.error(result.message || 'Failed to generate bill');
      }
    } catch (error) {
      console.error('Generate bill error:', error);
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border border-yellow-300', 
        icon: Clock, 
        text: 'Pending',
        pulse: true
      },
      processing: { 
        color: 'bg-blue-100 text-blue-800 border border-blue-300', 
        icon: Package, 
        text: 'Processing',
        pulse: true
      },
      billed: { 
        color: 'bg-purple-100 text-purple-800 border border-purple-300', 
        icon: DollarSign, 
        text: 'Billed',
        pulse: false
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border border-green-300 font-semibold', 
        icon: CheckCircle, 
        text: '✓ Completed',
        pulse: false
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border border-red-300', 
        icon: XCircle, 
        text: '✗ Cancelled',
        pulse: false
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" />
        {config.text}
      </span>
    );
  };

  const calculateTotal = () => {
    const subtotal = billForm.items.reduce((sum, item) => 
      sum + (item.price_per_unit * item.quantity), 0
    );
    const tax = subtotal * (billForm.taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Customer Requests</h2>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All', color: 'gray' },
            { value: 'pending', label: 'Pending', color: 'yellow' },
            { value: 'processing', label: 'Processing', color: 'blue' },
            { value: 'billed', label: 'Billed', color: 'purple' },
            { value: 'completed', label: '✓ Completed', color: 'green' },
            { value: 'cancelled', label: '✗ Cancelled', color: 'red' }
          ].map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === filterOption.value
                  ? 'bg-primary-600 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="bg-primary-100 p-2 rounded-full">
                  <User className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{request.customer_id?.name}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Phone className="h-4 w-4" />
                      <span>{request.customer_id?.phone}</span>
                    </div>
                    {request.customer_id?.email && (
                      <div className="flex items-center space-x-1">
                        <span>{request.customer_id?.email}</span>
                      </div>
                    )}
                  </div>
                  {request.customer_id?.address && (
                    <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {[
                          request.customer_id.address.street,
                          request.customer_id.address.city,
                          request.customer_id.address.state,
                          request.customer_id.address.pincode
                        ].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {getStatusBadge(request.status)}
                <span className="text-xs text-gray-500">
                  {new Date(request.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requested Items:</h4>
              <div className="space-y-1">
                {request.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-900">{item.item_name}</span>
                    <span className="text-gray-600">
                      Qty: {item.quantity}
                      {item.price_per_unit > 0 && (
                        <span className="ml-2 font-medium text-gray-900">
                          × ₹{item.price_per_unit} = ₹{item.total_price}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {request.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Notes:</span> {request.notes}
                </p>
              </div>
            )}

            {/* Bill Details */}
            {request.bill_details && request.bill_details.total > 0 && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Bill Details
                </h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">₹{request.bill_details.subtotal?.toFixed(2)}</span>
                  </div>
                  {request.bill_details.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-700">Tax:</span>
                      <span className="font-medium">₹{request.bill_details.tax?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-green-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-primary-600">
                      ₹{request.bill_details.total?.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(request._id, 'processing')}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-all hover:shadow-lg"
                  >
                    Mark as Processing
                  </button>
                  <button
                    onClick={() => handleOpenBillModal(request)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all hover:shadow-lg flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Generate Bill</span>
                  </button>
                  <button
                    onClick={() => handleOpenCancelModal(request)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-all hover:shadow-lg flex items-center space-x-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Request</span>
                  </button>
                </>
              )}
              {request.status === 'processing' && (
                <>
                  <button
                    onClick={() => handleOpenBillModal(request)}
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all hover:shadow-lg flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Generate Bill</span>
                  </button>
                  <button
                    onClick={() => handleOpenCancelModal(request)}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-all hover:shadow-lg flex items-center space-x-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Request</span>
                  </button>
                </>
              )}
              {request.status === 'billed' && (
                <button
                  onClick={() => handleOpenCompleteModal(request)}
                  className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-all hover:shadow-lg flex items-center space-x-1 font-semibold"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>✓ Mark as Completed</span>
                </button>
              )}
              {request.status === 'cancelled' && request.cancellation_reason && (
                <div className="w-full mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-900 mb-1">Cancellation Reason:</p>
                  <p className="text-sm text-red-800">{request.cancellation_reason}</p>
                </div>
              )}
              {request.status === 'completed' && (
                <div className="w-full mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Order Completed Successfully!</p>
                    <p className="text-xs text-green-700">Sales entry created • Inventory updated</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customer requests yet</h3>
            <p className="text-gray-600">Customer requests will appear here when they message you</p>
          </div>
        )}
      </div>

      {/* Bill Modal */}
      {showBillModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Generate Bill for {selectedRequest.customer_id?.name}
              </h3>

              <form onSubmit={handleGenerateBill} className="space-y-4">
                {/* Items with Prices */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Set Item Prices
                  </label>
                  <div className="space-y-2">
                    {billForm.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <span className="flex-1 text-sm text-gray-900">{item.item_name}</span>
                        <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-gray-600">₹</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price_per_unit}
                            onChange={(e) => handlePriceChange(index, e.target.value)}
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Price"
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-24 text-right">
                          = ₹{(item.price_per_unit * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Rate */}
                <div>
                  <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="taxRate"
                    step="0.01"
                    min="0"
                    max="100"
                    value={billForm.taxRate}
                    onChange={(e) => setBillForm({ ...billForm, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>

                {/* Bill Summary */}
                <div className="bg-gray-50 p-4 rounded-md space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-medium">₹{calculateTotal().subtotal.toFixed(2)}</span>
                  </div>
                  {calculateTotal().tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Tax ({billForm.taxRate}%):</span>
                      <span className="font-medium">₹{calculateTotal().tax.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-gray-300">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-primary-600">
                      ₹{calculateTotal().total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Generating...' : 'Generate Bill'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBillModal(false);
                      setSelectedRequest(null);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {showCancelModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Cancel Request</h3>
                  <p className="text-sm text-gray-600">
                    Request from {selectedRequest.customer_id?.name}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="cancellationReason" className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="cancellationReason"
                  rows="4"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Please provide a reason for cancellation..."
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  This will be visible to the customer
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCancelRequest}
                  disabled={isLoading || !cancellationReason.trim()}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedRequest(null);
                    setCancellationReason('');
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Completion Modal with Payment Method */}
      {showCompleteModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Complete Order</h3>
                  <p className="text-sm text-gray-600">
                    Request from {selectedRequest.customer_id?.name}
                  </p>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Order Total:</p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{selectedRequest.bill_details?.total?.toFixed(2) || '0.00'}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-4">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span className="text-red-600">*</span>
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Credit (Pay Later)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  This will create a sales entry and update inventory
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleCompleteRequest}
                  disabled={isLoading}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete Order</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedRequest(null);
                    setPaymentMethod('Cash');
                  }}
                  disabled={isLoading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerRequests;
