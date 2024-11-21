import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database"; // Connexion à la base de données
import { FigureType } from "../enums/figureType.enum";
import { Game } from "./game.model";

export interface MoveAttributes {
    id?: number;
    gameId: number;
    figure: FigureType;
    position: string;
    timestamp: Date;
}

export class Move
    extends Model<MoveAttributes>
    implements MoveAttributes {
    public id?: number;
    public gameId!: number;
    public figure!: FigureType;
    public position!: string;
    public timestamp!: Date;
}

Move.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        figure: {
            type: DataTypes.ENUM,
            allowNull: false,
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "Author",
    }
);

Move.belongsTo(Game, { foreignKey: "gameId", as: "game" });