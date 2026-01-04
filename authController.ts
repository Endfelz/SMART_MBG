import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: errors.array(),
      });
    }

    const { email, password, nama, role, kelas, nis } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    // Check if NIS already exists (for siswa)
    if (role === 'siswa' && nis) {
      const existingNIS = await User.findOne({ where: { nis } });
      if (existingNIS) {
        return res.status(409).json({ error: 'NIS sudah terdaftar' });
      }
    }

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      nama: nama.trim(),
      role,
      kelas: role === 'siswa' ? kelas?.trim() : null,
      nis: role === 'siswa' && nis ? nis.trim() : null,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'Registrasi berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        kelas: user.kelas,
      },
    });
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ 
        error: 'Data sudah ada',
        message: 'Email atau NIS sudah terdaftar',
      });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validasi gagal',
        details: errors.array(),
      });
    }

    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ 
      where: { email: email.toLowerCase().trim() },
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Email atau password salah',
        message: 'Kredensial tidak valid',
      });
    }

    // Verify password
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ 
        error: 'Email atau password salah',
        message: 'Kredensial tidak valid',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        kelas: user.kelas,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.user!.userId, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

