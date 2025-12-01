import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
const optimizedDir = path.join(__dirname, '../uploads/optimized');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(optimizedDir)) {
  fs.mkdirSync(optimizedDir, { recursive: true });
}

// Configure multer for file storage
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Image optimization functions
export const optimizeImage = async (buffer, originalName) => {
  const optimizedName = `optimized_${Date.now()}_${originalName}`;
  const optimizedPath = path.join(optimizedDir, optimizedName);

  try {
    await sharp(buffer)
      .resize(1200, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 80 })
      .toFile(optimizedPath);

    return {
      optimizedName,
      path: optimizedPath,
      url: `/uploads/optimized/${optimizedName}`
    };
  } catch (error) {
    console.error('Image optimization error:', error);
    throw new Error('Failed to optimize image');
  }
};

export const generateThumbnail = async (buffer, originalName) => {
  const thumbnailName = `thumb_${Date.now()}_${originalName}`;
  const thumbnailPath = path.join(optimizedDir, thumbnailName);

  try {
    await sharp(buffer)
      .resize(300, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    return {
      thumbnailName,
      path: thumbnailPath,
      url: `/uploads/optimized/${thumbnailName}`
    };
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

// Clean up old files (optional - for maintenance)
export const cleanupOldFiles = (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old file: ${file}`);
      }
    });
  } catch (error) {
    console.error('Cleanup error:', error);
  }
};