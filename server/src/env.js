import dotenv from "dotenv"
dotenv.config()

export const ENV = {
  PORT: process.env.PORT || "5000",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
}
