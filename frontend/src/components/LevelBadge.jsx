import { getLevelInfo, levelIcon, useLevels } from '../utils/levels'
import './Level.css'

/**
 * 닉네임 옆에 붙는 계급 배지.
 * level 이 없거나(삭제된 댓글 등) 1 미만이면 아무것도 그리지 않아요.
 * compact: 목록처럼 좁은 곳용(아이콘 + Lv.숫자), 기본: 아이콘 + 레벨 + 계급 이름
 */
function LevelBadge({ level, name, badge, compact = false }) {
  useLevels() // 서버 레벨표가 도착하면 이름이 채워지도록 구독

  const lv = Number(level)
  if (level == null || !Number.isFinite(lv) || lv < 1) return null

  const levelName = name ?? getLevelInfo(lv).name

  return (
    <span
      className={`level-badge ${compact ? 'compact' : ''}`}
      title={`${levelName} · Lv.${lv}`}
      data-badge={badge ?? undefined}
    >
      <span className="level-badge__icon" aria-hidden="true">
        {levelIcon(lv)}
      </span>
      {compact ? (
        <span className="level-badge__lv" aria-hidden="true">Lv.{lv}</span>
      ) : (
        <span className="level-badge__text" aria-hidden="true">
          <span className="level-badge__level">Lv.{lv}</span>
          <span className="level-badge__name">{levelName}</span>
        </span>
      )}
      <span className="sr-only">{levelName} 레벨 {lv}</span>
    </span>
  )
}

export default LevelBadge
