import { Response } from 'express';
import { MealAttendance } from '../models/MealAttendance';
import { Menu } from '../models/Menu';
import { FoodWasteReason } from '../models/FoodWasteReason';
import { AuthRequest } from '../middleware/auth';
import { Op, Sequelize } from 'sequelize';

export const getSchoolDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.tanggal = { [Op.between]: [startDate, endDate] };
    } else {
      // Default: last 30 days
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      dateFilter.tanggal = { [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]] };
    }

    // Total statistics
    const totalAttendance = await MealAttendance.count({ where: dateFilter });
    const habisCount = await MealAttendance.count({
      where: {
        ...dateFilter,
        ai_status: 'HABIS',
      },
    });
    const sisaCount = await MealAttendance.count({
      where: {
        ...dateFilter,
        ai_status: { [Op.in]: ['SISA_SEDIKIT', 'SISA_BANYAK'] },
      },
    });
    const pendingCount = await MealAttendance.count({
      where: {
        ...dateFilter,
        ai_status: 'PENDING_VERIFICATION',
      },
    });

    // Menu statistics (most wasted)
    const menuStats = await MealAttendance.findAll({
      attributes: [
        'menu_id',
        [Sequelize.fn('COUNT', Sequelize.col('meal_attendance.id')), 'count'],
      ],
      where: {
        ...dateFilter,
        ai_status: { [Op.in]: ['SISA_SEDIKIT', 'SISA_BANYAK'] },
      },
      group: ['menu_id'],
      order: [[Sequelize.literal('count'), 'DESC']],
      limit: 5,
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'nama_menu'],
          required: false,
        },
      ],
    });

    // Daily statistics
    const dailyStats = await MealAttendance.findAll({
      attributes: [
        'tanggal',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.literal("SUM(CASE WHEN ai_status = 'HABIS' THEN 1 ELSE 0 END)"), 'habis'],
        [Sequelize.literal("SUM(CASE WHEN ai_status IN ('SISA_SEDIKIT', 'SISA_BANYAK') THEN 1 ELSE 0 END)"), 'sisa'],
      ],
      where: dateFilter,
      group: ['tanggal'],
      order: [['tanggal', 'ASC']],
    });

    // Reason statistics
    const reasonStats = await FoodWasteReason.findAll({
      attributes: [
        'reason_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['reason_type'],
      order: [[Sequelize.literal('count'), 'DESC']],
      include: [
        {
          model: MealAttendance,
          as: 'attendance',
          attributes: [],
          where: dateFilter,
          required: true,
        },
      ],
    });

    res.json({
      stats: {
        totalAttendance,
        habisCount,
        sisaCount,
        pendingCount,
        habisPercentage: totalAttendance > 0 ? (habisCount / totalAttendance) * 100 : 0,
        sisaPercentage: totalAttendance > 0 ? (sisaCount / totalAttendance) * 100 : 0,
      },
      menuStats: menuStats.map((item: any) => ({
        menuId: item.menu_id,
        menuName: item.menu?.nama_menu || 'Tidak diketahui',
        count: parseInt(item.get('count') || 0),
      })),
      dailyStats: dailyStats.map((item: any) => ({
        tanggal: item.tanggal,
        total: parseInt(item.get('total') || 0),
        habis: parseInt(item.get('habis') || 0),
        sisa: parseInt(item.get('sisa') || 0),
      })),
      reasonStats: reasonStats.map((item: any) => ({
        reasonType: item.reason_type,
        count: parseInt(item.get('count') || 0),
      })),
    });
  } catch (error) {
    console.error('Get school dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSPPGDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.tanggal = { [Op.between]: [startDate, endDate] };
    }

    // Menu evaluation (which menus are most wasted)
    const menuEvaluation = await MealAttendance.findAll({
      attributes: [
        'menu_id',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
        [Sequelize.literal("SUM(CASE WHEN ai_status = 'HABIS' THEN 1 ELSE 0 END)"), 'habis'],
        [Sequelize.literal("SUM(CASE WHEN ai_status IN ('SISA_SEDIKIT', 'SISA_BANYAK') THEN 1 ELSE 0 END)"), 'sisa'],
      ],
      where: dateFilter,
      group: ['menu_id'],
      include: [
        {
          model: Menu,
          as: 'menu',
          attributes: ['id', 'nama_menu', 'deskripsi'],
          required: false,
        },
      ],
      order: [[Sequelize.literal('sisa'), 'DESC']],
    });

    // Reason analysis
    const reasonAnalysis = await FoodWasteReason.findAll({
      attributes: [
        'reason_type',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count'],
      ],
      group: ['reason_type'],
      include: [
        {
          model: MealAttendance,
          as: 'attendance',
          attributes: [],
          where: dateFilter,
          required: true,
        },
      ],
    });

    res.json({
      menuEvaluation: menuEvaluation.map((item: any) => ({
        menu: item.menu,
        total: parseInt(item.get('total') || 0),
        habis: parseInt(item.get('habis') || 0),
        sisa: parseInt(item.get('sisa') || 0),
        wastePercentage: parseInt(item.get('total') || 0) > 0 
          ? (parseInt(item.get('sisa') || 0) / parseInt(item.get('total') || 0)) * 100 
          : 0,
      })),
      reasonAnalysis: reasonAnalysis.map((item: any) => ({
        reasonType: item.reason_type,
        count: parseInt(item.get('count') || 0),
      })),
    });
  } catch (error) {
    console.error('Get SPPG dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const exportCSV = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.tanggal = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await MealAttendance.findAll({
      where: dateFilter,
      include: [
        { model: Menu, as: 'menu', attributes: ['nama_menu'] },
        { model: User, as: 'user', attributes: ['nama', 'kelas', 'nis'] },
      ],
      order: [['tanggal', 'DESC']],
    });

    // Convert to CSV format
    const csvHeader = 'Tanggal,Nama,Kelas,NIS,Menu,Status,Confidence\n';
    const csvRows = attendance.map((item: any) => {
      return [
        item.tanggal,
        item.user?.nama || '',
        item.user?.kelas || '',
        item.user?.nis || '',
        item.menu?.nama_menu || '',
        item.ai_status,
        item.ai_confidence || 0,
      ].join(',');
    }).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=smart-mbg-export-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

