import validator from 'validator';
import { body, ValidationChain } from 'express-validator';

// Email validation
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email) && email.length <= 255;
};

// Password validation
export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password minimal 8 karakter' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password maksimal 128 karakter' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kapital' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung huruf kecil' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password harus mengandung angka' };
  }
  return { valid: true };
};

// NIS validation
export const validateNIS = (nis: string): boolean => {
  return /^[0-9]{8,12}$/.test(nis);
};

// File validation
export const validateFile = (
  file: Express.Multer.File | undefined,
  maxSize: number = 5 * 1024 * 1024, // 5MB default
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']
): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: 'File tidak ditemukan' };
  }

  if (file.size > maxSize) {
    return { valid: false, message: `File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB` };
  }

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, message: 'Format file tidak didukung. Gunakan JPEG, PNG, atau WebP' };
  }

  return { valid: true };
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  return validator.escape(validator.trim(input));
};

// Sanitize text input (allows some HTML)
export const sanitizeText = (input: string): string => {
  return validator.trim(input);
};

// Express validators
export const registerValidator: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email terlalu panjang'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password harus 8-128 karakter')
    .matches(/[A-Z]/)
    .withMessage('Password harus mengandung huruf kapital')
    .matches(/[a-z]/)
    .withMessage('Password harus mengandung huruf kecil')
    .matches(/[0-9]/)
    .withMessage('Password harus mengandung angka'),
  body('nama')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nama harus 2-255 karakter')
    .escape(),
  body('role')
    .isIn(['siswa', 'guru', 'admin', 'sppg'])
    .withMessage('Role tidak valid'),
  body('kelas')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Kelas terlalu panjang')
    .escape(),
  body('nis')
    .optional()
    .matches(/^[0-9]{8,12}$/)
    .withMessage('NIS harus 8-12 digit angka'),
];

export const loginValidator: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password diperlukan'),
];

export const attendanceUploadValidator: ValidationChain[] = [
  body('menuId')
    .optional()
    .isUUID()
    .withMessage('Menu ID tidak valid'),
];

export const reasonSubmitValidator: ValidationChain[] = [
  body('reasonType')
    .isIn(['PORSI_BANYAK', 'RASA_TIDAK_COCOK', 'MENU_TIDAK_DISUKAI', 'KONDISI_KESEHATAN', 'LAINNYA'])
    .withMessage('Tipe alasan tidak valid'),
  body('reasonText')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Alasan terlalu panjang (maksimal 500 karakter)')
    .escape(),
];

