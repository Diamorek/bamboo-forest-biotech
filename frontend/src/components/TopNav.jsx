import BambooIcon from './BambooIcon'
import './TopNav.css'

/**
 * 로고 + 탭 네비게이션 + 로그인 상태. 로그인/회원가입 화면 제외하고 항상 위에 떠 있어요.
 * @param {'board'|'timer'} active
 * @param {(view: 'board'|'timer'|'settings'|'login') => void} onNavigate
 * @param {string|null} username - 로그인 상태면 닉네임, 아니면 null
 * @param {() => void} onLogout
 */
function TopNav({ active, onNavigate, username, onLogout }) {
  return (
    <header className="top-nav">
      <div className="top-nav-brand">
        <BambooIcon size={26} className="top-nav-icon" />
        <div>
          <h1 className="top-nav-title">대나무숲</h1>
          <p className="top-nav-subtitle">바이오/제약 익명 커뮤니티</p>
        </div>
      </div>

      <div className="top-nav-right">
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
        </nav>

        {username ? (
          <>
            <button
              type="button"
              className="top-nav-settings"
              onClick={() => onNavigate('settings')}
              aria-label="설정"
              title="설정"
            >
              ⚙️
            </button>
            <span className="top-nav-username">{username}</span>
            <button type="button" className="btn-text top-nav-logout" onClick={onLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <button type="button" className="btn-primary top-nav-login-btn" onClick={() => onNavigate('login')}>
            로그인
          </button>
        )}
      </div>
    </header>
  )
}

export default TopNav
