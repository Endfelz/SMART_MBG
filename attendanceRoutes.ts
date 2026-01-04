import { Router } from 'express';
import {
  uploadAttendance,
  getMyAttendance,
  getAttendanceDetail,
  submitReason,
  verifyAttendance,
} from '../controllers/attendanceController';
import { authenticate, authorize } from '../middleware/auth';
import { upload, handleMulterError } from '../utils/fileUpload';
import { uploadRateLimiter } from '../middleware/rateLimiter';
import { attendanceUploadValidator, reasonSubmitValidator } from '../utils/validators';

const router = Router();

// Upload attendance (with rate limiting for uploads)
router.post(
  '/upload',
  authenticate,
  uploadRateLimiter,
  upload.single('photo'),
  handleMulterError,
  attendanceUploadValidator,
  uploadAttendance
);

// Get my attendance history
router.get('/my', authenticate, getMyAttendance);

// Get attendance detail
router.get('/:attendanceId', authenticate, getAttendanceDetail);

// Submit reason for food waste
router.post('/:attendanceId/reason', authenticate, reasonSubmitValidator, submitReason);

// Verify attendance (guru/admin only)
router.post(
  '/:attendanceId/verify',
  authenticate,
  authorize('guru', 'admin'),
  verifyAttendance
);

export default router;

