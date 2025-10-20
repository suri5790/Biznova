/**
 * Chatbot Routes - API endpoints for AI chatbot interactions
 */

const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticateToken } = require('../middleware/auth');

// All chatbot routes require authentication
router.use(authenticateToken);

// @route   POST /api/chatbot/chat
// @desc    Send message to AI chatbot
// @access  Private
router.post('/chat', chatbotController.chat);

// @route   GET /api/chatbot/status
// @desc    Get chatbot health status
// @access  Private
router.get('/status', chatbotController.getStatus);

module.exports = router;
