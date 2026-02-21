import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api, setToken } from "../api/client"
import "../styles/auth.css"

export default function Register() {
  const nav = useNavigate()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    setErr("")
    try {
      const data = await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ displayName, email, password }),
      })
      setToken(data.token)
      nav("/app")
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>ACE</h1>
        <p className="muted">Create a new account</p>

        <form onSubmit={onSubmit} className="auth-form">
          <label>
            Display name
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </label>

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {err && <div className="error">{err}</div>}

          <button className="btn" type="submit">
            Register
          </button>
        </form>

        <p className="muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}
