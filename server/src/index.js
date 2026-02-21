import express from "express"
import cors from "cors"
import morgan from "morgan"
import { ENV } from "./env.js"

import authRoutes from "./routes/auth.js"
import usersRoutes from "./routes/users.js"
import conversationsRoutes from "./routes/conversations.js"

const app = express()

app.use(morgan("dev"))
app.use(express.json())

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (ENV.CORS_ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error(`Origin not allowed by CORS: ${origin}`))
    },
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

app.get("/", (req, res) => res.json({ ok: true, app: "ACE API" }))

app.use("/auth", authRoutes)
app.use("/users", usersRoutes)
app.use("/conversations", conversationsRoutes)

app.use((req, res) => res.status(404).json({ error: "Not found" }))

app.listen(Number(ENV.PORT), () => {
  console.log(`ACE server running on http://localhost:${ENV.PORT}`)
})
