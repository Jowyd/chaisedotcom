import { Sequelize } from "sequelize";
import { config } from "./variables";
const sequelize = new Sequelize(
  config.DB_NAME || "chaisedotcom",
  config.DB_USER || "root",
  config.DB_PASSWORD || "password",
  {
    dialect: "mariadb",
    database: config.DB_NAME || "chaisedotcom",
    port: config.DB_PORT ? parseInt(config.DB_PORT) : 3306,
    host: config.DB_HOST || "localhost",
    define: {
      timestamps: false,
    },
  }
);

export default sequelize;
