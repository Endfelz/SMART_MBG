import multer from 'multer';
import { Request } from 'express';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Format file tidak didukung. Gunakan: ${allowedTypes.join(', ')}`));
  }
};

// Multer configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880'), // 5MB default
    files: 1, // Only 1 file at a time
  },
});

// Error handler for multer
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File terlalu besar',
        message: `Ukuran file melebihi ${parseInt(process.env.UPLOAD_MAX_SIZE || '5242880') / 1024 / 1024}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Terlalu banyak file',
        message: 'Hanya boleh upload 1 file',
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      error: 'Upload gagal',
      message: err.message,
    });
  }
  
  next();
};

