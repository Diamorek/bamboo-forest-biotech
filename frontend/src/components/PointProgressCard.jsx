import { levelIcon } from '../utils/levels'
import './Level.css'

/**
 * 현재 포인트와 다음 레벨까지의 진행률. 서버가 준 값을 보여주기만 해요
 * (프론트에서 점수를 더하거나 레벨을 바꾸지 않아요).
 */
function PointProgressCard({ totalPoints = 0, level = 1, levelName, nextLevel = null, progress = 0 }) {
  const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0))

  return (
    <section className="point-card" aria-label="나의 대나무숲 성장 정보">
      <div className="point-card__header">
        <div>
          <p className="point-card__eyebrow">🌱 나의 대나무숲 성장일지</p>
          <h2>{levelName}</h2>
          <p className="point-card__points">
            Lv.{level} · {Number(totalPoints).toLocaleString()}점
          </p>
        </div>

        <div className="point-card__mascot" aria-hidden="true">
          {levelIcon(level)}
        </div>
      </div>

      <div
        className="point-card__track"
        role="progressbar"
        aria-label="다음 레벨 진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeProgress}
      >
        <div className="point-card__fill" style={{ width: `${safeProgress}%` }} />
      </div>

      {nextLevel ? (
        <p className="point-card__next">
          다음 계급은 <strong>{nextLevel.name}</strong>!
          <br />
          {Number(nextLevel.remainingPoints).toLocaleString()}점만 더 모으면 돼요 💚
        </p>
      ) : (
        <p className="point-card__next">대숲의 주인공이 되었어요! 🎉</p>
      )}
    </section>
  )
}

export default PointProgressCard
