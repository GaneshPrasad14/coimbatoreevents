import Event from '../models/Event.js';
import fs from 'fs';
import path from 'path';

// Helper to shift priorities
const handlePriorityShift = async (model, field, value, excludeId = null) => {
  if (!value) return;

  const query = { [field]: { $gte: value } };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  await model.updateMany(
    query,
    { $inc: { [field]: 1 } }
  );
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getAllEvents = async (req, res) => {
  try {
    const { status, category, featured, limit = 50, skip = 0 } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (featured === 'true') query.is_featured = true;

    // Sort by priority (ascending, 1 is highest) then date
    // We use aggregation to handle "0 is last" logic
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          // Create a sort key: if priority > 0, use priority, else use Infinity
          sortPriority: {
            $cond: { if: { $gt: ["$priority", 0] }, then: "$priority", else: 999999 }
          }
        }
      },
      { $sort: { sortPriority: 1, event_date: -1 } },
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) }
    ];

    const events = await Event.aggregate(pipeline);
    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event'
    });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
export const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.findFeatured();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Error fetching featured events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured events'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req, res) => {
  try {
    const { priority, is_featured, featured_order } = req.body;

    // Handle General Priority Shift
    if (priority && priority > 0) {
      await handlePriorityShift(Event, 'priority', priority);
    }

    // Handle Hero Priority Shift
    if (is_featured && featured_order && featured_order > 0) {
      await handlePriorityShift(Event, 'featured_order', featured_order);
    }

    const event = await Event.create({
      ...req.body,
      created_by: req.user._id
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully'
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req, res) => {
  try {
    const logPath = path.join(process.cwd(), 'debug_log.txt');
    fs.appendFileSync(logPath, `Update Event Body: ${JSON.stringify(req.body)}\n`);

    const { priority, is_featured, featured_order } = req.body;
    const eventId = req.params.id;

    // Check if priority changed
    const oldEvent = await Event.findById(eventId);
    if (!oldEvent) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Handle General Priority Shift if priority is new or changed
    if (priority && priority > 0 && priority !== oldEvent.priority) {
      await handlePriorityShift(Event, 'priority', priority, eventId);
    }

    // Handle Hero Priority Shift if featured order is new or changed
    if (is_featured && featured_order && featured_order > 0) {
      // If it wasn't featured before, or order changed
      if (!oldEvent.is_featured || featured_order !== oldEvent.featured_order) {
        await handlePriorityShift(Event, 'featured_order', featured_order, eventId);
      }
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: event,
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event'
    });
  }
};

// @desc    Get events by status
// @route   GET /api/events/status/:status
// @access  Public
export const getEventsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const events = await Event.findByStatus(status)
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Event.countDocuments({ status });

    res.json({
      success: true,
      data: events,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching events by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events'
    });
  }
};