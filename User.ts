import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserAttributes {
  id: string;
  email: string;
  password_hash: string;
  role: 'siswa' | 'guru' | 'admin' | 'sppg';
  nama: string;
  kelas?: string;
  nis?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public password_hash!: string;
  public role!: 'siswa' | 'guru' | 'admin' | 'sppg';
  public nama!: string;
  public kelas?: string;
  public nis?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Instance method to verify password
  public async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  // Instance method to get public data (without password)
  public toJSON() {
    const values = { ...this.get() };
    delete (values as any).password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        len: [5, 255],
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('siswa', 'guru', 'admin', 'sppg'),
      allowNull: false,
      validate: {
        isIn: [['siswa', 'guru', 'admin', 'sppg']],
      },
    },
    nama: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
      },
    },
    kelas: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        len: [0, 50],
      },
    },
    nis: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      validate: {
        len: [8, 12],
        isNumeric: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['nis'] },
    ],
  }
);

