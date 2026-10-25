// 참고용 예시입니다. 기존 App.jsx에 맞게 병합해서 쓰세요.
import { useEffect, useState } from 'react'
import './styles/theme.css'
import TopNav from './components/TopNav'
import Footer from './components/Footer'
import BossKey from './components/BossKey'
import LevelUpModal from './components/LevelUpModal'
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
import { registerVisit } from './utils/points'

function App() {
  // 'login' | 'signup' | 'board' | 'post' | 'write' | 'edit' | 'jobs' | 'jobWrite' | 'lupin' | 'timer' | 'settings'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [editingPost, setEditingPost] = useState(null)

  // 게시판 화면에서 로그아웃하면 화면 이름이 그대로('board')라 React가 다시 그리지 않아요.
  // 번호를 올려서 로그인/로그아웃 상태가 바뀌면 항상 화면을 다시 그리게 해요.
  const [, setAuthVersion] = useState(0)

  const currentUser = getUser()

  // 앱을 열 때 하루 첫 방문 포인트 기록 (로그인 상태일 때만, 서버가 하루 1회만 지급)
  useEffect(() => {
    registerVisit()
  }, [])

  const handleAuthSuccess = () => {
    registerVisit() // 로그인·가입 직후에도 방문 기록
    setView('board')
  }

  const handleLogout = () => {
    clearSession()
    setAuthVersion((v) => v + 1)
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

  // 화면 내용을 변수에 담아두고, 맨 아래에서 Footer랑 함께 한 번만 렌더링해요.
  // (early return을 안 쓰는 이유: 그러면 Footer를 화면마다 따로 넣어줘야 해서 중복돼요)
  let content

  if (view === 'login') {
    content = <LoginForm onLoginSuccess={handleAuthSuccess} onNavigateToSignup={() => setView('signup')} />
  } else if (view === 'signup') {
    content = <SignupForm onSignupSuccess={handleAuthSuccess} onNavigateToLogin={() => setView('login')} />
  } else if (view === 'write' || view === 'edit') {
    content = (
      <PostForm
        editingPost={view === 'edit' ? editingPost : null}
        onSaved={() => setView(view === 'edit' ? 'post' : 'board')}
        onCancel={() => setView(view === 'edit' ? 'post' : 'board')}
      />
    )
  } else if (view === 'jobWrite') {
    content = <JobPostForm onSaved={() => setView('jobs')} onCancel={() => setView('jobs')} />
  } else if (view === 'settings') {
    content = <SettingsForm onBack={() => setView('board')} />
  } else {
    // 게시판/게시글/이직공고/월루/타이머는 같은 TopNav를 공유
    const activeTab = ['timer', 'jobs', 'lupin'].includes(view) ? view : 'board'

    content = (
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
            onRequireLogin={() => setView('login')}
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

  return (
    <>
      {content}
      <Footer />
      <BossKey />
      <LevelUpModal />
    </>
  )
}

export default App
