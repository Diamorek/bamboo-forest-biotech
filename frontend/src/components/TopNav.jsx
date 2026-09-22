import BambooIcon from './BambooIcon'
import './TopNav.css'

function TopNav({ active, onNavigate }) {
  return (
    <header className="top-nav">
      <div className="top-nav-brand">
        <BambooIcon size={26} className="top-nav-icon" />
        <div>
          <h1 className="top-nav-title">대나무숲</h1>
          <p className="top-nav-subtitle">바이오/제약 익명 커뮤니티</p>
        </div>
      </div>

      <nav className="top-nav-tabs">
        <button
          className={`top-nav-tab ${active === 'board' ? 'is-active' : ''}`}
          onClick={() => onNavigate('board')}
        >
          게시판
        </button>
        <button
          className={`top-nav-tab ${active === 'timer' ? 'is-active' : ''}`}
          onClick={() => onNavigate('timer')}
        >
          🧪 타이머
        </button>
        <button
          className="top-nav-tab"
          onClick={() => onNavigate('login')}
        >
          로그인
        </button>
      </nav>
    </header>
  )
}

export default TopNav
