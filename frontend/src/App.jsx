// 참고용 예시입니다. 기존 App.jsx에 맞게 병합해서 쓰세요.
import { useState } from 'react'
import './styles/theme.css'
import TopNav from './components/TopNav'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import BoardList from './components/BoardList'
import PostDetail from './components/PostDetail'
import PostForm from './components/PostForm'
import SettingsForm from './components/SettingsForm'
import BenchTimerSection from './components/BenchTimerSection'

function App() {
  // 'login' | 'signup' | 'board' | 'post' | 'write' | 'timer' | 'settings'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [user, setUser] = useState(null)

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser)
    setView('board')
  }

  // "글쓰기" 버튼: 로그인 안 돼있으면 로그인 화면으로 먼저 보냄
  const handleWriteClick = () => {
    const token = localStorage.getItem('bfb_token')
    setView(token ? 'write' : 'login')
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

  if (view === 'write') {
    return (
      <PostForm
        onPostCreated={() => setView('board')}
        onCancel={() => setView('board')}
      />
    )
  }

  if (view === 'settings') {
    return <SettingsForm onBack={() => setView('board')} />
  }

  // 게시판/게시글/타이머는 같은 TopNav를 공유
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
          onWriteClick={handleWriteClick}
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
