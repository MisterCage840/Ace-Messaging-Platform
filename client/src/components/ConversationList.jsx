import React from "react"
import "../styles/sidebar.css"

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  onRefresh,
}) {
  return (
    <div className="sidebar-wrap">
      <div className="sidebar-header">
        <h3>Inbox</h3>
        <button className="btn-mini" onClick={onRefresh}>
          ↻
        </button>
      </div>

      <div className="convo-list">
        {conversations.map((c) => (
          <button
            key={c.id}
            className={`convo-item ${c.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <div className="avatar">
              {c.otherUser?.avatarUrl ? (
                <img src={c.otherUser.avatarUrl} alt="" />
              ) : (
                <span>
                  {(c.otherUser?.displayName || "?").slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div className="convo-meta">
              <div className="convo-title">
                {c.otherUser?.displayName || "Unknown"}
              </div>
              <div className="convo-sub">
                {c.lastMessage ? (
                  c.lastMessage.body
                ) : (
                  <span className="muted">No messages yet</span>
                )}
              </div>
            </div>
          </button>
        ))}

        {!conversations.length && (
          <div className="sidebar-empty muted">No conversations yet.</div>
        )}
      </div>
    </div>
  )
}
