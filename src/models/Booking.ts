import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type User from './User';

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  FAILED = 'FAILED'
}

export enum BookingType {
  MOVIE = 'MOVIE',
  SPORT = 'SPORT',
  EVENT = 'EVENT'
}

interface BookingAttributes {
  id: number;
  userId: number;
  eventId: number; // ID of Movie, Sport, or Event
  bookingType: BookingType; // Discriminator
  seatCount: number;
  seatNumbers: string[]; 
  totalAmount: number;
  status: BookingStatus;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'razorpayPaymentId' | 'status' | 'createdAt' | 'updatedAt' | 'seatNumbers'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public bookingType!: BookingType;
  public seatCount!: number;
  public seatNumbers!: string[];
  public totalAmount!: number;
  public status!: BookingStatus;
  public razorpayOrderId!: string;
  public razorpayPaymentId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly user?: User;
  // Dynamic association handling will be needed in controllers/services
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false
      // Removed foreign key constraint to 'events' table
    },
    bookingType: {
      type: DataTypes.ENUM('MOVIE', 'SPORT', 'EVENT'),
      allowNull: false,
      defaultValue: BookingType.EVENT
    },
    seatCount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seatNumbers: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'),
      allowNull: false,
      defaultValue: BookingStatus.PENDING
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpayPaymentId: {
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
    }
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true
  }
);

export default Booking;
