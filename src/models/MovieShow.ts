import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MovieShowAttributes {
  id: number;
  movieId: number;
  venue: string;
  city: string;
  screenNumber: string;
  dateTime: Date;
  price: number;
  totalSeats: number;
  availableSeats: number;
  format: string; // '2D', '3D', 'IMAX', etc.
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface MovieShowCreationAttributes extends Optional<MovieShowAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class MovieShow extends Model<MovieShowAttributes, MovieShowCreationAttributes> implements MovieShowAttributes {
  public id!: number;
  public movieId!: number;
  public venue!: string;
  public city!: string;
  public screenNumber!: string;
  public dateTime!: Date;
  public price!: number;
  public totalSeats!: number;
  public availableSeats!: number;
  public format!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

MovieShow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    movieId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'movies',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    venue: {
      type: DataTypes.STRING,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    screenNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'AUDI 1'
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
    format: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '2D'
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
    tableName: 'movie_shows',
    paranoid: false,
    timestamps: true,
    indexes: [
      {
        fields: ['movieId']
      },
      {
        fields: ['city']
      },
      {
        fields: ['dateTime']
      }
    ]
  }
);

export default MovieShow;
