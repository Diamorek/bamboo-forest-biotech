const TOKEN_KEY = 'bfb_token'
const USER_KEY = 'bfb_user'

// JWT 가운데(payload) 부분에서 만료 시각(exp)을 꺼내요. 못 읽으면 null.
function getTokenExpiry(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(base64))
    return payload.exp ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

// 토큰이 없거나 이미 만료됐으면 세션을 지우고 null을 돌려줘요.
// (그래서 만료된 토큰으로 "로그인된 척" 보이다가 요청마다 에러 나는 일이 없어요)
export function getToken() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null

  const expiry = getTokenExpiry(token)
  if (expiry && Date.now() >= expiry) {
    clearSession()
    return null
  }
  return token
}

export function getUser() {
  if (!getToken()) return null
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
