// 참고용 예시입니다. 기존 App.jsx에 맞게 병합해서 쓰세요.
// react-router-dom을 쓰고 계시다면 이 useState 방식 대신 라우터로 바꿔드릴 수 있어요.
import { useState } from 'react'
import './styles/theme.css'
import LoginForm from './components/LoginForm'
import SignupForm from './components/SignupForm'
import BoardList from './components/BoardList'
import PostDetail from './components/PostDetail'

function App() {
  // 'login' | 'signup' | 'board' | 'post'
  const [view, setView] = useState('board')
  const [selectedPostId, setSelectedPostId] = useState(null)
  const [user, setUser] = useState(null)

  const handleAuthSuccess = (loggedInUser) => {
    setUser(loggedInUser)
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

  if (view === 'post') {
    return <PostDetail postId={selectedPostId} onBack={() => setView('board')} />
  }

  return (
    <BoardList
      onSelectPost={(id) => {
        setSelectedPostId(id)
        setView('post')
      }}
    />
  )
}

export default App
