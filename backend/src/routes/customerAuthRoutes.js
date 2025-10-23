const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { authenticateToken } = require('../middleware/auth');
const { validateCustomerRegistration, validateCustomerLogin } = require('../middleware/validation');

/**
 * Customer Authentication Routes
 * Handles customer user registration, login, and profile management
 */

// Public routes
router.post('/register', validateCustomerRegistration, customerAuthController.register);
router.post('/login', validateCustomerLogin, customerAuthController.login);

// Protected routes
router.get('/profile', authenticateToken, customerAuthController.getProfile);
router.put('/profile', authenticateToken, customerAuthController.updateProfile);

module.exports = router;
