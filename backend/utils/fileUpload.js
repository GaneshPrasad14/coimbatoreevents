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

export const optimizeImage = async (buffer, originalname) => {
  const timestamp = Date.now();
  const name = path.parse(originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const optimizedName = `${name}-${timestamp}.webp`;
  const outputPath = path.join(optimizedDir, optimizedName);

  await sharp(buffer)
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(outputPath);

  return {
    optimizedName,
    url: `/uploads/optimized/${optimizedName}`,
    path: outputPath
  };
};

export const generateThumbnail = async (buffer, originalname) => {
  const timestamp = Date.now();
  const name = path.parse(originalname).name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const thumbnailName = `${name}-${timestamp}-thumb.webp`;
  const outputPath = path.join(optimizedDir, thumbnailName);

  await sharp(buffer)
    .resize(300, 300, { fit: 'cover' })
    .webp({ quality: 70 })
    .toFile(outputPath);

  return {
    thumbnailName,
    url: `/uploads/optimized/${thumbnailName}`,
    path: outputPath
  };
};

// Clean up old files (optional - for maintenance)
export const cleanupOldFiles = (directory, maxAge = 24 * 60 * 60 * 1000) => {
  try {
    if (!fs.existsSync(directory)) return;

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