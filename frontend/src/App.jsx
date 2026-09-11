// 참고용 예시입니다. 기존 App.jsx에 맞게 병합해서 쓰세요.
import { useState } from 'react'
import './styles/theme.css'
import TopNav from './components/TopNav'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import BoardList from './components/BoardList'
import PostDetail from './components/PostDetail'
import BenchTimerSection from './components/BenchTimerSection'

function App() {
  // 'login' | 'signup' | 'board' | 'post' | 'timer'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [user, setUser] = useState(null)

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser)
    setView('board')
  }

  // 로그인/회원가입은 TopNav 없이 전체 화면으로
  if (view === 'login') {
    return (
      <LoginForm
        onLoginSuccess={handleAuthSuccess}
        onNavigateToSignup={() => setView('signup')}
      />
    )
  }
  if (view === 'signup') {
    return (
      <SignupForm
        onSignupSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setView('login')}
      />
    )
  }

  // 게시판/게시글/타이머는 같은 TopNav를 공유
  // (게시글 상세 화면에서도 탭은 '게시판'이 눌린 상태로 보이게)
  const activeTab = view === 'timer' ? 'timer' : 'board'

  return (
    <>
      <TopNav active={activeTab} onNavigate={setView} />

      {view === 'post' && (
        <PostDetail postId={selectedPostId} onBack={() => setView('board')} />
      )}

      {view === 'board' && (
        <BoardList
          onSelectPost={(id) => {
            setSelectedPostId(id)
            setView('post')
          }}
        />
      )}

      {view === 'timer' && (
        <div className="board-wrap">
          <BenchTimerSection />
        </div>
      )}
    </>
  )
}

export default App
