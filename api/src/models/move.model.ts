import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import Game from "./game.model";

class Move extends Model {
  public id!: number;
  public game_id!: number;
  public from!: string;
  public to!: string;
  public piece!: string;
  public type!: string;
  public isCheck?: boolean;
  public isCheckmate?: boolean;
  public turn!: string;
}

Move.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    piece: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    to: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCheck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCheckmate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    turn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Move",
    tableName: "moves",
  }
);

Move.belongsTo(Game, { foreignKey: "game_id", as: "game" });
Game.hasMany(Move, {
  sourceKey: "id",
  foreignKey: "game_id",
  as: "moves",
});
export default Move;
