import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  process.env.DB_NAME || "chaisedotcom",
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "password",
  {
    dialect: "mariadb",
    database: process.env.DB_NAME || "chaisedotcom",
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    host: process.env.DB_HOST || "localhost",
    define: {
      timestamps: false,
    },
  }
);

export default sequelize;
