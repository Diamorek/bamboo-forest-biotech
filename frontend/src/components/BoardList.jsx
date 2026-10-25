import { useEffect, useState } from 'react'
import { formatRelativeTime } from '../utils/formatDate'
import { getUser } from '../utils/auth'
import { getLastSeenId, markPostsSeen, useNewPostsCount } from '../utils/newPosts'
import LevelBadge from './LevelBadge'
import './Board.css'

const API_URL = import.meta.env.VITE_API_URL

const CATEGORIES = [
  { id: 'all', label: '전체' },
  { id: 'job', label: '구직/이직' },
  { id: 'experiment', label: '실험 방법' },
  { id: 'worklife', label: '회사 생활' },
  { id: 'free', label: '자유게시판' },
  { id: 'news', label: '바이오 소식' },
]

const MIN_QUERY_LENGTH = 2 // 한 글자 검색은 결과가 너무 많고 서버 부담만 커서 2글자부터
const SEARCH_LIMIT = 50

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
 * @param {() => void} onWriteClick - 글쓰기 버튼 클릭 시 호출
 */
function BoardList({ onSelectPost, onWriteClick }) {
  const [posts, setPosts] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [sortMode, setSortMode] = useState('latest') // 'latest' | 'hot' | 'mine'
  const [hotPeriod, setHotPeriod] = useState('week') // 'week' | 'month' | 'year'
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0) // "새 글 불러오기"를 눌렀을 때 +1
  const newCount = useNewPostsCount()
  // 이 화면을 열기 전까지 읽은 마지막 글 번호 → 그보다 큰 번호가 "새 글"
  const [seenBaseline] = useState(() => getLastSeenId())
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('') // 타이핑이 멈춘 뒤 확정된 검색어
  const [searchResults, setSearchResults] = useState(null) // null이면 검색 중이 아님
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      if (reloadKey === 0) setLoading(true) // 새로 불러올 때는 화면을 비우지 않고 조용히 교체
      try {
        const response = await fetch(`${API_URL}/api/posts`)
        if (!response.ok) throw new Error('not ready')
        const data = await response.json()
        const list = data.posts ?? data
        setPosts(list)
        // 서버에서 실제로 받아온 목록일 때만 "여기까지 읽음" 처리 (임시 목업 데이터는 제외)
        markPostsSeen(list.reduce((m, p) => (typeof p.id === 'number' && p.id > m ? p.id : m), 0))
      } catch {
        // 백엔드 엔드포인트가 아직 없을 때를 위한 임시 fallback
        setPosts(MOCK_POSTS)
      } finally {
        setLoading(false)
      }
    }
    fetchPosts()
  }, [reloadKey])

  // 글자를 칠 때마다 서버를 부르지 않도록, 타이핑이 0.3초 멈추면 그때 검색어를 확정해요
  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    if (searchQuery.length < MIN_QUERY_LENGTH) {
      setSearchResults(null)
      setSearching(false)
      return
    }

    // 새 검색이 시작되면 이전 요청을 취소해서, 늦게 도착한 옛 결과가 화면을 덮어쓰지 않게 해요
    const controller = new AbortController()
    setSearching(true)

    const runSearch = async () => {
      try {
        const params = new URLSearchParams({ q: searchQuery, limit: String(SEARCH_LIMIT) })
        if (activeCategory !== 'all') params.set('category', activeCategory)

        const response = await fetch(`${API_URL}/api/posts?${params}`, { signal: controller.signal })
        if (!response.ok) throw new Error('search failed')
        const data = await response.json()
        // 검색이 아직 반영 안 된 서버는 q를 무시하고 전체 목록을 주기 때문에(searched 표시 없음),
        // 그걸 검색 결과로 착각하지 않도록 아래 fallback으로 넘겨요.
        if (data.searched !== true) throw new Error('search not supported')

        setSearchResults(data.posts ?? [])
        setSearching(false)
      } catch (err) {
        if (err.name === 'AbortError') return
        // 서버 검색을 못 쓰는 상황이면, 이미 받아온 목록에서 제목/미리보기만이라도 찾아줘요
        const needle = searchQuery.toLowerCase()
        setSearchResults(
          posts.filter((p) => `${p.title} ${p.preview}`.toLowerCase().includes(needle))
        )
        setSearching(false)
      }
    }
    runSearch()

    return () => controller.abort()
  }, [searchQuery, activeCategory, posts])

  // 검색 중이면 검색 결과에서, 아니면 전체 목록에서 시작
  const basePosts = searchResults ?? posts
  const filteredPosts =
    activeCategory === 'all' ? basePosts : basePosts.filter((p) => p.category === activeCategory)

  const PERIOD_DAYS = { week: 7, month: 30, year: 365 }

  const currentUser = getUser()

  // "내 글"을 보다가 로그아웃하면 탭이 사라지니까 최신순으로 되돌려요
  const loggedIn = Boolean(currentUser)
  useEffect(() => {
    if (!loggedIn && sortMode === 'mine') setSortMode('latest')
  }, [loggedIn, sortMode])

  // "내 글": 글쓴이 번호(authorId)가 오면 그걸로, 없으면 닉네임으로 비교해요
  // (게시글 상세의 본인 확인과 같은 방식 — 닉네임을 바꿨어도 번호가 있으면 정확해요)
  const isMine = (p) => {
    if (!currentUser) return false
    if (p.authorId != null && currentUser.id != null) return String(p.authorId) === String(currentUser.id)
    return Boolean(currentUser.username) && p.author === currentUser.username
  }

  // "핫 글": 기간(최근 n일) 안의 글만, (좋아요+댓글수) 합산 점수로 정렬.
  // 서버 안 건드리고 이미 받아온 목록에서 계산해요.
  const displayedPosts =
    sortMode === 'hot'
      ? [...filteredPosts]
          .filter((p) => {
            const created = new Date(p.createdAt)
            if (Number.isNaN(created.getTime())) return true // 목업 등 날짜 파싱 안 되면 일단 포함
            const cutoff = Date.now() - PERIOD_DAYS[hotPeriod] * 24 * 60 * 60 * 1000
            return created.getTime() >= cutoff
          })
          .sort((a, b) => (b.likeCount + b.commentCount) - (a.likeCount + a.commentCount))
      : sortMode === 'mine'
        ? filteredPosts.filter(isMine)
        : filteredPosts

  const categoryLabel = (id) => CATEGORIES.find((c) => c.id === id)?.label ?? id

  return (
    <div className="board-wrap">
      {!loading && newCount > 0 && (
        <button type="button" className="new-posts-banner" onClick={() => setReloadKey((k) => k + 1)}>
          🌱 새 글 {newCount}개가 올라왔어요 · 눌러서 불러오기
        </button>
      )}

      <div className="search-row">
        <input
          type="search"
          className="search-input"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="제목·내용 검색 (2글자 이상)"
          aria-label="게시글 검색"
        />
        {searchInput && (
          <button type="button" className="btn-text" onClick={() => setSearchInput('')}>
            지우기
          </button>
        )}
      </div>

      {searchQuery.length >= MIN_QUERY_LENGTH && (
        <p className="search-status">
          {searching
            ? '검색 중...'
            : `'${searchQuery}' 검색 결과 ${displayedPosts.length}건${
                searchResults && searchResults.length >= SEARCH_LIMIT
                  ? ` (최대 ${SEARCH_LIMIT}건까지 보여드려요)`
                  : ''
              }`}
        </p>
      )}

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

      <div className="sort-row">
        <div className="sort-toggle">
          <button
            className={`top-nav-tab ${sortMode === 'latest' ? 'is-active' : ''}`}
            onClick={() => setSortMode('latest')}
          >
            🕒 최신순
          </button>
          <button
            className={`top-nav-tab ${sortMode === 'hot' ? 'is-active' : ''}`}
            onClick={() => setSortMode('hot')}
          >
            🔥 핫 글
          </button>
          {currentUser && (
            <button
              className={`top-nav-tab ${sortMode === 'mine' ? 'is-active' : ''}`}
              onClick={() => setSortMode('mine')}
            >
              ✍️ 내 글
            </button>
          )}
        </div>

        {sortMode === 'hot' && (
          <div className="sort-toggle">
            {[
              { id: 'week', label: '이번주' },
              { id: 'month', label: '이달' },
              { id: 'year', label: '올해' },
            ].map((p) => (
              <button
                key={p.id}
                className={`top-nav-tab ${hotPeriod === p.id ? 'is-active' : ''}`}
                onClick={() => setHotPeriod(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bamboo-divider" />

      {loading ? (
        <div className="board-empty">불러오는 중...</div>
      ) : displayedPosts.length === 0 ? (
        <div className="board-empty">
          {searchResults !== null
            ? `'${searchQuery}'에 대한 결과가 없어요.`
            : sortMode === 'mine'
              ? '내가 쓴 글이 없어요. 새 글을 남겨보세요.'
              : sortMode === 'hot'
                ? '이 기간엔 핫 글이 없어요.'
                : '아직 이 분류엔 글이 없어요. 첫 글을 남겨보세요.'}
        </div>
      ) : (
        <ul className="post-list">
          {displayedPosts.map((post, i) => (
            <li key={post.id}>
              <button className="post-row" onClick={() => onSelectPost(post.id)}>
                <span className="post-category-tag">{categoryLabel(post.category)}</span>
                <div className="post-row-main">
                  <h2 className="post-title">
                    {sortMode === 'hot' && <span className="hot-rank">{i + 1}</span>}
                    {post.title}
                    {seenBaseline != null && typeof post.id === 'number' && post.id > seenBaseline && (
                      <span className="new-dot" aria-label="새 글">N</span>
                    )}
                  </h2>
                  <p className="post-preview">{post.preview}</p>
                  <div className="post-meta">
                    <LevelBadge level={post.authorLevel} compact />
                    <span>{post.author}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(post.createdAt)}</span>
                    <span className="post-meta-spacer" />
                    <span>댓글 {post.commentCount}</span>
                    <span>좋아요 {post.likeCount}</span>
                  </div>
                </div>
              </button>
              {i < displayedPosts.length - 1 && <div className="bamboo-divider" />}
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="write-fab" onClick={onWriteClick}>
        ✏️ 글쓰기
      </button>
    </div>
  )
}

export default BoardList
