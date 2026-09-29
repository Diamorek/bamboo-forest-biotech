import { useEffect, useState } from 'react'
import { getToken, getUser, isAdmin } from '../utils/auth'
import { formatRelativeTime } from '../utils/formatDate'
import './Board.css'

const API_URL = import.meta.env.VITE_API_URL

// /api/posts/:id 가 아직 없을 때 미리보기용 fallback. 실제 엔드포인트 연결 후 삭제하세요.
const MOCK_POST = {
  id: 1,
  category: '구직/이직',
  title: '바이오시밀러 QC 이직, 연봉 협상 어떻게 하셨나요',
  content:
    '3년차인데 이직 제안을 받았어요. 지금보다 조금 더 규모 있는 곳인데, 처우 협상을 어떻게 시작해야 할지 감이 안 잡히네요. 비슷한 경험 있으신 분들 조언 부탁드립니다.',
  author: '대나무1284',
  createdAt: '2시간 전',
  likeCount: 8,
  comments: [
    { id: 1, author: '숲속연구원', content: '동종업계 평균 연봉표부터 확인해보세요.', createdAt: '1시간 전' },
    { id: 2, author: '판다곰', content: '이직 제안서 기준으로 역제안 하시는 걸 추천해요.', createdAt: '40분 전' },
  ],
}

/**
 * 게시글 상세
 * @param {number|string} postId
 * @param {() => void} onBack - 목록으로 돌아가기
 * @param {(post: object) => void} onEditClick - 수정 버튼 클릭 시 호출 (현재 글 데이터와 함께)
 * @param {(postId: number|string) => void} onDeleted - 삭제 성공 시 호출 (App에서 목록으로 이동)
 */
function PostDetail({ postId, onBack, onEditClick, onDeleted }) {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [actionError, setActionError] = useState('')
  const [reported, setReported] = useState(false)

  const currentUser = getUser()
  const admin = isAdmin()

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/posts/${postId}`)
        if (!response.ok) throw new Error('not ready')
        const data = await response.json()
        setPost(data)
      } catch {
        setPost(MOCK_POST)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [postId])

  const handleLike = async () => {
    const token = getToken()
    if (!token) {
      setActionError('좋아요를 누르려면 로그인이 필요해요.')
      return
    }

    setActionError('')
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      let data = {}
      try {
        data = await response.json()
      } catch {
        throw new Error('좋아요 기능이 아직 서버에 연결되지 않았어요.')
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || '좋아요 처리에 실패했어요.')
      }

      setLiked(data.liked)
      setPost((p) => ({ ...p, likeCount: data.likeCount }))
    } catch (err) {
      setActionError(err.message || '좋아요 처리 중 문제가 생겼어요.')
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return

    const token = getToken()
    if (!token) {
      setActionError('댓글을 쓰려면 로그인이 필요해요.')
      return
    }

    setActionError('')
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: commentText.trim() }),
      })

      // 백엔드에 이 엔드포인트가 아직 없으면 JSON이 아니라 HTML(404 페이지 등)이 돌아올 수 있어서,
      // 파싱을 try로 감싸고 실패 시 상태 코드 기반의 이해 가능한 메시지로 대체.
      let data = {}
      try {
        data = await response.json()
      } catch {
        throw new Error('댓글 기능이 아직 서버에 연결되지 않았어요. 잠시 후 다시 시도해주세요.')
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || '댓글 등록에 실패했어요.')
      }
      const newComment = data.comment ?? data
      setPost((p) => ({ ...p, comments: [...p.comments, newComment] }))
      setCommentText('')
    } catch (err) {
      setActionError(err.message || '댓글 등록 중 문제가 생겼어요.')
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm('정말 삭제할까요? 되돌릴 수 없어요.')
    if (!confirmed) return

    const token = getToken()
    setActionError('')
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || data.error || '삭제에 실패했어요.')
      }
      onDeleted?.(postId)
    } catch (err) {
      setActionError(err.message || '삭제 중 문제가 생겼어요.')
    }
  }

  const handleReport = async () => {
    const token = getToken()
    if (!token) {
      setActionError('신고하려면 로그인이 필요해요.')
      return
    }
    setActionError('')
    try {
      const response = await fetch(`${API_URL}/api/posts/${postId}/report`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || data.error || '신고 접수에 실패했어요.')
      }
      setReported(true)
    } catch (err) {
      setActionError(err.message || '신고 중 문제가 생겼어요.')
    }
  }

  if (loading) {
    return (
      <div className="board-wrap">
        <div className="board-empty">불러오는 중...</div>
      </div>
    )
  }

  if (!post) return null

  // 서버가 authorId를 내려주면 ID로 비교(닉네임 변경에도 안전), 없으면 닉네임 비교로 대체
  const isOwner =
    post.authorId != null && currentUser?.id != null
      ? String(post.authorId) === String(currentUser.id)
      : Boolean(currentUser?.username) && currentUser.username === post.author
  const canManage = isOwner || admin

  return (
    <div className="board-wrap">
      <div className="post-detail-top">
        <button className="btn-text back-link" onClick={onBack}>
          ← 목록으로
        </button>

        <div className="post-detail-actions">
          {canManage && isOwner && (
            <button type="button" className="btn-text" onClick={() => onEditClick?.(post)}>
              수정
            </button>
          )}
          {canManage && (
            <button type="button" className="btn-text post-delete-btn" onClick={handleDelete}>
              삭제{admin && !isOwner ? ' (운영자)' : ''}
            </button>
          )}
          {!isOwner && (
            <button type="button" className="btn-text" onClick={handleReport} disabled={reported}>
              {reported ? '신고 접수됨' : '🚩 신고'}
            </button>
          )}
        </div>
      </div>

      {actionError && <div className="error-banner post-action-error">{actionError}</div>}

      <article className="post-detail">
        <span className="post-category-tag">{post.category}</span>
        <h1 className="post-detail-title">{post.title}</h1>
        <div className="post-meta">
          <span>{post.author}</span>
          <span>·</span>
          <span>{formatRelativeTime(post.createdAt)}</span>
        </div>

        <p className="post-detail-content">{post.content}</p>

        <button className={`like-btn ${liked ? 'is-liked' : ''}`} onClick={handleLike}>
          🌱 좋아요 {post.likeCount}
        </button>
      </article>

      <div className="bamboo-divider section-divider" />

      <section className="comments">
        <h2 className="comments-title">댓글 {post.comments.length}</h2>

        <ul className="comment-list">
          {post.comments.map((c) => (
            <li key={c.id} className="comment-item">
              <div className="post-meta">
                <span>{c.author}</span>
                <span>·</span>
                <span>{formatRelativeTime(c.createdAt)}</span>
              </div>
              <p className="comment-content">{c.content}</p>
            </li>
          ))}
        </ul>

        <form className="comment-form" onSubmit={handleCommentSubmit}>
          <div className="field">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="따뜻한 댓글을 남겨주세요"
            />
          </div>
          <button type="submit" className="btn-primary">
            댓글 남기기
          </button>
        </form>
      </section>
    </div>
  )
}

export default PostDetail
