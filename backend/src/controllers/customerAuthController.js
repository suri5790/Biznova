const CustomerUser = require('../models/CustomerUser');
const { generateToken } = require('../middleware/auth');
const { validationResult } = require('express-validator');

/**
 * Customer Authentication Controller
 * Handles customer user registration, login, and profile management
 * Separate from retailer authentication
 */

const customerAuthController = {
  // Register new customer
  register: async (req, res) => {
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

      const { name, email, password, phone, address } = req.body;

      // Check if customer already exists with email
      const existingCustomer = await CustomerUser.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'Customer already exists with this email',
          error: 'Email already registered'
        });
      }

      // Create new customer
      const customer = new CustomerUser({
        name,
        email,
        password,
        phone,
        address: address || {}
      });

      await customer.save();

      // Generate JWT token
      const token = generateToken(customer._id);

      res.status(201).json({
        success: true,
        message: 'Customer registered successfully',
        data: {
          customer: customer.profile,
          token,
          userType: 'customer'
        }
      });
    } catch (error) {
      console.error('Customer registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message
      });
    }
  },

  // Login customer
  login: async (req, res) => {
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

      const { email, password } = req.body;

      // Find customer by email
      const customer = await CustomerUser.findOne({ email });
      if (!customer) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'Email or password incorrect'
        });
      }

      // Check password
      const isPasswordValid = await customer.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
          error: 'Email or password incorrect'
        });
      }

      // Generate JWT token
      const token = generateToken(customer._id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          customer: customer.profile,
          token,
          userType: 'customer'
        }
      });
    } catch (error) {
      console.error('Customer login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message
      });
    }
  },

  // Get current customer profile
  getProfile: async (req, res) => {
    try {
      const customer = await CustomerUser.findById(req.user._id);
      
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Customer profile retrieved successfully',
        data: {
          customer: customer.profile,
          userType: 'customer'
        }
      });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        error: error.message
      });
    }
  },

  // Update customer profile
  updateProfile: async (req, res) => {
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

      const { name, phone, address } = req.body;
      const customerId = req.user._id;

      // Update customer
      const customer = await CustomerUser.findByIdAndUpdate(
        customerId,
        { name, phone, address },
        { new: true, runValidators: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found',
          error: 'Customer does not exist'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          customer: customer.profile
        }
      });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed',
        error: error.message
      });
    }
  }
};

module.exports = customerAuthController;
