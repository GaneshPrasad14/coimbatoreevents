import { optimizeImage, generateThumbnail } from '../utils/fileUpload.js';

// @desc    Upload and optimize image
// @route   POST /api/upload/image
// @access  Private (Admin)
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;

    // Validate file type
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed'
      });
    }

    // Optimize the uploaded image
    const optimizedResult = await optimizeImage(buffer, originalname);

    // Generate thumbnail
    const thumbnailResult = await generateThumbnail(buffer, originalname);

    res.json({
      success: true,
      message: 'Image uploaded and optimized successfully',
      data: {
        original: {
          filename: originalname,
          size: buffer.length,
          mimetype: mimetype,
        },
        optimized: {
          filename: optimizedResult.optimizedName,
          url: optimizedResult.url,
          path: optimizedResult.path,
        },
        thumbnail: {
          filename: thumbnailResult.thumbnailName,
          url: thumbnailResult.url,
          path: thumbnailResult.path,
        },
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image'
    });
  }
};

// @desc    Get uploaded image
// @route   GET /api/upload/image/:filename
// @access  Public
export const getImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const { type = 'optimized' } = req.query;

    const subDir = type === 'thumbnail' ? 'optimized' : 'optimized';
    const filePath = `backend/uploads/${subDir}/${filename}`;

    // Check if file exists
    if (!require('fs').existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    res.sendFile(filePath, { root: process.cwd() });

  } catch (error) {
    console.error('Get image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve image'
    });
  }
};