/**
 * ISO 날짜 문자열(예: "2026-09-23T14:34:21.804Z")을 "n분 전" 같은 상대 시간으로 바꿔줍니다.
 * 이미 "2시간 전"처럼 포맷된 문자열이 들어오면(목업 데이터 등) 그대로 돌려줘요..
 */
export function formatRelativeTime(input) {
  if (!input) return ''

  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return input // 이미 포맷된 문자열이면 그대로

  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (diffSeconds < 0) return '방금 전'
  if (diffSeconds < 60) return '방금 전'
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}분 전`
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}시간 전`
  if (diffSeconds < 7 * 86400) return `${Math.floor(diffSeconds / 86400)}일 전`

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}.${m}.${d}`
}
