import { useEffect, useState } from 'react'
import PointProgressCard from './PointProgressCard'
import { fetchMyPoints, fetchPointHistory } from '../utils/points'
import { formatRelativeTime } from '../utils/formatDate'
import './Level.css'

/** 설정 화면에 들어가는 "나의 성장일지": 성장 게이지 + 최근 활동 내역 */
function MyPointsSection() {
  const [points, setPoints] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [p, h] = await Promise.all([fetchMyPoints(), fetchPointHistory(20)])
        if (cancelled) return
        setPoints(p)
        setHistory(h.history ?? [])
      } catch (err) {
        if (!cancelled) setError(err.message || '포인트 정보를 불러오지 못했어요.')
      }
    }
    load()

    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <p className="point-error">{error}</p>
  if (!points) return null

  return (
    <div className="my-points">
      <PointProgressCard {...points} />

      <h3 className="point-history-title">최근 활동</h3>
      {history.length === 0 ? (
        <p className="point-history-empty">아직 활동 내역이 없어요. 글과 댓글을 남겨보세요 🌱</p>
      ) : (
        <ul className="point-history">
          {history.map((item) => (
            <li key={item.id} className="point-history__item">
              <span className="point-history__desc">{item.description}</span>
              <span className={`point-history__points ${item.points < 0 ? 'is-minus' : ''}`}>
                {item.points > 0 ? '+' : ''}
                {item.points}점
              </span>
              <span className="point-history__time">{formatRelativeTime(item.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyPointsSection
