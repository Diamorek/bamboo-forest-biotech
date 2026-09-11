/**
 * 대나무숲 로고 아이콘. 이모지(🎋) 대신 사용 — OS/폰트에 따라 깨져 보이는 문제를 없애고
 * currentColor를 써서 어디서든(로그인 화면, 헤더 등) 색을 그대로 물려받습니다.
 */
function BambooIcon({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* 세 개의 대나무 줄기 */}
      <rect x="4" y="10" width="5" height="20" rx="2.5" fill="currentColor" opacity="0.55" />
      <rect x="13.5" y="4" width="5" height="26" rx="2.5" fill="currentColor" />
      <rect x="23" y="8" width="5" height="22" rx="2.5" fill="currentColor" opacity="0.75" />

      {/* 마디(joint) — 배경색으로 얇게 그어 끊긴 것처럼 보이게 */}
      <rect x="4" y="17" width="5" height="1.4" fill="var(--bg)" />
      <rect x="13.5" y="12" width="5" height="1.4" fill="var(--bg)" />
      <rect x="13.5" y="20" width="5" height="1.4" fill="var(--bg)" />
      <rect x="23" y="16" width="5" height="1.4" fill="var(--bg)" />

      {/* 잎 하나 */}
      <path d="M18.5 4C21 2 24 2.5 25.5 4.5C23.5 5.5 20.5 5.5 18.5 4Z" fill="currentColor" />
    </svg>
  )
}

export default BambooIcon
