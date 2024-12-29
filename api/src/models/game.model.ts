import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { User } from "./user.model";
import Move from "./move.model";
import { ChessColor } from "../types";
import { GameStatus } from "../enums/gameStatus.enum";

export class Game extends Model {
  public id!: number;
  public user_id!: number;
  public opponentName!: string;
  public opponentColor!: ChessColor;
  public isPublic!: boolean;
  public result!: number | null;
  public status!: GameStatus;
  public readonly created_at!: Date;
  public moves!: Move[];
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
    opponentName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    opponentColor: {
      type: DataTypes.ENUM("WHITE", "BLACK"),
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    result: {
      // THIS IS THE NUMBER OF ELO POINTS WON OR LOST
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM(
        "in_progress",
        "checkmate",
        "stalemate",
        "draw",
        "surrender",
        "check"
      ),
      defaultValue: "in_progress",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Game",
    tableName: "games",
  }
);

Game.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasMany(Game, {
  sourceKey: "id",
  foreignKey: "user_id",
  as: "games",
});
export default Game;
