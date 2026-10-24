import { useEffect } from 'react'
import { dismissLevelUp, useLevelUp } from '../utils/points'
import { getLevelInfo, levelIcon, useLevels } from '../utils/levels'
import './Level.css'

/** 레벨업했을 때 뜨는 축하 팝업. App에 한 번만 넣어두면 어디서든 떠요. */
function LevelUpModal() {
  const levelUp = useLevelUp()
  useLevels()

  useEffect(() => {
    if (!levelUp) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') dismissLevelUp()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [levelUp])

  if (!levelUp) return null

  const levelName = levelUp.levelName || getLevelInfo(levelUp.level).name

  return (
    <div className="levelup-overlay" onClick={dismissLevelUp}>
      <div
        className="levelup-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="levelup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="levelup-modal__icon" aria-hidden="true">
          {levelIcon(levelUp.level)}
        </div>
        <h2 id="levelup-title">우와! 쑥 자랐어요!</h2>
        <p>새로운 계급을 획득했어요.</p>
        <p className="levelup-modal__rank">
          Lv.{levelUp.level} {levelName}
        </p>
        <p className="levelup-modal__hint">대숲에서 더 많은 이야기를 나눠봐요 🌿</p>
        <button type="button" className="btn-primary" onClick={dismissLevelUp}>
          좋아요!
        </button>
      </div>
    </div>
  )
}

export default LevelUpModal
