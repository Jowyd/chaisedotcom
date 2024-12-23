import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import { User } from "./user.model";
import Move from "./move.model";
import { ChessColor } from "../types";

export enum GameStatus {
  IN_PROGRESS = "in_progress",
  CHECKMATE_WHITE = "checkmate_black",
  CHECKMATE_BLACK = "checkmate_white",
  STALEMATE = "stalemate",
  DRAW = "draw",
  SURRENDER_WHITE = "surrender_white",
  SURRENDER_BLACK = "surrender_black",
  CHECK = "check",
  WON = "won",
  LOST = "lost",

  // 'IN_PROGRESS',      -- Partie en cours
  // 'CHECKMATE_WHITE',  -- Échec et mat - Victoire des blancs
  // 'CHECKMATE_BLACK',  -- Échec et mat - Victoire des noirs
  // 'STALEMATE',        -- Pat
  // 'DRAW_AGREEMENT',   -- Nulle par accord mutuel
  // 'DRAW_50_MOVES',    -- Nulle par la règle des 50 coups
  // 'DRAW_REPETITION',  -- Nulle par triple répétition
  // 'DRAW_DEAD_POSITION', -- Nulle par position morte
  // 'RESIGNED_WHITE',   -- Abandon des blancs
  // 'RESIGNED_BLACK',   -- Abandon des noirs
  // 'TIMEOUT_WHITE',    -- Temps écoulé pour les blancs
  // 'TIMEOUT_BLACK',    -- Temps écoulé pour les noirs
  // 'NO_SHOW_WHITE',    -- Non présentation des blancs
  // 'NO_SHOW_BLACK'     -- Non présentation des noirs
}

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
