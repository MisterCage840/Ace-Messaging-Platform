import React, { useState } from "react"
import { api } from "../api/client"
import "../styles/modal.css"

export default function ProfileModal({ me, onClose, onSaved }) {
  const [displayName, setDisplayName] = useState(me.displayName || "")
  const [bio, setBio] = useState(me.bio || "")
  const [avatarUrl, setAvatarUrl] = useState(me.avatarUrl || "")
  const [err, setErr] = useState("")

  async function save() {
    setErr("")
    try {
      await api("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ displayName, bio, avatarUrl }),
      })
      onSaved?.()
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Profile</h3>
          <button className="btn-mini" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <label className="field">
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label className="field">
            Bio
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
            />
          </label>

          <label className="field">
            Avatar URL
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />
          </label>

          {err && <div className="error">{err}</div>}

          <div className="modal-actions">
            <button className="btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
