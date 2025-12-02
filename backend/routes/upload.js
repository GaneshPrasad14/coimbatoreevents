import express from 'express';
import { uploadImage, getImage } from '../controllers/uploadController.js';
import { upload } from '../utils/fileUpload.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/upload/image
// @desc    Upload image
// @access  Private (Admin only)
router.post('/image', protect, authorize('admin', 'super_admin'), upload.single('image'), uploadImage);

// @route   GET /api/upload/image/:filename
// @desc    Get uploaded image
// @access  Public
router.get('/image/:filename', getImage);

export default router;