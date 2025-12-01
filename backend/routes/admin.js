import express from 'express';
import AdminUser from '../models/AdminUser.js';
import Event from '../models/Event.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard-stats
// @access  Private (Admin)
router.get('/dashboard-stats', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
    const ongoingEvents = await Event.countDocuments({ status: 'ongoing' });
    const pastEvents = await Event.countDocuments({ status: 'past' });
    const featuredEvents = await Event.countDocuments({ is_featured: true });
    const totalAdmins = await AdminUser.countDocuments();

    res.json({
      success: true,
      data: {
        total_events: totalEvents,
        upcoming_events: upcomingEvents,
        ongoing_events: ongoingEvents,
        past_events: pastEvents,
        featured_events: featuredEvents,
        total_admins: totalAdmins
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
});

// @desc    Get recent events
// @route   GET /api/admin/recent-events
// @access  Private (Admin)
router.get('/recent-events', protect, authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const events = await Event.find()
      .sort({ created_at: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Recent events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent events'
    });
  }
});

export default router;