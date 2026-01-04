import { Router } from 'express';
import {
  getMyPoints,
  getPointsHistory,
  getPointsBreakdown,
  getLeaderboard,
} from '../controllers/pointsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get my total points
router.get('/my', authenticate, getMyPoints);

// Get points history
router.get('/history', authenticate, getPointsHistory);

// Get points breakdown
router.get('/breakdown', authenticate, getPointsBreakdown);

// Get leaderboard (optional feature)
router.get('/leaderboard', authenticate, getLeaderboard);

export default router;

