import { useState } from 'react'
import BambooIcon from './BambooIcon'
import './AuthForm.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * 로그인 폼
 * @param {(user: object, token: string) => void} onLoginSuccess - 로그인 성공 시 호출 (App에서 라우팅/상태 처리)
 * @param {() => void} onNavigateToSignup - "회원가입" 링크 클릭 시 호출
 */
function LoginForm({ onLoginSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('이메일과 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.')
      }

      localStorage.setItem('bfb_token', data.token)
      onLoginSuccess?.(data.user, data.token)
    } catch (err) {
      setError(err.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <BambooIcon size={32} className="auth-mark" />
        <h1 className="auth-title">다시 숲으로</h1>
        <p className="auth-subtitle">닉네임 뒤에 숨어, 하고 싶던 이야기를 나눠요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label htmlFor="login-email">이메일</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="login-password">비밀번호</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="bamboo-divider auth-divider" />

        <p className="auth-footer">
          아직 계정이 없으신가요?{' '}
          <button type="button" className="btn-text" onClick={onNavigateToSignup}>
            회원가입
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginForm
