import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  image: {
    type: String,
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [200, 'Venue cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    trim: true
  },
  event_date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  is_featured: {
    type: Boolean,
    default: false
  },
  featured_order: {
    type: Number,
    min: [1, 'Featured order must be at least 1']
  },
  priority: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: {
      values: ['upcoming', 'ongoing', 'past'],
      message: 'Status must be one of: upcoming, ongoing, past'
    },
    default: 'upcoming'
  },
  booking_url: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
eventSchema.index({ event_date: 1 });
eventSchema.index({ is_featured: 1, featured_order: 1 });
eventSchema.index({ priority: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });

// Virtual for formatted date
eventSchema.virtual('formatted_date').get(function () {
  return this.event_date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Pre-save middleware to validate featured order
eventSchema.pre('save', function (next) {
  if (this.is_featured && !this.featured_order) {
    return next(new Error('Featured order is required for featured events'));
  }
  if (!this.is_featured) {
    this.featured_order = undefined;
  }
  next();
});

// Static method to find featured events
eventSchema.statics.findFeatured = function () {
  return this.find({ is_featured: true }).sort({ featured_order: 1 });
};

// Static method to find events by status
eventSchema.statics.findByStatus = function (status) {
  return this.find({ status }).sort({ event_date: -1 });
};

const Event = mongoose.model('Event', eventSchema);

export default Event;