import { Router } from 'express';
import {
  uploadWasteUtilization,
  getMyWasteUtilizations,
  getWasteDetail,
  getAISuggestion,
  verifyWasteUtilization,
} from '../controllers/wasteController';
import { authenticate, authorize } from '../middleware/auth';
import { upload, handleMulterError } from '../utils/fileUpload';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Upload waste utilization
router.post(
  '/upload',
  authenticate,
  uploadRateLimiter,
  upload.single('photo'),
  handleMulterError,
  uploadWasteUtilization
);

// Get my waste utilizations
router.get('/my', authenticate, getMyWasteUtilizations);

// Get waste detail
router.get('/:wasteId', authenticate, getWasteDetail);

// Get AI suggestion
router.post('/ai-suggest', authenticate, upload.single('photo'), handleMulterError, getAISuggestion);

// Verify waste utilization (guru/admin only)
router.post(
  '/:wasteId/verify',
  authenticate,
  authorize('guru', 'admin'),
  verifyWasteUtilization
);

export default router;

