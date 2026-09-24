const TOKEN_KEY = 'bfb_token'
const USER_KEY = 'bfb_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setSession(user, token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function updateCachedUser(partialUser) {
  const current = getUser() || {}
  const merged = { ...current, ...partialUser }
  localStorage.setItem(USER_KEY, JSON.stringify(merged))
  return merged
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAdmin() {
  const user = getUser()
  return user?.role === 'admin' || user?.isAdmin === true
}
