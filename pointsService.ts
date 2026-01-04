import { Points } from '../models/Points';
import { Op } from 'sequelize';

/**
 * Calculate and record points for user
 */
export const calculatePoints = async (
  userId: string,
  referenceId: string,
  type: 'MEAL_HABIS' | 'MEAL_TIDAK_HABIS' | 'WASTE_UTILIZATION',
  points: number,
  description?: string
): Promise<void> => {
  try {
    await Points.create({
      user_id: userId,
      attendance_id: type !== 'WASTE_UTILIZATION' ? referenceId : undefined,
      waste_utilization_id: type === 'WASTE_UTILIZATION' ? referenceId : undefined,
      points,
      type,
      description: description || `Points from ${type}`,
    });
  } catch (error) {
    console.error('Calculate points error:', error);
    throw error;
  }
};

/**
 * Get total points for a user
 */
export const getUserTotalPoints = async (userId: string): Promise<number> => {
  try {
    const result = await Points.sum('points', {
      where: { user_id: userId },
    });
    return result || 0;
  } catch (error) {
    console.error('Get user points error:', error);
    return 0;
  }
};

/**
 * Get points history for a user
 */
export const getUserPointsHistory = async (
  userId: string,
  limit: number = 50
): Promise<Points[]> => {
  try {
    return await Points.findAll({
      where: { user_id: userId },
      limit,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'points', 'type', 'description', 'created_at'],
    });
  } catch (error) {
    console.error('Get points history error:', error);
    return [];
  }
};

/**
 * Get points breakdown by type
 */
export const getUserPointsBreakdown = async (userId: string) => {
  try {
    const habis = await Points.sum('points', {
      where: { 
        user_id: userId,
        type: 'MEAL_HABIS',
      },
    });

    const tidakHabis = await Points.sum('points', {
      where: { 
        user_id: userId,
        type: 'MEAL_TIDAK_HABIS',
      },
    });

    const waste = await Points.sum('points', {
      where: { 
        user_id: userId,
        type: 'WASTE_UTILIZATION',
      },
    });

    return {
      habis: habis || 0,
      tidakHabis: tidakHabis || 0,
      waste: waste || 0,
      total: (habis || 0) + (tidakHabis || 0) + (waste || 0),
    };
  } catch (error) {
    console.error('Get points breakdown error:', error);
    return {
      habis: 0,
      tidakHabis: 0,
      waste: 0,
      total: 0,
    };
  }
};

