import { useSyncExternalStore } from 'react'

const API_URL = import.meta.env.VITE_API_URL
const SEEN_KEY = 'bfb_last_seen_post_id'
const POLL_MS = 60_000

// 여러 컴포넌트(상단 탭, 게시판 목록)가 같은 숫자를 보도록, 한 곳에서만 서버에 물어보는 작은 저장소예요.
let newCount = 0
let requestSeq = 0
let timer = null
const listeners = new Set()

function setNewCount(n) {
  if (n === newCount) return
  newCount = n
  listeners.forEach((l) => l())
}

// "마지막으로 본 글 번호" — 이 브라우저에만 저장돼요
export function getLastSeenId() {
  try {
    const v = localStorage.getItem(SEEN_KEY)
    return v == null ? null : Number(v)
  } catch {
    return null
  }
}

function setLastSeenId(id) {
  try {
    localStorage.setItem(SEEN_KEY, String(id))
  } catch {
    // 저장이 막힌 환경이면 그냥 넘어가요
  }
}

// 서버에 "내가 본 글 이후로 새 글이 몇 개야?" 물어보기
export async function refreshNewPosts() {
  const mine = ++requestSeq // 가장 마지막에 보낸 요청의 응답만 쓰기 위한 번호표
  try {
    const since = getLastSeenId()
    const qs = since != null ? `?sinceId=${since}` : ''
    const response = await fetch(`${API_URL}/api/posts/stats${qs}`)
    if (!response.ok) return
    const data = await response.json()

    if (mine !== requestSeq) return // 그 사이 더 새 요청이 나갔으면 이 응답은 버려요
    if (typeof data.latestId !== 'number') return // 서버가 아직 이 기능을 모르면 조용히 무시

    if (since == null) {
      // 처음 온 사람: 이미 있는 글을 전부 "새 글"로 보여주면 이상하니까 지금 시점을 기준으로 삼아요
      setLastSeenId(data.latestId)
      setNewCount(0)
    } else {
      setNewCount(Number(data.newCount) || 0)
    }
  } catch {
    // 네트워크 오류, 서버가 JSON이 아닌 응답을 준 경우 등 → 표시만 안 하고 조용히 넘어가요
  }
}

// 사용자에게 글 목록을 실제로 보여준 직후에 부르기 → 거기까지 읽은 걸로 처리
export function markPostsSeen(maxId) {
  if (typeof maxId !== 'number' || !(maxId > 0)) return
  const current = getLastSeenId()
  if (current == null || maxId > current) setLastSeenId(maxId)
  refreshNewPosts()
}

const onVisible = () => {
  if (document.visibilityState === 'visible') refreshNewPosts()
}

function start() {
  if (timer) return
  refreshNewPosts()
  // 화면이 보이는 동안에만 1분마다 확인 (탭이 숨겨져 있으면 서버를 안 괴롭혀요)
  timer = setInterval(onVisible, POLL_MS)
  document.addEventListener('visibilitychange', onVisible)
}

function stop() {
  clearInterval(timer)
  timer = null
  document.removeEventListener('visibilitychange', onVisible)
}

function subscribe(listener) {
  listeners.add(listener)
  if (listeners.size === 1) start()
  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) stop()
  }
}

/** 지금 읽지 않은 새 글 개수 (0이면 표시 안 함) */
export function useNewPostsCount() {
  return useSyncExternalStore(subscribe, () => newCount)
}

/** 테스트용: 저장소 상태를 처음으로 되돌려요 (화면 코드에서는 쓰지 않아요) */
export function resetNewPostsStore() {
  stop()
  listeners.clear()
  newCount = 0
  requestSeq = 0
}
