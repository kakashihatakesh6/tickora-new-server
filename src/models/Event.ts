import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum EventType {
  MOVIE = 'MOVIE',
  SPORT = 'SPORT',
  CONCERT = 'CONCERT',
  PLAY = 'PLAY'
}

interface EventAttributes {
  id: number;
  title: string;
  description: string;
  eventType: EventType;
  city: string;
  venue: string;
  dateTime: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  image_url: string;
  ticketLevel?: string; // Optional for now
  cast?: any;
  crew?: any;
  duration?: string;
  language?: string;
  category?: string; // e.g. 'Cricket', 'Soccer', etc.
  format?: string;
  screenNumber?: string;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> { }

class Event extends Model<EventAttributes, EventCreationAttributes> implements EventAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public eventType!: EventType;
  public city!: string;
  public venue!: string;
  public dateTime!: Date;
  public price!: number;
  public totalSeats!: number;
  public availableSeats!: number;
  public image_url!: string;
  public cast!: any;
  public crew!: any;
  public duration!: string;
  public language!: string;
  public category!: string;
  public format!: string;
  public screenNumber!: string;
  public rating!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Event.init(
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
    eventType: {
      type: DataTypes.ENUM('MOVIE', 'SPORT', 'CONCERT', 'PLAY'),
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
    cast: {
      type: DataTypes.JSON,
      allowNull: true
    },
    crew: {
      type: DataTypes.JSON,
      allowNull: true
    },
    duration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    language: {
      type: DataTypes.STRING,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    format: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: '2D'
    },
    screenNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'AUDI 1'
    },
    rating: {
      type: DataTypes.FLOAT,
      allowNull: true
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
    tableName: 'events',
    paranoid: false,
    timestamps: true,
    indexes: [
      {
        fields: ['city']
      },
      {
        fields: ['eventType']
      }
    ]
  }
);

export default Event;
