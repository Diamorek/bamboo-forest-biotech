import { useSyncExternalStore } from 'react'

// 개인정보 처리방침 팝업을 어디서든(가입 화면, 하단 링크) 열고 닫을 수 있게 하는 작은 저장소예요.
// 화면을 이동하지 않고 팝업으로 여는 이유: 가입 중에 열어도 입력하던 내용이 지워지지 않게 하려고요.
let open = false
const listeners = new Set()

function emit() {
  listeners.forEach((l) => l())
}

export function openPrivacyPolicy() {
  open = true
  emit()
}

export function closePrivacyPolicy() {
  open = false
  emit()
}

function subscribe(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePrivacyOpen() {
  return useSyncExternalStore(subscribe, () => open)
}

/** 테스트용 (화면 코드에서는 쓰지 않아요) */
export function resetPrivacyStore() {
  open = false
  listeners.clear()
}
