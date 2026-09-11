import { useEffect, useState } from 'react'
import BambooIcon from './BambooIcon'
import './Board.css'

const API_URL = import.meta.env.VITE_API_URL

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'job', label: '구직/이직' },
  { id: 'experiment', label: '실험 방법' },
  { id: 'worklife', label: '회사 생활' },
]

// 백엔드에 /api/posts 가 아직 없는 동안 화면을 미리 볼 수 있도록 남겨둔 예시 데이터.
// 실제 엔드포인트가 생기면 이 배열은 지우고 아래 fetchPosts()의 catch 분기도 제거하세요.
const MOCK_POSTS = [
  {
    id: 1,
    category: 'job',
    title: '바이오시밀러 QC 이직, 연봉 협상 어떻게 하셨나요',
    preview: '3년차인데 이직 제안을 받았어요. 처우 협상 경험 있으신 분들 조언 부탁드려요.',
    author: '대나무1284',
    createdAt: '2시간 전',
    commentCount: 12,
    likeCount: 8,
  },
  {
    id: 2,
    category: 'experiment',
    title: 'HPLC 컬럼 수명, 다들 어느 정도 쓰시나요',
    preview: '역상 컬럼 300회 injection 넘으면 교체하는 게 맞을까요.',
    author: '숲속연구원',
    createdAt: '5시간 전',
    commentCount: 6,
    likeCount: 15,
  },
  {
    id: 3,
    category: 'worklife',
    title: 'QC 부서 야근 문화, 회사마다 정말 다른가요',
    preview: '이직 준비 중인데 참고하고 싶어서 여쭤봐요.',
    author: '판다곰',
    createdAt: '1일 전',
    commentCount: 21,
    likeCount: 34,
  },
]

/**
 * 게시판 목록
 * @param {(postId: number|string) => void} onSelectPost - 글 클릭 시 호출 (App에서 상세 화면으로 전환)
 */
function BoardList({ onSelectPost }) {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true)
      try {
        const response = await fetch(`${API_URL}/api/posts`)
        if (!response.ok) throw new Error('not ready')
        const data = await response.json()
        setPosts(data.posts ?? data)
      } catch {
        // 백엔드 엔드포인트가 아직 없을 때를 위한 임시 fallback
        setPosts(MOCK_POSTS)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [])

  const filteredPosts =
    activeCategory === 'all' ? posts : posts.filter((p) => p.category === activeCategory)

  const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div className="board-wrap">
      <header className="board-header">
        <h1 className="board-title">
          <BambooIcon className="board-title-icon" />
          대나무숲
        </h1>
        <p className="board-subtitle">바이오/제약 익명 게시판</p>
      </header>

      <nav className="category-row">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            className={`category-chip ${activeCategory === c.id ? 'is-active' : ''}`}
            onClick={() => setActiveCategory(c.id)}
          >
            {c.label}
          </button>
        ))}
      </nav>

      <div className="bamboo-divider" />

      {loading ? (
        <div className="board-empty">불러오는 중...</div>
      ) : filteredPosts.length === 0 ? (
        <div className="board-empty">아직 이 분류엔 글이 없어요. 첫 글을 남겨보세요.</div>
      ) : (
        <ul className="post-list">
          {filteredPosts.map((post, i) => (
            <li key={post.id}>
              <button className="post-row" onClick={() => onSelectPost(post.id)}>
                <span className="post-category-tag">{categoryLabel(post.category)}</span>
                <div className="post-row-main">
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-preview">{post.preview}</p>
                  <div className="post-meta">
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{post.createdAt}</span>
                    <span className="post-meta-spacer" />
                    <span>댓글 {post.commentCount}</span>
                    <span>좋아요 {post.likeCount}</span>
                  </div>
                </div>
              </button>
              {i < filteredPosts.length - 1 && <div className="bamboo-divider" />}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default BoardList
