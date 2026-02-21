import express from "express"
import { prisma } from "../prisma.js"
import { requireAuth } from "../middleware/auth.js"

const router = express.Router()

// Create or get 1:1 conversation between me and another user
router.post("/", requireAuth, async (req, res) => {
  const { userId } = req.body || {}
  if (!userId) return res.status(400).json({ error: "userId required" })
  if (userId === req.user.id)
    return res.status(400).json({ error: "Cannot message yourself" })

  const other = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  })
  if (!other) return res.status(404).json({ error: "User not found" })

  // Find existing conversation that contains both participants
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: {
        every: {
          OR: [{ userId: req.user.id }, { userId }],
        },
      },
    },
    include: { participants: true },
  })

  // The "every OR" trick can match convos with extra participants in some DBs;
  // safest: check candidate conversations that contain both and have exactly 2 participants.
  const candidates = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { userId: req.user.id },
      },
    },
    include: {
      participants: true,
    },
  })

  const exact = candidates.find(
    (c) =>
      c.participants.length === 2 &&
      c.participants.some((p) => p.userId === req.user.id) &&
      c.participants.some((p) => p.userId === userId),
  )

  if (exact) return res.json({ conversationId: exact.id })

  const convo = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: req.user.id }, { userId }],
      },
    },
    select: { id: true },
  })

  res.json({ conversationId: convo.id })
})

// List my conversations (inbox) with last message + other participant
router.get("/", requireAuth, async (req, res) => {
  const convos = await prisma.conversation.findMany({
    where: { participants: { some: { userId: req.user.id } } },
    orderBy: { createdAt: "desc" },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
              email: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, displayName: true } } },
      },
    },
  })

  const mapped = convos.map((c) => {
    const other =
      c.participants.find((p) => p.userId !== req.user.id)?.user || null
    const last = c.messages[0] || null
    return {
      id: c.id,
      otherUser: other,
      lastMessage: last
        ? {
            id: last.id,
            body: last.body,
            createdAt: last.createdAt,
            sender: last.sender,
          }
        : null,
    }
  })

  res.json({ conversations: mapped })
})

// Get messages (simple pagination via cursor)
router.get("/:id/messages", requireAuth, async (req, res) => {
  const conversationId = req.params.id

  const isParticipant = await prisma.participant.findUnique({
    where: { userId_conversationId: { userId: req.user.id, conversationId } },
  })
  if (!isParticipant) return res.status(403).json({ error: "Not allowed" })

  const cursor = req.query.cursor ? req.query.cursor.toString() : null

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    ...(cursor
      ? {
          cursor: { id: cursor },
          skip: 1,
        }
      : {}),
    take: 50,
    include: {
      sender: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  })

  res.json({ messages })
})

// Send message
router.post("/:id/messages", requireAuth, async (req, res) => {
  const conversationId = req.params.id
  const { body } = req.body || {}
  if (!body || !body.trim())
    return res.status(400).json({ error: "Message body required" })

  const isParticipant = await prisma.participant.findUnique({
    where: { userId_conversationId: { userId: req.user.id, conversationId } },
  })
  if (!isParticipant) return res.status(403).json({ error: "Not allowed" })

  const msg = await prisma.message.create({
    data: {
      conversationId,
      senderId: req.user.id,
      body: body.trim(),
    },
    include: {
      sender: { select: { id: true, displayName: true, avatarUrl: true } },
    },
  })

  res.status(201).json({ message: msg })
})

export default router
