import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

export interface PointsAttributes {
  id: string;
  user_id: string;
  attendance_id?: string;
  waste_utilization_id?: string;
  points: number;
  type: 'MEAL_HABIS' | 'MEAL_TIDAK_HABIS' | 'WASTE_UTILIZATION';
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Points extends Model<PointsAttributes> implements PointsAttributes {
  public id!: string;
  public user_id!: string;
  public attendance_id?: string;
  public waste_utilization_id?: string;
  public points!: number;
  public type!: 'MEAL_HABIS' | 'MEAL_TIDAK_HABIS' | 'WASTE_UTILIZATION';
  public description?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Points.init(
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
    attendance_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    waste_utilization_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: -100,
        max: 100,
      },
    },
    type: {
      type: DataTypes.ENUM('MEAL_HABIS', 'MEAL_TIDAK_HABIS', 'WASTE_UTILIZATION'),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'points',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['type'] },
      { fields: ['created_at'] },
    ],
  }
);

Points.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

