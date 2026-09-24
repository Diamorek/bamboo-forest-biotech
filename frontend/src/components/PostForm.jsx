import { useState } from 'react'
import { getToken } from '../utils/auth'
import './PostForm.css'

const API_URL = import.meta.env.VITE_API_URL

const CATEGORY_OPTIONS = [
  { id: 'job', label: '구직/이직' },
  { id: 'experiment', label: '실험 방법' },
  { id: 'worklife', label: '회사 생활' },
]

/**
 * 게시글 작성/수정 폼 (같은 폼을 두 용도로 씀)
 * @param {object} [editingPost] - 수정 모드일 때 기존 글 데이터 (id, title, content, category). 없으면 새 글 작성 모드.
 * @param {(post: object) => void} onSaved - 작성/수정 성공 시 호출 (App에서 이동 + 갱신)
 * @param {() => void} onCancel - 취소/뒤로가기
 */
function PostForm({ editingPost, onSaved, onCancel }) {
  const isEditMode = Boolean(editingPost)

  const [title, setTitle] = useState(editingPost?.title ?? '')
  const [content, setContent] = useState(editingPost?.content ?? '')
  const [category, setCategory] = useState(editingPost?.category ?? 'job')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    const token = getToken()
    if (!token) {
      setError('로그인이 필요해요.')
      return
    }

    setError('')
    setLoading(true)
    try {
      const url = isEditMode ? `${API_URL}/api/posts/${editingPost.id}` : `${API_URL}/api/posts`
      const method = isEditMode ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: title.trim(), content: content.trim(), category }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || data.error || (isEditMode ? '글 수정에 실패했습니다.' : '글 작성에 실패했습니다.')
        )
      }

      onSaved?.(data.post ?? data)
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

      <h1 className="post-form-title">{isEditMode ? '글 수정' : '글쓰기'}</h1>

      <form className="post-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        <div className="field">
          <label htmlFor="post-category">카테고리</label>
          <div className="category-select-row">
            {CATEGORY_OPTIONS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`category-chip ${category === c.id ? 'is-active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="post-title">제목</label>
          <input
            id="post-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
            maxLength={100}
          />
        </div>

        <div className="field">
          <label htmlFor="post-content">내용</label>
          <textarea
            id="post-content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="솔직하게, 그리고 서로에게 도움이 되게 적어주세요."
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? '저장 중...' : isEditMode ? '수정하기' : '게시하기'}
        </button>
      </form>
    </div>
  )
}

export default PostForm
