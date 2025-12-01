import mongoose from 'mongoose';

const adminUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
      'Please provide a valid email address'
    ],
    index: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'super_admin'],
      message: 'Role must be either admin or super_admin'
    },
    default: 'admin'
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_login: {
    type: Date,
    default: null
  },
  login_attempts: {
    type: Number,
    default: 0
  },
  lock_until: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance (email index is already defined in schema)

// Virtual for account lock status
adminUserSchema.virtual('is_locked').get(function () {
  return !!(this.lock_until && this.lock_until > Date.now());
});

// Instance method to increment login attempts
adminUserSchema.methods.incLoginAttempts = function () {
  // Reset attempts if lock has expired
  if (this.lock_until && this.lock_until < Date.now()) {
    return this.updateOne({
      $unset: { lock_until: 1 },
      $set: { login_attempts: 1 }
    }).exec();
  }

  const updates = { $inc: { login_attempts: 1 } };

  // Lock account after 50 failed attempts for 2 hours
  if (this.login_attempts + 1 >= 50 && !this.is_locked) {
    updates.$set = {
      lock_until: Date.now() + 2 * 60 * 60 * 1000 // 2 hours
    };
  }

  return this.updateOne(updates).exec();
};

// Instance method to reset login attempts on successful login
adminUserSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { login_attempts: 1, lock_until: 1 },
    $set: { last_login: new Date() }
  }).exec();
};

// Static method to find active admin
adminUserSchema.statics.findActiveAdmin = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    is_active: true
  }).select('+password');
};

const AdminUser = mongoose.model('AdminUser', adminUserSchema);

export default AdminUser;