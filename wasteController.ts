import { Response } from 'express';
import { WasteUtilization } from '../models/WasteUtilization';
import { uploadImage, validateImage } from '../services/imageService';
import { getWasteSuggestion } from '../services/aiAssistantService';
import { calculatePoints } from '../services/pointsService';
import { validateFile } from '../utils/validators';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

export const uploadWasteUtilization = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { jenis, deskripsi } = req.body;
    const file = req.file;

    // Validate required fields
    if (!jenis) {
      return res.status(400).json({ error: 'Jenis pemanfaatan diperlukan' });
    }

    if (!['KOMPOS', 'ECO_ENZYME', 'PAKAN_TERNAK', 'MEDIA_TANAM', 'PRAKARYA'].includes(jenis)) {
      return res.status(400).json({ error: 'Jenis pemanfaatan tidak valid' });
    }

    // Validate file
    const fileValidation = validateFile(file);
    if (!fileValidation.valid) {
      return res.status(400).json({ error: fileValidation.message });
    }

    // Validate image
    const imageValidation = await validateImage(file!.buffer);
    if (!imageValidation.valid) {
      return res.status(400).json({ error: imageValidation.message });
    }

    // Upload image
    const { url } = await uploadImage(file!.buffer, `waste/${userId}`);

    // Create waste utilization record
    const wasteUtilization = await WasteUtilization.create({
      user_id: userId,
      foto_url: url,
      jenis,
      deskripsi: deskripsi?.trim() || null,
      status: 'PENDING',
      points_awarded: 0,
    });

    res.status(201).json({
      message: 'Foto pemanfaatan limbah berhasil diupload. Menunggu verifikasi guru.',
      wasteUtilization: {
        id: wasteUtilization.id,
        jenis: wasteUtilization.jenis,
        status: wasteUtilization.status,
        fotoUrl: wasteUtilization.foto_url,
      },
    });
  } catch (error) {
    console.error('Upload waste utilization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMyWasteUtilizations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { status, limit = '20' } = req.query;

    const where: any = { user_id: userId };
    if (status) {
      where.status = status;
    }

    const wasteUtilizations = await WasteUtilization.findAll({
      where,
      limit: parseInt(limit as string),
      order: [['created_at', 'DESC']],
      include: [
        { association: 'verifier', attributes: ['id', 'nama'], required: false },
      ],
    });

    res.json({
      wasteUtilizations,
      total: wasteUtilizations.length,
    });
  } catch (error) {
    console.error('Get waste utilizations error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getWasteDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { wasteId } = req.params;
    const userId = req.user!.userId;

    const wasteUtilization = await WasteUtilization.findOne({
      where: {
        id: wasteId,
        user_id: userId,
      },
      include: [
        { association: 'verifier', attributes: ['id', 'nama'], required: false },
      ],
    });

    if (!wasteUtilization) {
      return res.status(404).json({ error: 'Pemanfaatan limbah tidak ditemukan' });
    }

    res.json({ wasteUtilization });
  } catch (error) {
    console.error('Get waste detail error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAISuggestion = async (req: AuthRequest, res: Response) => {
  try {
    const { jenis } = req.body;
    const file = req.file;

    if (!jenis) {
      return res.status(400).json({ error: 'Jenis pemanfaatan diperlukan' });
    }

    // Get AI suggestion
    const suggestion = await getWasteSuggestion(jenis);

    res.json({
      suggestion,
      jenis,
    });
  } catch (error) {
    console.error('Get AI suggestion error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const verifyWasteUtilization = async (req: AuthRequest, res: Response) => {
  try {
    const { wasteId } = req.params;
    const { status, points } = req.body;
    const verifierId = req.user!.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ 
        error: 'Status tidak valid',
        message: 'Status harus APPROVED atau REJECTED',
      });
    }

    const wasteUtilization = await WasteUtilization.findByPk(wasteId);
    if (!wasteUtilization) {
      return res.status(404).json({ error: 'Pemanfaatan limbah tidak ditemukan' });
    }

    // Update status
    wasteUtilization.status = status as any;
    wasteUtilization.verified_by = verifierId;
    wasteUtilization.verified_at = new Date();

    // Award points if approved
    if (status === 'APPROVED') {
      const pointsToAward = points || 15; // Default 15 points
      wasteUtilization.points_awarded = pointsToAward;
      await wasteUtilization.save();

      // Calculate points
      await calculatePoints(
        wasteUtilization.user_id,
        wasteId,
        'WASTE_UTILIZATION',
        pointsToAward,
        `Pemanfaatan limbah: ${wasteUtilization.jenis}`
      );
    } else {
      await wasteUtilization.save();
    }

    res.json({
      message: `Verifikasi ${status === 'APPROVED' ? 'berhasil' : 'ditolak'}`,
      wasteUtilization: {
        id: wasteUtilization.id,
        status: wasteUtilization.status,
        points_awarded: wasteUtilization.points_awarded,
        verified_at: wasteUtilization.verified_at,
      },
    });
  } catch (error) {
    console.error('Verify waste utilization error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

