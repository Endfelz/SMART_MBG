import { Response } from 'express';
import { getUserTotalPoints, getUserPointsHistory, getUserPointsBreakdown } from '../services/pointsService';
import { User } from '../models/User';
import { Points } from '../models/Points';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const getMyPoints = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const totalPoints = await getUserTotalPoints(userId);

    res.json({
      totalPoints,
      userId,
    });
  } catch (error) {
    console.error('Get my points error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPointsHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { limit = '50' } = req.query;

    const history = await getUserPointsHistory(userId, parseInt(limit as string));

    res.json({
      history,
      total: history.length,
    });
  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getPointsBreakdown = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const breakdown = await getUserPointsBreakdown(userId);

    res.json(breakdown);
  } catch (error) {
    console.error('Get points breakdown error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = '10' } = req.query;

    // Get top users by total points
    const topUsers = await Points.findAll({
      attributes: [
        'user_id',
        [Points.sequelize!.fn('SUM', Points.sequelize!.col('points')), 'total_points'],
      ],
      group: ['user_id'],
      order: [[Points.sequelize!.literal('total_points'), 'DESC']],
      limit: parseInt(limit as string),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'nama', 'kelas', 'role'],
          where: { role: 'siswa' }, // Only show students
        },
      ],
    });

    res.json({
      leaderboard: topUsers.map((item: any, index) => ({
        rank: index + 1,
        userId: item.user_id,
        totalPoints: parseInt(item.get('total_points') || 0),
        user: item.user,
      })),
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

