import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database"; // Connexion à la base de données
import { allow } from "joi";
import bcrypt from "bcrypt";
import Game from "./game.model";

export interface UserAttributes {
  id?: number;
  username: string;
  password: string;
  created_at?: Date;
  public_profile?: boolean;
  show_game_history?: boolean;
  games?: Game[];
}

export class User extends Model<UserAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password!: string;
  public readonly created_at!: Date;
  public public_profile!: boolean;
  public show_game_history!: boolean;
  public games?: Game[];

  public async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(value: string) {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(value, salt);
        this.setDataValue("password", hash);
      },
    },
    created_at: {
      type: DataTypes.TIME,
      defaultValue: DataTypes.NOW,
    },
    public_profile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    show_game_history: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "users",
    tableName: "users",
  }
);
