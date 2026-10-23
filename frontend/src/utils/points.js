import { useSyncExternalStore } from 'react'
import { getToken } from './auth'

const API_URL = import.meta.env.VITE_API_URL

// ── 레벨업 팝업 ─────────────────────────────────────────────
// 글/댓글 작성, 방문 응답의 points 를 reportPoints() 로 넘기면 레벨업일 때만 팝업이 떠요.
let levelUp = null
const shownEvents = new Set() // API 재시도로 같은 레벨업이 두 번 오더라도 한 번만 보여주기
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function reportPoints(points) {
  if (!points || points.awarded !== true || points.leveledUp !== true) return

  const eventKey = `${points.previousLevel}->${points.level}`
  if (shownEvents.has(eventKey)) return
  shownEvents.add(eventKey)

  levelUp = { level: points.level, levelName: points.levelName, badge: points.badge }
  emit()
}

export function dismissLevelUp() {
  levelUp = null
  emit()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useLevelUp() {
  return useSyncExternalStore(subscribe, () => levelUp)
}

// ── 하루 첫 방문 기록 ───────────────────────────────────────
// 앱을 열 때, 로그인·가입 직후에 부르면 돼요. 서버가 하루 1회만 지급하니 여러 번 불러도 괜찮아요.
export async function registerVisit() {
  const token = getToken()
  if (!token) return

  try {
    const response = await fetch(`${API_URL}/api/users/me/visit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) return
    const data = await response.json()
    reportPoints(data.points)
  } catch {
    // 방문 기록 실패는 사용자에게 보여줄 필요 없어요
  }
}

// ── 내 포인트 / 활동 내역 ───────────────────────────────────
async function authedGet(path) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  let data = {}
  try {
    data = await response.json()
  } catch {
    throw new Error('서버 응답을 받지 못했어요.')
  }
  if (!response.ok) throw new Error(data.message || data.error || '불러오지 못했어요.')
  return data
}

export const fetchMyPoints = () => authedGet('/api/users/me/points')
export const fetchPointHistory = (limit = 20) => authedGet(`/api/users/me/points/history?limit=${limit}`)

/** 테스트용 (화면 코드에서는 쓰지 않아요) */
export function resetPointsStore() {
  levelUp = null
  shownEvents.clear()
  listeners.clear()
}
