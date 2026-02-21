import jwt from "jsonwebtoken"
import { ENV } from "../env.js"

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ error: "Missing token" })
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}
