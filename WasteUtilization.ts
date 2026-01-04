import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface WasteUtilizationAttributes {
  id: string;
  user_id: string;
  foto_url: string;
  jenis: 'KOMPOS' | 'ECO_ENZYME' | 'PAKAN_TERNAK' | 'MEDIA_TANAM' | 'PRAKARYA';
  deskripsi?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  verified_by?: string;
  verified_at?: Date;
  points_awarded: number;
  created_at?: Date;
  updated_at?: Date;
}

export class WasteUtilization extends Model<WasteUtilizationAttributes> implements WasteUtilizationAttributes {
  public id!: string;
  public user_id!: string;
  public foto_url!: string;
  public jenis!: 'KOMPOS' | 'ECO_ENZYME' | 'PAKAN_TERNAK' | 'MEDIA_TANAM' | 'PRAKARYA';
  public deskripsi?: string;
  public status!: 'PENDING' | 'APPROVED' | 'REJECTED';
  public verified_by?: string;
  public verified_at?: Date;
  public points_awarded!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

WasteUtilization.init(
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
    foto_url: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        isUrl: true,
      },
    },
    jenis: {
      type: DataTypes.ENUM('KOMPOS', 'ECO_ENZYME', 'PAKAN_TERNAK', 'MEDIA_TANAM', 'PRAKARYA'),
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 1000],
      },
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'PENDING',
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
    points_awarded: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 50,
      },
    },
  },
  {
    sequelize,
    tableName: 'waste_utilizations',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['jenis'] },
    ],
  }
);

WasteUtilization.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
WasteUtilization.belongsTo(User, { foreignKey: 'verified_by', as: 'verifier' });

