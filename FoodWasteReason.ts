import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { MealAttendance } from './MealAttendance';

export interface FoodWasteReasonAttributes {
  id: string;
  attendance_id: string;
  reason_type: 'PORSI_BANYAK' | 'RASA_TIDAK_COCOK' | 'MENU_TIDAK_DISUKAI' | 'KONDISI_KESEHATAN' | 'LAINNYA';
  reason_text?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class FoodWasteReason extends Model<FoodWasteReasonAttributes> implements FoodWasteReasonAttributes {
  public id!: string;
  public attendance_id!: string;
  public reason_type!: 'PORSI_BANYAK' | 'RASA_TIDAK_COCOK' | 'MENU_TIDAK_DISUKAI' | 'KONDISI_KESEHATAN' | 'LAINNYA';
  public reason_text?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

FoodWasteReason.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attendance_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'meal_attendance', key: 'id' },
      onDelete: 'CASCADE',
    },
    reason_type: {
      type: DataTypes.ENUM('PORSI_BANYAK', 'RASA_TIDAK_COCOK', 'MENU_TIDAK_DISUKAI', 'KONDISI_KESEHATAN', 'LAINNYA'),
      allowNull: false,
    },
    reason_text: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
  },
  {
    sequelize,
    tableName: 'food_waste_reasons',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['attendance_id'] },
    ],
  }
);

FoodWasteReason.belongsTo(MealAttendance, { foreignKey: 'attendance_id', as: 'attendance' });

