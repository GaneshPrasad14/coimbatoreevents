import express from 'express';
import {
  getAllEvents,
  getEventById,
  getFeaturedEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getEventsByStatus
} from '../controllers/eventController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllEvents);
router.get('/featured', getFeaturedEvents);
router.get('/status/:status', getEventsByStatus);
router.get('/:id', getEventById);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin', 'super_admin'), createEvent);
router.put('/:id', protect, authorize('admin', 'super_admin'), updateEvent);
router.delete('/:id', protect, authorize('admin', 'super_admin'), deleteEvent);

export default router;