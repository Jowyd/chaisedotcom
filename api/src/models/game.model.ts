import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { User } from "./user.model";

export class Game extends Model {
  public id!: number;
  public user_id!: number;
  public whitePlayerName!: string;
  public blackPlayerName!: string;
  public isPublic!: boolean;
  public status!:
    | "in_progress"
    | "checkmate"
    | "stalemate"
    | "draw"
    | "surrender";
}

Game.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    whitePlayerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    blackPlayerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM(
        "in_progress",
        "checkmate",
        "stalemate",
        "draw",
        "surrender"
      ),
      defaultValue: "in_progress",
    },
  },
  {
    sequelize,
    modelName: "Game",
    tableName: "games",
  }
);
