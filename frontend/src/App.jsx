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
import { getToken, getUser, clearSession } from './utils/auth'

function App() {
  // 'login' | 'signup' | 'board' | 'post' | 'write' | 'edit' | 'timer' | 'settings'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  // localStorage에서 매 렌더마다 새로 읽어와서, 로그인/로그아웃/닉네임 변경 후
  // 화면으로 돌아오기만 하면(= setView 호출) 자동으로 최신 상태가 반영돼요.
  const currentUser = getUser()

  const handleAuthSuccess = () => {
    setView('board')
  }

  const handleLogout = () => {
    clearSession()
    setView('board')
  }

  // "글쓰기" 버튼: 로그인 안 돼있으면 로그인 화면으로 먼저 보냄
  const handleWriteClick = () => {
    setEditingPost(null)
    setView(getToken() ? 'write' : 'login')
  }

  const handleEditClick = (post) => {
    setEditingPost(post)
    setView('edit')
  }

  // 로그인/회원가입은 TopNav 없이 전체 화면으로
  if (view === 'login') {
    return <LoginForm onLoginSuccess={handleAuthSuccess} onNavigateToSignup={() => setView('signup')} />
  }
  if (view === 'signup') {
    return <SignupForm onSignupSuccess={handleAuthSuccess} onNavigateToLogin={() => setView('login')} />
  }

  if (view === 'write' || view === 'edit') {
    return (
      <PostForm
        editingPost={view === 'edit' ? editingPost : null}
        onSaved={() => setView(view === 'edit' ? 'post' : 'board')}
        onCancel={() => setView(view === 'edit' ? 'post' : 'board')}
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
      <TopNav
        active={activeTab}
        onNavigate={setView}
        username={currentUser?.username ?? null}
        onLogout={handleLogout}
      />

      {view === 'post' && (
        <PostDetail
          postId={selectedPostId}
          onBack={() => setView('board')}
          onEditClick={handleEditClick}
          onDeleted={() => setView('board')}
        />
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
