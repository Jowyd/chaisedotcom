import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { Game } from "./game.model";

class Move extends Model {
  public id!: number;
  public gameId!: number;
  public fromSquare!: string;
  public toSquare!: string;
  public piece!: string;
  public isCapture?: boolean;
  public isPromotion?: boolean;
  public isCheck?: boolean;
  public isCheckmate?: boolean;
}

Move.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fromSquare: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    toSquare: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    piece: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCapture: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isPromotion: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCheck: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCheckmate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Move",
  }
);

Move.belongsTo(Game, { foreignKey: "gameId" });

export default Move;
