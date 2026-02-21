import React, { useEffect, useState } from "react"
import { api } from "../api/client"
import "../styles/modal.css"

export default function UserPicker({ onClose, onPick }) {
  const [q, setQ] = useState("")
  const [users, setUsers] = useState([])
  const [err, setErr] = useState("")

  async function search() {
    setErr("")
    try {
      const data = await api(`/users?q=${encodeURIComponent(q)}`)
      setUsers(data.users)
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => {
    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>New chat</h3>
          <button className="btn-mini" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="row">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search users…"
            />
            <button className="btn" onClick={search}>
              Search
            </button>
          </div>

          {err && <div className="error">{err}</div>}

          <div className="pick-list">
            {users.map((u) => (
              <button
                key={u.id}
                className="pick-item"
                onClick={() => onPick(u.id)}
              >
                <div className="avatar sm">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt="" />
                  ) : (
                    <span>{u.displayName[0]}</span>
                  )}
                </div>
                <div className="pick-meta">
                  <div className="pick-title">{u.displayName}</div>
                  <div className="pick-sub muted">{u.email}</div>
                </div>
              </button>
            ))}

            {!users.length && <div className="muted">No users found.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
