/**
 * 평문 텍스트 안의 http(s):// URL을 찾아 클릭 가능한 <a> 링크로 바꿔줍니다.
 * 나머지 텍스트는 그대로 두고, 줄바꿈은 부모 요소의 white-space: pre-wrap에 맡겨요.
 */
export function linkify(text) {
  if (!text) return null

  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, i) =>
    /^https?:\/\//.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
