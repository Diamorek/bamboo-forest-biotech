import { useState } from 'react'
import { getToken } from '../utils/auth'
import { JOB_CATEGORIES } from './jobBoardData'
import './PostForm.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * 이직공고 등록 폼 — 관리자만 접근 가능해야 함 (App에서 isAdmin() 체크 후 라우팅)
 * @param {(job: object) => void} onSaved
 * @param {() => void} onCancel
 */
function JobPostForm({ onSaved, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    company: '',
    category: 'qc',
    deadline: '',
    url: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.company.trim() || !form.deadline || !form.url.trim()) {
      setError('제목, 회사명, 마감일, 지원 링크는 필수예요.')
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
        body: JSON.stringify(form),
      })
      const data = await response.json()
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
          <label htmlFor="job-category">직무 분류</label>
          <div className="category-select-row">
            {JOB_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-chip ${form.category === c.id ? 'is-active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, category: c.id }))}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="job-title">공고 제목</label>
          <input id="job-title" type="text" value={form.title} onChange={update('title')} placeholder="예: QC 애널리스트 채용" />
        </div>

        <div className="field">
          <label htmlFor="job-company">회사명</label>
          <input id="job-company" type="text" value={form.company} onChange={update('company')} placeholder="회사명" />
        </div>

        <div className="field">
          <label htmlFor="job-deadline">마감일</label>
          <input id="job-deadline" type="date" value={form.deadline} onChange={update('deadline')} />
        </div>

        <div className="field">
          <label htmlFor="job-url">지원 링크</label>
          <input id="job-url" type="url" value={form.url} onChange={update('url')} placeholder="https://..." />
        </div>

        <div className="field">
          <label htmlFor="job-description">설명 (선택)</label>
          <textarea id="job-description" rows={5} value={form.description} onChange={update('description')} placeholder="자격요건, 우대사항 등" />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '등록 중...' : '공고 등록'}
        </button>
      </form>
    </div>
  )
}

export default JobPostForm
