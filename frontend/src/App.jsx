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
import JobBoard from './components/JobBoard'
import JobPostForm from './components/JobPostForm'
import LupinBoard from './components/LupinBoard'
import { getToken, getUser, clearSession, isAdmin } from './utils/auth'

function App() {
  // 'login' | 'signup' | 'board' | 'post' | 'write' | 'edit' | 'jobs' | 'jobWrite' | 'lupin' | 'timer' | 'settings'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  const currentUser = getUser()

  const handleAuthSuccess = () => setView('board')

  const handleLogout = () => {
    clearSession()
    setView('board')
  }

  const handleWriteClick = () => {
    setEditingPost(null)
    setView(getToken() ? 'write' : 'login')
  }

  const handleEditClick = (post) => {
    setEditingPost(post)
    setView('edit')
  }

  const handleJobCreateClick = () => {
    setView(isAdmin() ? 'jobWrite' : 'login')
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

  if (view === 'jobWrite') {
    return <JobPostForm onSaved={() => setView('jobs')} onCancel={() => setView('jobs')} />
  }

  if (view === 'settings') {
    return <SettingsForm onBack={() => setView('board')} />
  }

  // 게시판/게시글/이직공고/월루/타이머는 같은 TopNav를 공유
  const activeTab = ['timer', 'jobs', 'lupin'].includes(view) ? view : 'board'

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

      {view === 'jobs' && <JobBoard onCreateClick={handleJobCreateClick} />}

      {view === 'lupin' && <LupinBoard />}

      {view === 'timer' && (
        <div className="board-wrap">
          <BenchTimerSection />
        </div>
      )}
    </>
  )
}

export default App
