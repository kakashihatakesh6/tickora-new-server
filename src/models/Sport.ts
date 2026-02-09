import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface SportAttributes {
  id: number;
  title: string;
  description: string;
  category: string; // 'Cricket', 'Soccer', etc.
  city: string;
  venue: string;
  dateTime: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image_url: string;
  duration?: string;
  rating?: number;
  // Enhanced fields for detailed event pages
  team1?: string;
  team2?: string;
  team1_flag?: string;
  team2_flag?: string;
  event_logo?: string;
  important_info?: string;
  you_should_know?: string[];
  terms_conditions?: string;
  interested_count?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface SportCreationAttributes extends Optional<SportAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Sport extends Model<SportAttributes, SportCreationAttributes> implements SportAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public category!: string;
  public city!: string;
  public venue!: string;
  public dateTime!: Date;
  public price!: number;
  public totalSeats!: number;
  public availableSeats!: number;
  public image_url!: string;
  public duration!: string;
  public rating!: number;
  public team1?: string;
  public team2?: string;
  public team1_flag?: string;
  public team2_flag?: string;
  public event_logo?: string;
  public important_info?: string;
  public you_should_know?: string[];
  public terms_conditions?: string;
  public interested_count?: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Sport.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING, // e.g., 'Cricket', 'Soccer'
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateTime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    availableSeats: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    team1: {
      type: DataTypes.STRING,
      allowNull: true
    },
    team2: {
      type: DataTypes.STRING,
      allowNull: true
    },
    team1_flag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    team2_flag: {
      type: DataTypes.STRING,
      allowNull: true
    },
    event_logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    important_info: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    you_should_know: {
      type: DataTypes.JSON,
      allowNull: true
    },
    terms_conditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    interested_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'sports',
    paranoid: false,
    timestamps: true,
    indexes: [
      {
        fields: ['city']
      },
      {
        fields: ['category']
      }
    ]
  }
);

export default Sport;
