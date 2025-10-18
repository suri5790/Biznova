const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Model - Core user schema for BizNova business owners
 * Fields: name, phone, password, shop_name, language, upi_id
 * Used for authentication and business profile management
 * Future: Integration with AI services and WhatsApp communication
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  shop_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Shop name cannot exceed 100 characters']
  },
  language: {
    type: String,
    default: 'Hindi',
    enum: ['Hindi', 'English', 'Tamil', 'Telugu', 'Bengali', 'Gujarati', 'Marathi', 'Kannada', 'Malayalam', 'Punjabi'],
    trim: true
  },
  upi_id: {
    type: String,
    trim: true,
    match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please enter a valid UPI ID']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for user's full profile
userSchema.virtual('profile').get(function() {
  return {
    id: this._id,
    name: this.name,
    phone: this.phone,
    shop_name: this.shop_name,
    language: this.language,
    upi_id: this.upi_id,
    createdAt: this.createdAt
  };
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
