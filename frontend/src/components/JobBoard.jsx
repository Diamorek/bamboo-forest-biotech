import { useEffect, useMemo, useState } from 'react'
import { isAdmin } from '../utils/auth'
import { JOB_CATEGORIES, REGIONS, categoryLabel, regionLabel, MOCK_JOBS } from './jobBoardData'
import './JobBoard.css'
import './Board.css'

const API_URL = import.meta.env.VITE_API_URL

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function formatMonthTitle(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

function toDateKey(date) {
  // toISOString()은 UTC로 변환해서 한국시간 기준으로는 하루 밀릴 수 있어서,
  // 로컬 연/월/일을 직접 조합해 문자열을 만듭니다.
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// "YYYY-MM-DD" 문자열을 new Date(dateString)로 바로 파싱하면 UTC 자정으로 해석돼서
// 마찬가지로 하루가 밀릴 수 있어요. 연/월/일을 직접 분리해서 로컬 자정으로 만듭니다.
function parseYMD(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysLeftLabel(deadline) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = parseYMD(deadline)
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24))
  if (diff < 0) return '마감'
  if (diff === 0) return '오늘 마감'
  return `D-${diff}`
}

/**
 * 이직공고 게시판
 * @param {() => void} onCreateClick - "공고 등록" 버튼 클릭 시 호출 (관리자만 보임)
 */
function JobBoard({ onCreateClick }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('list') // 'list' | 'calendar'
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeRegion, setActiveRegion] = useState('all')
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selectedDay, setSelectedDay] = useState(null)

  const admin = isAdmin()

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/job-postings`)
        if (!response.ok) throw new Error('not ready')
        const data = await response.json()
        setJobs(data.jobs ?? data)
      } catch {
        setJobs(MOCK_JOBS)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    let list = jobs
    if (activeCategory !== 'all') {
      list = list.filter((j) => (j.categories ?? []).includes(activeCategory))
    }
    if (activeRegion !== 'all') {
      list = list.filter((j) => j.region === activeRegion)
    }
    return [...list].sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }, [jobs, activeCategory, activeRegion])

  const jobsByDay = useMemo(() => {
    const map = {}
    filteredJobs.forEach((j) => {
      const key = j.deadline
      if (!map[key]) map[key] = []
      map[key].push(j)
    })
    return map
  }, [filteredJobs])

  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const startOffset = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const cells = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
    return cells
  }, [calendarMonth])

  const changeMonth = (delta) => {
    setSelectedDay(null)
    setCalendarMonth((prev) => {
      const next = new Date(prev)
      next.setMonth(prev.getMonth() + delta)
      return next
    })
  }

  const renderJobRow = (job) => (
    <li key={job.id}>
      <a href={job.url} target="_blank" rel="noopener noreferrer" className="post-row">
        <div className="job-tag-row">
          {(job.categories ?? []).map((c) => (
            <span key={c} className="post-category-tag">
              {categoryLabel(c)}
            </span>
          ))}
        </div>
        <div className="post-row-main">
          <h2 className="post-title">{job.title}</h2>
          <p className="post-preview">
            {job.company} · {regionLabel(job.region)}
          </p>
          <div className="post-meta">
            <span className={`job-deadline ${daysLeftLabel(job.deadline) === '마감' ? 'is-closed' : ''}`}>
              {daysLeftLabel(job.deadline)}
            </span>
            <span>·</span>
            <span>{job.deadline}</span>
          </div>
        </div>
      </a>
      <div className="bamboo-divider" />
    </li>
  )

  return (
    <div className="board-wrap">
      <div className="job-board-header">
        <div className="job-view-toggle">
          <button
            className={`top-nav-tab ${viewMode === 'list' ? 'is-active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            리스트
          </button>
          <button
            className={`top-nav-tab ${viewMode === 'calendar' ? 'is-active' : ''}`}
            onClick={() => setViewMode('calendar')}
          >
            달력
          </button>
        </div>

        {admin && (
          <button type="button" className="btn-primary job-create-btn" onClick={onCreateClick}>
            + 공고 등록
          </button>
        )}
      </div>

      <nav className="category-row">
        <button
          className={`category-chip ${activeCategory === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          직무 전체
        </button>
        {JOB_CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`category-chip ${activeCategory === c.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <nav className="category-row job-region-row">
        <button
          className={`category-chip ${activeRegion === 'all' ? 'is-active' : ''}`}
          onClick={() => setActiveRegion('all')}
        >
          지역 전체
        </button>
        {REGIONS.map((r) => (
          <button
            key={r.id}
            className={`category-chip ${activeRegion === r.id ? 'is-active' : ''}`}
            onClick={() => setActiveRegion(r.id)}
          >
            {r.label}
          </button>
        ))}
      </nav>

      <div className="bamboo-divider" />

      {loading ? (
        <div className="board-empty">불러오는 중...</div>
      ) : viewMode === 'list' ? (
        filteredJobs.length === 0 ? (
          <div className="board-empty">등록된 공고가 없어요.</div>
        ) : (
          <ul className="post-list">{filteredJobs.map(renderJobRow)}</ul>
        )
      ) : (
        <div className="job-calendar">
          <div className="job-calendar-header">
            <button type="button" className="btn-text" onClick={() => changeMonth(-1)}>
              ← 이전
            </button>
            <span className="job-calendar-title">{formatMonthTitle(calendarMonth)}</span>
            <button type="button" className="btn-text" onClick={() => changeMonth(1)}>
              다음 →
            </button>
          </div>

          <div className="job-calendar-grid job-calendar-weekdays">
            {WEEKDAYS.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>

          <div className="job-calendar-grid">
            {calendarCells.map((date, i) => {
              if (!date) return <span key={`empty-${i}`} className="job-calendar-cell is-empty" />
              const key = toDateKey(date)
              const count = jobsByDay[key]?.length ?? 0
              const isSelected = selectedDay === key
              return (
                <button
                  key={key}
                  type="button"
                  className={`job-calendar-cell ${count > 0 ? 'has-jobs' : ''} ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => setSelectedDay(isSelected ? null : key)}
                >
                  <span>{date.getDate()}</span>
                  {count > 0 && <span className="job-calendar-dot" />}
                </button>
              )
            })}
          </div>

          {selectedDay && (
            <div className="job-calendar-selected">
              <h3 className="comments-title">{selectedDay} 마감 공고</h3>
              {jobsByDay[selectedDay] ? (
                <ul className="post-list">{jobsByDay[selectedDay].map(renderJobRow)}</ul>
              ) : (
                <p className="board-empty">이 날짜엔 마감 공고가 없어요.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default JobBoard
