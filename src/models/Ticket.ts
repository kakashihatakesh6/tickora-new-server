import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import type Booking from './Booking';

interface TicketAttributes {
  id: number;
  bookingId: number;
  uniqueCode: string;
  details: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TicketCreationAttributes extends Optional<TicketAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Ticket extends Model<TicketAttributes, TicketCreationAttributes> implements TicketAttributes {
  public id!: number;
  public bookingId!: number;
  public uniqueCode!: string;
  public details!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public readonly booking?: Booking;
}

Ticket.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    uniqueCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    details: {
      type: DataTypes.TEXT,
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
    tableName: 'tickets',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['uniqueCode']
      }
    ]
  }
);

// Associations are defined in models/index.ts

export default Ticket;
