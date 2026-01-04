import { Response } from 'express';
import { validationResult } from 'express-validator';
import { MealAttendance } from '../models/MealAttendance';
import { FoodWasteReason } from '../models/FoodWasteReason';
import { detectFoodWaste } from '../services/aiService';
import { uploadImage, cropImage, validateImage } from '../services/imageService';
import { calculatePoints } from '../services/pointsService';
import { containsBadWords } from '../services/badWordsFilter';
import { validateFile } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const uploadAttendance = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: errors.array(),
      });
    }

    const userId = req.user!.userId;
    const { menuId } = req.body;
    const file = req.file;

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return res.status(400).json({ error: fileValidation.message });
    }

    // Validate image dimensions and content
    const imageValidation = await validateImage(file!.buffer);
    if (!imageValidation.valid) {
      return res.status(400).json({ error: imageValidation.message });
    }

    // Check: 1 foto per hari
    const today = new Date().toISOString().split('T')[0];
    const existing = await MealAttendance.findOne({
      where: { user_id: userId, tanggal: today },
    });

    if (existing) {
      return res.status(409).json({ 
        error: 'Anda sudah absen makan hari ini',
        message: 'Setiap siswa hanya boleh upload 1 foto per hari',
      });
    }

    // Crop image to remove face area
    const croppedImage = await cropImage(file!.buffer);

    // Upload to cloud storage
    const { url, thumbnailUrl } = await uploadImage(croppedImage, `attendance/${userId}`);

    // AI Detection
    const aiResult = await detectFoodWaste(croppedImage);
    
    let status = aiResult.status;
    if (aiResult.confidence < 0.7) {
      status = 'PENDING_VERIFICATION' as any;
    }

    // Create attendance record
    const attendance = await MealAttendance.create({
      user_id: userId,
      menu_id: menuId || null,
      foto_url: url,
      foto_thumbnail_url: thumbnailUrl,
      ai_status: status,
      ai_confidence: aiResult.confidence,
      tanggal: today,
    });

    // Calculate points (if HABIS)
    if (status === 'HABIS') {
      await calculatePoints(userId, attendance.id, 'MEAL_HABIS', 10, 'Makan habis');
    }

    res.status(201).json({
      message: 'Foto berhasil diupload',
      attendance: {
        id: attendance.id,
        status: attendance.ai_status,
        confidence: attendance.ai_confidence,
        needsVerification: status === 'PENDING_VERIFICATION',
        fotoUrl: attendance.foto_thumbnail_url,
      },
    });
  } catch (error: any) {
    console.error('Upload attendance error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Anda sudah absen hari ini',
      });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { startDate, endDate, limit = '30' } = req.query;

    const where: any = { user_id: userId };
    if (startDate && endDate) {
      where.tanggal = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await MealAttendance.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['tanggal', 'DESC']],
      include: [
        { association: 'menu', attributes: ['id', 'nama_menu'] },
        { association: 'verifier', attributes: ['id', 'nama'], required: false },
      ],
      attributes: [
        'id',
        'foto_thumbnail_url',
        'ai_status',
        'ai_confidence',
        'tanggal',
        'timestamp',
        'verified_at',
      ],
    });

    res.json({ 
      attendance,
      total: attendance.length,
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAttendanceDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const userId = req.user!.userId;

    const attendance = await MealAttendance.findOne({
      where: { 
        id: attendanceId,
        user_id: userId, // User can only see their own attendance
      },
      include: [
        { association: 'menu', attributes: ['id', 'nama_menu', 'deskripsi'] },
        { association: 'verifier', attributes: ['id', 'nama'], required: false },
        { 
          association: 'attendance',
          model: FoodWasteReason,
          as: 'reasons',
          required: false,
        },
      ],
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance tidak ditemukan' });
    }

    res.json({ attendance });
  } catch (error) {
    console.error('Get attendance detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const submitReason = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: errors.array(),
      });
    }

    const { attendanceId } = req.params;
    const { reasonType, reasonText } = req.body;
    const userId = req.user!.userId;

    const attendance = await MealAttendance.findOne({
      where: { 
        id: attendanceId,
        user_id: userId, // User can only submit reason for their own attendance
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: 'Attendance tidak ditemukan' });
    }

    if (attendance.ai_status === 'HABIS') {
      return res.status(400).json({ 
        error: 'Tidak perlu mengisi alasan',
        message: 'Status makanan sudah HABIS',
      });
    }

    // Check if reason already exists
    const existingReason = await FoodWasteReason.findOne({
      where: { attendance_id: attendanceId },
    });

    if (existingReason) {
      return res.status(409).json({ 
        error: 'Alasan sudah diisi',
        message: 'Anda sudah mengisi alasan untuk absen ini',
      });
    }

    // Filter bad words
    if (reasonText && containsBadWords(reasonText)) {
      return res.status(400).json({ 
        error: 'Teks mengandung kata tidak pantas',
        message: 'Mohon gunakan bahasa yang sopan',
      });
    }

    // Create reason
    await FoodWasteReason.create({
      attendance_id: attendanceId,
      reason_type: reasonType,
      reason_text: reasonType === 'LAINNYA' ? reasonText?.trim() : null,
    });

    // Calculate points
    const points = reasonType === 'KONDISI_KESEHATAN' ? 0 : -5;
    await calculatePoints(
      attendance.user_id,
      attendanceId,
      'MEAL_TIDAK_HABIS',
      points,
      `Alasan: ${reasonType}`
    );

    res.json({ 
      message: 'Alasan berhasil disimpan',
      success: true,
    });
  } catch (error) {
    console.error('Submit reason error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { attendanceId } = req.params;
    const { status } = req.body;
    const verifierId = req.user!.userId;

    if (!['HABIS', 'SISA_SEDIKIT', 'SISA_BANYAK'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status tidak valid',
        message: 'Status harus HABIS, SISA_SEDIKIT, atau SISA_BANYAK',
      });
    }

    const attendance = await MealAttendance.findByPk(attendanceId);
    if (!attendance) {
      return res.status(404).json({ error: 'Attendance tidak ditemukan' });
    }

    // Update attendance
    attendance.ai_status = status as any;
    attendance.verified_by = verifierId;
    attendance.verified_at = new Date();
    await attendance.save();

    // Calculate points if HABIS
    if (status === 'HABIS') {
      await calculatePoints(attendance.user_id, attendanceId, 'MEAL_HABIS', 10, 'Diverifikasi guru');
    }

    res.json({ 
      message: 'Verifikasi berhasil',
      attendance: {
        id: attendance.id,
        status: attendance.ai_status,
        verified_at: attendance.verified_at,
      },
    });
  } catch (error) {
    console.error('Verify attendance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

