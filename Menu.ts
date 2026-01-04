import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export interface MenuAttributes {
  id: string;
  nama_menu: string;
  tanggal: string;
  deskripsi?: string;
  created_at?: Date;
  updated_at?: Date;
}

export class Menu extends Model<MenuAttributes> implements MenuAttributes {
  public id!: string;
  public nama_menu!: string;
  public tanggal!: string;
  public deskripsi?: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Menu.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nama_menu: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    tanggal: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'menus',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['tanggal'] },
    ],
  }
);

