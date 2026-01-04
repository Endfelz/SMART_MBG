import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Menu } from './Menu';

export interface MealAttendanceAttributes {
  id: string;
  user_id: string;
  menu_id?: string;
  foto_url: string;
  foto_thumbnail_url?: string;
  ai_status: 'HABIS' | 'SISA_SEDIKIT' | 'SISA_BANYAK' | 'PENDING_VERIFICATION';
  ai_confidence?: number;
  verified_by?: string;
  verified_at?: Date;
  tanggal: string;
  timestamp?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export class MealAttendance extends Model<MealAttendanceAttributes> implements MealAttendanceAttributes {
  public id!: string;
  public user_id!: string;
  public menu_id?: string;
  public foto_url!: string;
  public foto_thumbnail_url?: string;
  public ai_status!: 'HABIS' | 'SISA_SEDIKIT' | 'SISA_BANYAK' | 'PENDING_VERIFICATION';
  public ai_confidence?: number;
  public verified_by?: string;
  public verified_at?: Date;
  public tanggal!: string;
  public timestamp!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

MealAttendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    menu_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'menus', key: 'id' },
      onDelete: 'SET NULL',
    },
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    foto_thumbnail_url: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        isUrl: true,
      },
    },
    ai_status: {
      type: DataTypes.ENUM('HABIS', 'SISA_SEDIKIT', 'SISA_BANYAK', 'PENDING_VERIFICATION'),
      allowNull: false,
      defaultValue: 'PENDING_VERIFICATION',
    },
    ai_confidence: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 1,
      },
    },
    verified_by: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'meal_attendance',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'tanggal'] }, // 1 siswa = 1 foto per hari
      { fields: ['tanggal'] },
      { fields: ['user_id'] },
      { fields: ['ai_status'] },
    ],
  }
);

MealAttendance.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
MealAttendance.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });
MealAttendance.belongsTo(Menu, { foreignKey: 'menu_id', as: 'menu' });

