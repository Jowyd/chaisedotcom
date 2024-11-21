import dotenv from "dotenv";
dotenv.config();

export const config = {
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || "",
  DB_NAME: process.env.DB_NAME || "",
  DB_USER: process.env.DB_USER || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_PORT: process.env.DB_PORT || "",
  DB_HOST: process.env.DB_HOST || "",
  PORT: process.env.PORT || "",
};
