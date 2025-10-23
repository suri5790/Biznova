const CustomerRequest = require('../models/CustomerRequest');
const CustomerUser = require('../models/CustomerUser');
const User = require('../models/User');
const Inventory = require('../models/Inventory');
const Sale = require('../models/Sale');
const notificationController = require('./notificationController');
const { validationResult } = require('express-validator');

/**
 * Customer Request Controller
 * Handles customer requests/messages to retailers
 * Includes bill generation and status updates
 */

const customerRequestController = {
  // Create new customer request
  createRequest: async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { retailer_id, items, notes } = req.body;
      const customer_id = req.user._id;

      // Verify retailer exists
      const retailer = await User.findById(retailer_id);
      if (!retailer) {
        return res.status(404).json({
          success: false,
          message: 'Retailer not found'
        });
      }

      // Check inventory stock for each item
      const outOfStockItems = [];
      const lowStockItems = [];
      
      for (const item of items) {
        const inventoryItem = await Inventory.findOne({
          user_id: retailer_id,
          $or: [
            { item_name: { $regex: new RegExp(`^${item.item_name}$`, 'i') } },
            { item_name: { $regex: item.item_name, $options: 'i' } }
          ]
        });

        if (!inventoryItem) {
          outOfStockItems.push({
            item_name: item.item_name,
            reason: 'Item not found in inventory'
          });
        } else if (inventoryItem.quantity === 0) {
          outOfStockItems.push({
            item_name: item.item_name,
            available: 0,
            requested: item.quantity,
            reason: 'Out of stock'
          });
        } else if (inventoryItem.quantity < item.quantity) {
          lowStockItems.push({
            item_name: item.item_name,
            available: inventoryItem.quantity,
            requested: item.quantity,
            reason: 'Insufficient stock'
          });
        }
      }

      // If any items are out of stock, return error
      if (outOfStockItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock',
          outOfStockItems,
          lowStockItems
        });
      }

      // If any items have low stock, warn but allow
      if (lowStockItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some items have insufficient stock',
          lowStockItems
        });
      }

      // Create new request
      const request = new CustomerRequest({
        customer_id,
        retailer_id,
        items,
        notes: notes || '',
        status: 'pending'
      });

      await request.save();

      // Populate customer and retailer details
      await request.populate('customer_id', 'name email phone');
      await request.populate('retailer_id', 'name shop_name phone');

      // Create notification for retailer
      const itemsList = items.map(i => `${i.item_name} (${i.quantity})`).join(', ');
      await notificationController.createNotification(
        retailer_id,
        'retailer',
        'new_request',
        'New Customer Request',
        `${request.customer_id.name} sent a request for: ${itemsList}`,
        request._id
      );

      res.status(201).json({
        success: true,
        message: 'Request sent successfully',
        data: {
          request
        }
      });
    } catch (error) {
      console.error('Create request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create request',
        error: error.message
      });
    }
  },

  // Get all requests for a customer
  getCustomerRequests: async (req, res) => {
    try {
      const customer_id = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { customer_id };
      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const requests = await CustomerRequest.find(query)
        .populate('retailer_id', 'name shop_name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await CustomerRequest.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Requests retrieved successfully',
        data: {
          requests,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get customer requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve requests',
        error: error.message
      });
    }
  },

  // Get all requests for a retailer
  getRetailerRequests: async (req, res) => {
    try {
      const retailer_id = req.user._id;
      const { status, page = 1, limit = 10 } = req.query;

      const query = { retailer_id };
      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const requests = await CustomerRequest.find(query)
        .populate('customer_id', 'name email phone address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await CustomerRequest.countDocuments(query);

      res.status(200).json({
        success: true,
        message: 'Requests retrieved successfully',
        data: {
          requests,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get retailer requests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve requests',
        error: error.message
      });
    }
  },

  // Get single request by ID
  getRequestById: async (req, res) => {
    try {
      const { id } = req.params;

      const request = await CustomerRequest.findById(id)
        .populate('customer_id', 'name email phone address')
        .populate('retailer_id', 'name shop_name phone');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Request retrieved successfully',
        data: {
          request
        }
      });
    } catch (error) {
      console.error('Get request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve request',
        error: error.message
      });
    }
  },

  // Update request status (retailer only) - Integrated with Sales & Inventory
  updateRequestStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cancellation_reason, payment_method } = req.body;
      const retailer_id = req.user._id;

      console.log('📝 Updating request status:', { id, status, cancellation_reason, payment_method });

      const request = await CustomerRequest.findOne({ _id: id, retailer_id })
        .populate('customer_id', 'name email phone');

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found or unauthorized'
        });
      }

      // Validate cancellation reason
      if (status === 'cancelled') {
        if (!cancellation_reason || cancellation_reason.trim().length === 0) {
          return res.status(400).json({
            success: false,
            message: 'Cancellation reason is required'
          });
        }
        request.cancellation_reason = cancellation_reason;
        request.cancelled_at = new Date();
        console.log('🚫 Request cancelled with reason:', cancellation_reason);
      }

      // Handle completion - Create Sales & Update Inventory
      if (status === 'completed') {
        if (request.status !== 'billed') {
          return res.status(400).json({
            success: false,
            message: 'Request must be billed before marking as completed'
          });
        }

        console.log('✅ Creating sales entry and updating inventory...');

        // Create Sales Entry
        const saleItems = [];
        let total_amount = 0;
        let total_cogs = 0;

        for (const item of request.items) {
          // Find inventory item to get cost
          const inventoryItem = await Inventory.findOne({
            user_id: retailer_id,
            item_name: { $regex: new RegExp(`^${item.item_name}$`, 'i') }
          });

          if (!inventoryItem) {
            return res.status(400).json({
              success: false,
              message: `Item "${item.item_name}" not found in inventory`
            });
          }

          // Check if sufficient stock
          const availableStock = Number(inventoryItem.stock_qty) || 0;
          if (availableStock < item.quantity) {
            return res.status(400).json({
              success: false,
              message: `Insufficient stock for "${item.item_name}". Available: ${availableStock}, Requested: ${item.quantity}`
            });
          }

          // Deduct from inventory
          const deductAmount = Number(item.quantity) || 0;
          inventoryItem.stock_qty = availableStock - deductAmount;
          
          await inventoryItem.save();
          console.log(`📦 Deducted ${deductAmount} ${inventoryItem.unit || 'units'} of ${item.item_name}. New stock: ${inventoryItem.stock_qty}`);

          // Prepare sale item
          // Get cost: try purchase_price, then 70% of selling price as fallback
          const selling_price = inventoryItem.price || inventoryItem.price_per_unit || item.price_per_unit;
          const cost_per_unit = inventoryItem.purchase_price || inventoryItem.cost || (selling_price * 0.7);
          saleItems.push({
            item_name: item.item_name,
            quantity: item.quantity,
            price_per_unit: item.price_per_unit,
            cost_per_unit: cost_per_unit
          });

          total_amount += item.total_price;
          total_cogs += cost_per_unit * item.quantity;
        }

        // Create Sale record
        const finalPaymentMethod = payment_method || 'Credit';
        const sale = new Sale({
          user_id: retailer_id,
          date: new Date(),
          items: saleItems,
          total_amount: request.bill_details.total,
          total_cogs: total_cogs,
          gross_profit: request.bill_details.total - total_cogs,
          payment_method: finalPaymentMethod,
          customer_name: request.customer_id.name || 'Customer',
          customer_phone: request.customer_id.phone || ''
        });
        
        console.log('💰 Creating sale with COGS:', total_cogs, 'Gross Profit:', request.bill_details.total - total_cogs, 'Payment:', finalPaymentMethod);

        await sale.save();
        request.sales_id = sale._id;
        console.log('💰 Sales entry created:', sale._id);

        request.completed_at = new Date();
      }

      // Update status
      const previousStatus = request.status;
      request.status = status;

      if (status === 'processing') {
        request.processed_at = new Date();
      }

      await request.save();
      await request.populate('customer_id', 'name email phone address');

      console.log(`✅ Request status updated: ${previousStatus} → ${status}`);

      // Create notifications for customer based on status
      if (status === 'completed') {
        await notificationController.createNotification(
          request.customer_id._id,
          'customer',
          'request_completed',
          'Order Completed! 🎉',
          `Your order has been completed and ready for pickup/delivery. Total: ₹${request.bill_details?.total || 0}`,
          request._id
        );
      } else if (status === 'cancelled' && cancellation_reason) {
        await notificationController.createNotification(
          request.customer_id._id,
          'customer',
          'request_cancelled',
          'Order Cancelled',
          `Your request was cancelled. Reason: ${cancellation_reason}`,
          request._id
        );
      } else if (status === 'billed') {
        await notificationController.createNotification(
          request.customer_id._id,
          'customer',
          'bill_generated',
          'Bill Generated',
          `Your bill is ready! Total: ₹${request.bill_details?.total || 0}`,
          request._id
        );
      }

      res.status(200).json({
        success: true,
        message: `Request ${status === 'completed' ? 'completed! Sales entry created and inventory updated' : 'status updated successfully'}`,
        data: {
          request,
          sales_created: status === 'completed',
          inventory_updated: status === 'completed'
        }
      });
    } catch (error) {
      console.error('❌ Update request status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update request status',
        error: error.message
      });
    }
  },

  // Generate bill for request (retailer only)
  generateBill: async (req, res) => {
    try {
      const { id } = req.params;
      const { items, taxRate = 0 } = req.body;
      const retailer_id = req.user._id;

      const request = await CustomerRequest.findOne({ _id: id, retailer_id });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Request not found or unauthorized'
        });
      }

      // Update items with prices
      if (items && Array.isArray(items)) {
        items.forEach((item, index) => {
          if (request.items[index]) {
            request.items[index].price_per_unit = item.price_per_unit || 0;
          }
        });
      }

      // Calculate bill
      request.calculateBill(taxRate);
      request.status = 'billed';
      request.processed_at = new Date();

      await request.save();

      await request.populate('customer_id', 'name email phone address');

      res.status(200).json({
        success: true,
        message: 'Bill generated successfully',
        data: {
          request,
          bill_details: request.bill_details
        }
      });
    } catch (error) {
      console.error('Generate bill error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bill',
        error: error.message
      });
    }
  },

  // Get all retailers (for customer to search/select)
  getAllRetailers: async (req, res) => {
    try {
      const { search, page = 1, limit = 20 } = req.query;

      console.log('Getting retailers - Search:', search, 'User type:', req.userType);

      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { shop_name: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const retailers = await User.find(query)
        .select('name shop_name phone language')
        .sort({ shop_name: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(query);

      console.log(`Found ${retailers.length} retailers out of ${total} total`);

      res.status(200).json({
        success: true,
        message: 'Retailers retrieved successfully',
        data: {
          retailers,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get retailers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve retailers',
        error: error.message
      });
    }
  },

  // Get retailer's inventory (for customers to see available items)
  getRetailerInventory: async (req, res) => {
    try {
      const { retailer_id } = req.params;
      const { search, page = 1, limit = 50 } = req.query;

      console.log('Getting inventory for retailer:', retailer_id);

      const query = { user_id: retailer_id };
      if (search) {
        query.item_name = { $regex: search, $options: 'i' };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const items = await Inventory.find(query)
        .select('item_name stock_qty unit price category price_per_unit')
        .sort({ item_name: 1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Inventory.countDocuments(query);

      // Add stock status to each item
      const itemsWithStatus = items.map(item => ({
        ...item.toObject(),
        quantity: item.stock_qty, // For frontend compatibility
        stock_status: item.stock_qty === 0 ? 'out_of_stock' : 
                      item.stock_qty < 10 ? 'low_stock' : 'in_stock'
      }));

      res.status(200).json({
        success: true,
        message: 'Inventory retrieved successfully',
        data: {
          items: itemsWithStatus,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get retailer inventory error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve inventory',
        error: error.message
      });
    }
  },

  // Check item availability in real-time
  checkItemAvailability: async (req, res) => {
    try {
      const { retailer_id } = req.params;
      const { items } = req.body;

      console.log('Checking availability for retailer:', retailer_id, 'Items:', items);

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }

      const availability = [];

      for (const item of items) {
        const inventoryItem = await Inventory.findOne({
          user_id: retailer_id,
          $or: [
            { item_name: { $regex: new RegExp(`^${item.item_name}$`, 'i') } },
            { item_name: { $regex: item.item_name, $options: 'i' } }
          ]
        });

        if (!inventoryItem) {
          availability.push({
            item_name: item.item_name,
            requested_quantity: item.quantity,
            available_quantity: 0,
            status: 'not_found',
            message: 'Item not available in this shop',
            can_order: false
          });
        } else if (inventoryItem.stock_qty === 0) {
          availability.push({
            item_name: item.item_name,
            requested_quantity: item.quantity,
            available_quantity: 0,
            status: 'out_of_stock',
            message: 'Out of stock',
            can_order: false,
            price: inventoryItem.price || inventoryItem.price_per_unit
          });
        } else if (inventoryItem.stock_qty < item.quantity) {
          availability.push({
            item_name: item.item_name,
            requested_quantity: item.quantity,
            available_quantity: inventoryItem.stock_qty,
            status: 'insufficient_stock',
            message: `Only ${inventoryItem.stock_qty} ${inventoryItem.unit || 'units'} available`,
            can_order: false,
            price: inventoryItem.price || inventoryItem.price_per_unit
          });
        } else {
          availability.push({
            item_name: item.item_name,
            requested_quantity: item.quantity,
            available_quantity: inventoryItem.stock_qty,
            status: 'available',
            message: 'Available',
            can_order: true,
            price: inventoryItem.price || inventoryItem.price_per_unit,
            unit: inventoryItem.unit
          });
        }
      }

      const allAvailable = availability.every(item => item.can_order);

      res.status(200).json({
        success: true,
        message: allAvailable ? 'All items available' : 'Some items unavailable',
        data: {
          availability,
          all_available: allAvailable
        }
      });
    } catch (error) {
      console.error('Check availability error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to check availability',
        error: error.message
      });
    }
  }
};

module.exports = customerRequestController;
