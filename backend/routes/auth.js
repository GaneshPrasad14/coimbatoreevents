import express from 'express';
import {
  login,
  getProfile,
  logout,
  createAdmin,
  getAdmins
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/create-admin', createAdmin); // For initial setup only

// Protected routes
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logout);
router.get('/admins', protect, authorize('super_admin'), getAdmins);

export default router;