import { Router } from 'express';
import {
  getSchoolDashboard,
  getSPPGDashboard,
  exportCSV,
} from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// School dashboard (admin only)
router.get('/school', authenticate, authorize('admin', 'guru'), getSchoolDashboard);

// SPPG dashboard (read-only)
router.get('/sppg', authenticate, authorize('sppg', 'admin'), getSPPGDashboard);

// Export data to CSV
router.get('/export', authenticate, authorize('admin', 'sppg'), exportCSV);

export default router;

