import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api, clearToken, getToken } from "../api/client"

import ConversationList from "../components/ConversationList.jsx"
import MessageThread from "../components/MessageThread.jsx"
import UserPicker from "../components/UserPicker.jsx"
import ProfileModal from "../components/ProfileModal.jsx"

import "../styles/app.css"

export default function App() {
  const nav = useNavigate()
  const token = useMemo(() => getToken(), [])
  const [me, setMe] = useState(null)

  const [conversations, setConversations] = useState([])
  const [activeConversationId, setActiveConversationId] = useState(null)

  const [showPicker, setShowPicker] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  async function loadMe() {
    const data = await api("/auth/me")
    setMe(data.user)
  }

  async function loadInbox() {
    const data = await api("/conversations")
    setConversations(data.conversations)
    if (!activeConversationId && data.conversations.length) {
      setActiveConversationId(data.conversations[0].id)
    }
  }

  useEffect(() => {
    if (!token) nav("/login")
  }, [token, nav])

  useEffect(() => {
    ;(async () => {
      try {
        await loadMe()
        await loadInbox()
      } catch (e) {
        clearToken()
        nav("/login")
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onLogout() {
    clearToken()
    nav("/login")
  }

  async function onStartChat(userId) {
    const data = await api("/conversations", {
      method: "POST",
      body: JSON.stringify({ userId }),
    })
    await loadInbox()
    setActiveConversationId(data.conversationId)
    setShowPicker(false)
  }

  async function onProfileSaved() {
    await loadMe()
    setShowProfile(false)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">ACE</div>
        <div className="topbar-actions">
          <button className="btn-ghost" onClick={() => setShowPicker(true)}>
            New chat
          </button>
          <button className="btn-ghost" onClick={() => setShowProfile(true)}>
            Profile
          </button>
          <button className="btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="main">
        <aside className="sidebar">
          <ConversationList
            me={me}
            conversations={conversations}
            activeId={activeConversationId}
            onSelect={setActiveConversationId}
            onRefresh={loadInbox}
          />
        </aside>

        <section className="content">
          {activeConversationId ? (
            <MessageThread
              me={me}
              conversationId={activeConversationId}
              onMessageSent={loadInbox}
            />
          ) : (
            <div className="empty">
              <h2>No conversation selected</h2>
              <p className="muted">Start a new chat to begin.</p>
              <button className="btn" onClick={() => setShowPicker(true)}>
                New chat
              </button>
            </div>
          )}
        </section>
      </div>

      {showPicker && (
        <UserPicker onClose={() => setShowPicker(false)} onPick={onStartChat} />
      )}

      {showProfile && me && (
        <ProfileModal
          me={me}
          onClose={() => setShowProfile(false)}
          onSaved={onProfileSaved}
        />
      )}
    </div>
  )
}
