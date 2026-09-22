import { useState } from 'react'
import './styles/theme.css'
import TopNav from './components/TopNav'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import BoardList from './components/BoardList'
import PostDetail from './components/PostDetail'
import BenchTimerSection from './components/BenchTimerSection'

function App() {
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [user, setUser] = useState(null)

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser)
    setView('board')
  }

  const handleLogout = () => {
    localStorage.removeItem('bfb_token')
    setUser(null)
    setView('board')
  }

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

  const activeTab = view === 'timer' ? 'timer' : 'board'

  return (
    <>
      <TopNav
        active={activeTab}
        onNavigate={setView}
        user={user}
        onLogout={handleLogout}
      />

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
