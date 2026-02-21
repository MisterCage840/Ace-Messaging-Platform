import express from "express"
import { prisma } from "../prisma.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

router.get("/", requireAuth, async (req, res) => {
  const q = (req.query.q || "").toString().trim()

  const users = await prisma.user.findMany({
    where: {
      id: { not: req.user.id },
      ...(q
        ? {
            OR: [
              { displayName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
    take: 25,
  })

  res.json({ users })
})

router.get("/:id", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
      createdAt: true,
    },
  })
  if (!user) return res.status(404).json({ error: "User not found" })
  res.json({ user })
})

router.patch("/me", requireAuth, async (req, res) => {
  const { displayName, bio, avatarUrl } = req.body || {}

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      ...(displayName !== undefined ? { displayName } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      bio: true,
      avatarUrl: true,
    },
  })

  res.json({ user: updated })
})

export default router
