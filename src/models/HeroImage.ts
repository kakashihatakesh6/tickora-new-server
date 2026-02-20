import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface HeroImageAttributes {
    id: number;
    imageUrl: string;
    title?: string;
    description?: string;
    active: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

interface HeroImageCreationAttributes extends Optional<HeroImageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'title' | 'description' | 'active'> { }

class HeroImage extends Model<HeroImageAttributes, HeroImageCreationAttributes> implements HeroImageAttributes {
    public id!: number;
    public imageUrl!: string;
    public title?: string;
    public description?: string;
    public active!: boolean;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

HeroImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
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
        tableName: 'hero_images',
        timestamps: true
    }
);

export default HeroImage;
