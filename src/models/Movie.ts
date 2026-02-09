import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MovieAttributes {
  id: number;
  title: string;
  description: string;
  image_url: string;
  duration?: string;
  language?: string;
  rating?: number;
  cast?: any;
  crew?: any;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

interface MovieCreationAttributes extends Optional<MovieAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

class Movie extends Model<MovieAttributes, MovieCreationAttributes> implements MovieAttributes {
  public id!: number;
  public title!: string;
  public description!: string;
  public image_url!: string;
  public duration!: string;
  public language!: string;
  public rating!: number;
  public cast!: any;
  public crew!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt!: Date | null;
}

Movie.init(
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
    image_url: {
      type: DataTypes.STRING,
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
    rating: {
      type: DataTypes.FLOAT,
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
    tableName: 'movies',
    paranoid: false,
    timestamps: true,
    indexes: [
      {
        fields: ['title']
      }
    ]
  }
);

export default Movie;
