import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { api, setToken } from "../api/client"
import "../styles/auth.css"

export default function Login() {
  const nav = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")

  async function onSubmit(e) {
    e.preventDefault()
    setErr("")
    try {
      const data = await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
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
        <p className="muted">Sign in to your account</p>

        <form onSubmit={onSubmit} className="auth-form">
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
            Login
          </button>
        </form>

        <p className="muted">
          No account? <Link to="/register">Register</Link>
        </p>

        <p className="muted tiny">
          Seed users: alice@ace.com / bob@ace.com / carol@ace.com — Password123!
        </p>
      </div>
    </div>
  )
}
