import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum EventType {
  MOVIE = 'MOVIE',
  SPORT = 'SPORT',
  CONCERT = 'CONCERT'
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
  imageURL: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface EventCreationAttributes extends Optional<EventAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

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
  public imageURL!: string;
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
      type: DataTypes.ENUM('MOVIE', 'SPORT', 'CONCERT'),
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
    imageURL: {
      type: DataTypes.STRING,
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
