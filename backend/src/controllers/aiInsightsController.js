const AiInsight = require('../models/AiInsight');
const { validationResult } = require('express-validator');

/**
 * AI Insights Controller - AI-generated business insights management
 * Handles storing and retrieving AI-generated business recommendations
 * Future: Integration with GPT-4o for automated business insights generation
 */

const aiInsightsController = {
  // Get all AI insights for authenticated user
  getAllInsights: async (req, res) => {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, type } = req.query;
      
      // Build filter object
      const filter = { user_id: userId };
      
      if (type) {
        filter['insights_data.type'] = type;
      }

      const insights = await AiInsight.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .populate('user_id', 'name shop_name');

      const total = await AiInsight.countDocuments(filter);

      res.status(200).json({
        success: true,
        message: 'AI insights retrieved successfully',
        data: insights,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      console.error('Get AI insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching AI insights',
        error: error.message
      });
    }
  },

  // Get AI insight by ID
  getInsightById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const insight = await AiInsight.findOne({ _id: id, user_id: userId })
        .populate('user_id', 'name shop_name');

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: 'AI insight not found',
          error: 'Insight does not exist or does not belong to you'
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI insight retrieved successfully',
        data: insight
      });
    } catch (error) {
      console.error('Get AI insight error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching AI insight',
        error: error.message
      });
    }
  },

  // Create new AI insight
  createInsight: async (req, res) => {
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

      const userId = req.user._id;
      const { summary_text, insights_data } = req.body;

      // Create new AI insight
      const insight = new AiInsight({
        user_id: userId,
        summary_text,
        insights_data
      });

      await insight.save();
      await insight.populate('user_id', 'name shop_name');

      res.status(201).json({
        success: true,
        message: 'AI insight created successfully',
        data: insight
      });
    } catch (error) {
      console.error('Create AI insight error:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating AI insight',
        error: error.message
      });
    }
  },

  // Update AI insight
  updateInsight: async (req, res) => {
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

      const { id } = req.params;
      const userId = req.user._id;
      const { summary_text, insights_data } = req.body;

      const insight = await AiInsight.findOneAndUpdate(
        { _id: id, user_id: userId },
        { summary_text, insights_data },
        { new: true, runValidators: true }
      ).populate('user_id', 'name shop_name');

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: 'AI insight not found',
          error: 'Insight does not exist or does not belong to you'
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI insight updated successfully',
        data: insight
      });
    } catch (error) {
      console.error('Update AI insight error:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating AI insight',
        error: error.message
      });
    }
  },

  // Delete AI insight
  deleteInsight: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;

      const insight = await AiInsight.findOneAndDelete({ _id: id, user_id: userId });

      if (!insight) {
        return res.status(404).json({
          success: false,
          message: 'AI insight not found',
          error: 'Insight does not exist or does not belong to you'
        });
      }

      res.status(200).json({
        success: true,
        message: 'AI insight deleted successfully',
        data: { deletedInsightId: id }
      });
    } catch (error) {
      console.error('Delete AI insight error:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting AI insight',
        error: error.message
      });
    }
  },

  // Get latest AI insights (for dashboard)
  getLatestInsights: async (req, res) => {
    try {
      const userId = req.user._id;
      const { limit = 5 } = req.query;

      const insights = await AiInsight.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .populate('user_id', 'name shop_name');

      res.status(200).json({
        success: true,
        message: 'Latest AI insights retrieved successfully',
        data: insights,
        count: insights.length
      });
    } catch (error) {
      console.error('Get latest insights error:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching latest insights',
        error: error.message
      });
    }
  }
};

module.exports = aiInsightsController;
