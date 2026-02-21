import React, { useEffect, useRef, useState } from "react"
import { api } from "../api/client"
import "../styles/thread.css"

export default function MessageThread({ me, conversationId, onMessageSent }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState("")
  const [err, setErr] = useState("")
  const bottomRef = useRef(null)

  async function loadMessages() {
    const data = await api(`/conversations/${conversationId}/messages`)
    setMessages(data.messages)
  }

  useEffect(() => {
    setErr("")
    setMessages([])

    let mounted = true

    ;(async () => {
      try {
        await loadMessages()
      } catch (e) {
        if (mounted) setErr(e.message)
      }
    })()

    const t = setInterval(() => {
      loadMessages().catch(() => {})
    }, 3000)

    return () => {
      mounted = false
      clearInterval(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e) {
    e.preventDefault()
    setErr("")
    const body = text.trim()
    if (!body) return

    try {
      await api(`/conversations/${conversationId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      })
      setText("")
      await loadMessages()
      onMessageSent?.()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="thread-wrap">
      <div className="thread-messages">
        {err && <div className="error">{err}</div>}

        {messages.map((m) => {
          const mine = m.senderId === me?.id || m.sender?.id === me?.id
          return (
            <div key={m.id} className={`msg ${mine ? "mine" : ""}`}>
              <div className="msg-bubble">
                <div className="msg-text">{m.body}</div>
                <div className="msg-meta">
                  <span className="muted">
                    {mine ? "You" : m.sender?.displayName || "User"}
                  </span>
                  <span className="muted dot">•</span>
                  <span className="muted">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form className="composer" onSubmit={sendMessage}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button className="btn" type="submit">
          Send
        </button>
      </form>
    </div>
  )
}
