import { useSyncExternalStore } from 'react'

const API_URL = import.meta.env.VITE_API_URL

// 서버 레벨표를 받기 전(또는 실패했을 때) 쓰는 기본값 — 서버와 같은 이름이에요
const DEFAULT_LEVELS = [
  { level: 1, name: '대숲 아기씨', requiredPoints: 0 },
  { level: 2, name: '죽순 쪼꼬미', requiredPoints: 50 },
  { level: 3, name: '대숲 꼬물이', requiredPoints: 150 },
  { level: 4, name: '대나무 새싹', requiredPoints: 350 },
  { level: 5, name: '대숲 수다쟁이', requiredPoints: 700 },
  { level: 6, name: '대숲 단골곰', requiredPoints: 1200 },
  { level: 7, name: '지식 냠냠곰', requiredPoints: 2000 },
  { level: 8, name: '대숲 인기쟁이', requiredPoints: 3200 },
  { level: 9, name: '대숲 지킴이', requiredPoints: 5000 },
  { level: 10, name: '대숲의 주인공', requiredPoints: 8000 },
]

let levels = DEFAULT_LEVELS
let started = false
const listeners = new Set()

// 서버 응답이 배열이든 { levels: [...] }든, 필드 이름이 조금 달라도 받아줘요
function normalize(raw) {
  const list = Array.isArray(raw) ? raw : raw?.levels
  if (!Array.isArray(list)) return null
  const mapped = list
    .map((l) => ({
      level: Number(l.level),
      name: l.name ?? l.levelName,
      requiredPoints: Number(l.requiredPoints ?? l.required_points ?? l.minPoints ?? 0),
      badge: l.badge,
    }))
    .filter((l) => Number.isFinite(l.level) && l.name)
    .sort((a, b) => a.level - b.level)
  return mapped.length ? mapped : null
}

async function loadLevels() {
  try {
    const response = await fetch(`${API_URL}/api/users/levels`)
    if (!response.ok) return
    const next = normalize(await response.json())
    if (!next) return
    levels = next
    listeners.forEach((l) => l())
  } catch {
    // 실패하면 기본 레벨표를 그대로 써요
  }
}

export function getLevelInfo(level) {
  return levels.find((l) => l.level === Number(level)) ?? { level: Number(level), name: `Lv.${level}` }
}

// 1차 출시용 임시 아이콘. 나중에 서버의 badge 키로 실제 이미지를 연결하면 이 함수만 바꾸면 돼요.
export function levelIcon(level) {
  if (level <= 1) return '🌱'
  if (level <= 3) return '🌿'
  if (level <= 6) return '🐼'
  if (level <= 9) return '🐼✨'
  return '👑🐼'
}

function subscribe(listener) {
  listeners.add(listener)
  if (!started) {
    started = true
    loadLevels() // 페이지를 연 뒤 딱 한 번만 받아와요
  }
  return () => listeners.delete(listener)
}

/** 레벨표가 도착하면 다시 그려지도록 구독하는 훅 */
export function useLevels() {
  return useSyncExternalStore(subscribe, () => levels)
}

/** 테스트용 (화면 코드에서는 쓰지 않아요) */
export function resetLevelsStore() {
  levels = DEFAULT_LEVELS
  started = false
  listeners.clear()
}
