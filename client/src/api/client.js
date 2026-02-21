const API_URL = import.meta.env.VITE_API_URL

export function getToken() {
  return localStorage.getItem("ace_token")
}

export function setToken(token) {
  localStorage.setItem("ace_token", token)
}

export function clearToken() {
  localStorage.removeItem("ace_token")
}

export async function api(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = data?.error || "Request failed"
    throw new Error(msg)
  }
  return data
}
