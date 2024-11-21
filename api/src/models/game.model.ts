import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database"; // Connexion à la base de données
import { GameStatus } from "../enums/gameStatus.enum";

export interface GameAttributes {
    id?: number;
    userId: number;
    status: GameStatus;
    winner: string;
    blackPlayer: string;
    whitePlayer: string;

}

export class Game
    extends Model<GameAttributes>
    implements GameAttributes {
    public id?: number;
    public userId!: number;
    public status!: GameStatus;
    public winner!: string;
    public blackPlayer!: string;
    public whitePlayer!: string;
}

Game.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM,
            allowNull: false,
        },
        winner: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        blackPlayer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        whitePlayer: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Author",
    }
);