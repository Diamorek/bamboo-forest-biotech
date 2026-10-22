import { useState } from 'react'
import { getToken } from '../utils/auth'
import './PostForm.css'

const API_URL = import.meta.env.VITE_API_URL

const CATEGORY_OPTIONS = [
  { id: 'free', label: '자유게시판' },
  { id: 'job', label: '구직/이직' },
  { id: 'experiment', label: '실험 방법' },
  { id: 'worklife', label: '회사 생활' },
  { id: 'news', label: '바이오 소식' },
]

// 카테고리별로 본문 입력칸에 보여줄 작성 안내
const CONTENT_PLACEHOLDERS = {
  free: '업계 이야기가 아니어도 괜찮아요. 편하게 적어주세요.',
  job: '직무와 연차, 궁금한 점을 적어주세요.\n예) QC 3년차, 바이오시밀러에서 CDMO로 이직 고민 중.\n회사명은 꼭 필요할 때만, 연봉은 범위로만 적어도 충분해요.',
  experiment: '하려는 실험, 시도한 조건(시료·장비·버퍼·시간 등), 결과나 막힌 부분을 적어주세요.\n사내 기밀이나 미공개 데이터는 빼고 일반화해서 써주세요.',
  worklife: '상황 중심으로 적어주세요.\n특정 회사나 사람이 드러나는 표현은 줄이고, 나눌 만한 경험이나 팁이 함께 있으면 더 좋아요.',
  news: '출처(기사·보도자료 링크)와 한두 줄 요약, 내 생각을 함께 적어주세요.\n기사 전문을 그대로 붙여넣는 건 피해주세요.',
}

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
  const [category, setCategory] = useState(editingPost?.category ?? 'free')
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

      <div className="post-guide">
        <p>
          대나무숲은 바이오·제약 사람들이 회사에서는 하기 어려운 이야기를 나누는 익명 공간이에요.
          경험은 솔직하게, 정보는 구체적으로 적어주세요. 같은 고민을 하는 분에게 큰 도움이 돼요.
        </p>
        <p>아래 내용은 피해주세요.</p>
        <ul>
          <li>회사나 개인이 특정되는 비방</li>
          <li>사내 기밀, 미공개 데이터 (공정, 임상, 고객사 정보 등)</li>
          <li>광고·홍보 (채용 공고는 이직공고 게시판 이용, 문의: biobambooforest@gmail.com)</li>
        </ul>
      </div>

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
            placeholder={CONTENT_PLACEHOLDERS[category] ?? '솔직하게, 그리고 서로에게 도움이 되게 적어주세요.'}
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
