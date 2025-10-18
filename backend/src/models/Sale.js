const mongoose = require('mongoose');

/**
 * Sale Model - Sales transaction tracking
 * Fields: user_id, date, items, total_amount, payment_method
 * Used for recording sales transactions and revenue tracking
 * Future: Integration with AI for sales insights and predictions
 */
const saleSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  items: [{
    item_name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    price_per_unit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    }
  }],
  total_amount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  payment_method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: {
      values: ['Cash', 'UPI', 'Credit'],
      message: 'Payment method must be Cash, UPI, or Credit'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
saleSchema.index({ user_id: 1, date: -1 });
saleSchema.index({ user_id: 1, payment_method: 1 });

// Virtual for sale summary
saleSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    date: this.date,
    total_amount: this.total_amount,
    payment_method: this.payment_method,
    items_count: this.items.length,
    createdAt: this.createdAt
  };
});

// Calculate total amount before saving
saleSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.total_amount = this.items.reduce((total, item) => {
      return total + (item.quantity * item.price_per_unit);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Sale', saleSchema);
