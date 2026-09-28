import { useState } from 'react'
import { getToken } from '../utils/auth'
import { JOB_CATEGORIES, REGIONS } from './jobBoardData'
import './PostForm.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * 이직공고 등록 폼 — 관리자만 접근 가능해야 함 (App에서 isAdmin() 체크 후 라우팅)
 * 직무는 여러 개 선택 가능(배열), 지역은 하나만 선택.
 * @param {(job: object) => void} onSaved
 * @param {() => void} onCancel
 */
function JobPostForm({ onSaved, onCancel }) {
  const [title, setTitle] = useState('')
  const [company, setCompany] = useState('')
  const [categories, setCategories] = useState([])
  const [region, setRegion] = useState('')
  const [deadline, setDeadline] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleCategory = (id) => {
    setCategories((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !company.trim() || !deadline || !url.trim()) {
      setError('제목, 회사명, 마감일, 지원 링크는 필수예요.')
      return
    }
    if (categories.length === 0) {
      setError('직무 분류를 하나 이상 선택해주세요.')
      return
    }
    if (!region) {
      setError('지역을 선택해주세요.')
      return
    }

    const token = getToken()
    setError('')
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/job-postings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          company: company.trim(),
          categories,
          region,
          deadline,
          url: url.trim(),
          description: description.trim(),
        }),
      })
      let data = {}
      try {
        data = await response.json()
      } catch {
        throw new Error('서버에서 올바른 응답을 받지 못했어요.')
      }
      if (!response.ok) throw new Error(data.message || data.error || '등록에 실패했어요.')
      onSaved?.(data.job ?? data)
    } catch (err) {
      setError(err.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="board-wrap">
      <button type="button" className="btn-text back-link" onClick={onCancel}>
        ← 취소
      </button>

      <h1 className="post-form-title">이직공고 등록</h1>

      <form className="post-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label>직무 분류 (여러 개 선택 가능)</label>
          <div className="category-select-row">
            {JOB_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-chip ${categories.includes(c.id) ? 'is-active' : ''}`}
                onClick={() => toggleCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>지역</label>
          <div className="category-select-row">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`category-chip ${region === r.id ? 'is-active' : ''}`}
                onClick={() => setRegion(r.id)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="job-title">공고 제목</label>
          <input id="job-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: QC 애널리스트 채용" />
        </div>

        <div className="field">
          <label htmlFor="job-company">회사명</label>
          <input id="job-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="회사명" />
        </div>

        <div className="field">
          <label htmlFor="job-deadline">마감일</label>
          <input id="job-deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="job-url">지원 링크</label>
          <input id="job-url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        </div>

        <div className="field">
          <label htmlFor="job-description">설명 (선택)</label>
          <textarea id="job-description" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="자격요건, 우대사항 등" />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '등록 중...' : '공고 등록'}
        </button>
      </form>
    </div>
  )
}

export default JobPostForm
