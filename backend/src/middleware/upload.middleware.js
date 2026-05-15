import multer from 'multer';
import { AppError } from '../utils/appError.js';

// Setup memory storage to hold uploaded files in Buffer objects temporarily
const storage = multer.memoryStorage();

// File filter validator to restrict uploads to specific formats (images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Upload Blocked: Unsupported file format [${file.mimetype}]. Only JPG, PNG, WEBP images and PDF invoices are permitted.`,
        400
      ),
      false
    );
  }
};

// Multer upload middleware instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Megabytes Max File Size
  }
});

/**
 * Handle Multer errors gracefully inside Express lifecycle
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Upload Blocked: File is too large. Maximum size is 5MB.', 400));
    }
    return next(new AppError(`File upload driver error: ${err.message}`, 400));
  }
  next(err);
};
