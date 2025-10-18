/**
 * AI Insights Routes - API endpoints for AI-generated insights management
 * Protected routes with JWT authentication and validation
 */

const express = require('express');
const router = express.Router();
const aiInsightsController = require('../controllers/aiInsightsController');
const { authenticateToken } = require('../middleware/auth');
const { validateAiInsight } = require('../middleware/validation');

// All AI insights routes require authentication
router.use(authenticateToken);

// AI insights routes
router.get('/', aiInsightsController.getAllInsights);
router.get('/latest', aiInsightsController.getLatestInsights);
router.get('/:id', aiInsightsController.getInsightById);
router.post('/', validateAiInsight, aiInsightsController.createInsight);
router.put('/:id', validateAiInsight, aiInsightsController.updateInsight);
router.delete('/:id', aiInsightsController.deleteInsight);

module.exports = router;
