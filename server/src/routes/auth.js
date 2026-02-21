import express from "express"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { prisma } from "../prisma.js"
import { ENV } from "../env.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN,
  })
}

router.post("/register", async (req, res) => {
  const { email, password, displayName } = req.body || {}

  if (!email || !password || !displayName) {
    return res
      .status(400)
      .json({ error: "email, password, displayName required" })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: "Email already in use" })

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { email, passwordHash, displayName },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  })

  const token = signToken(user)
  res.json({ token, user })
})

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password)
    return res.status(400).json({ error: "email, password required" })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ error: "Invalid credentials" })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return res.status(401).json({ error: "Invalid credentials" })

  const token = signToken(user)

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
    },
  })
})

router.get("/me", requireAuth, async (req, res) => {
  const me = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  res.json({ user: me })
})

export default router
