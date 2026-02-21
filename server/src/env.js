import dotenv from "dotenv"
dotenv.config()

function toOrigin(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    return url.origin
  } catch {
    return trimmed.replace(/\/+$/, "")
  }
}

const corsOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map(toOrigin)
  .filter(Boolean)

export const ENV = {
  PORT: process.env.PORT || "5000",
  JWT_SECRET: process.env.JWT_SECRET || "dev_secret",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGINS: corsOrigins,
}
