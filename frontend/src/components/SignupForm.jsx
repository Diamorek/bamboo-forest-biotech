import { useState } from 'react'
import BambooIcon from './BambooIcon'
import './AuthForm.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * 회원가입 폼
 * @param {(user: object, token: string) => void} onSignupSuccess
 * @param {() => void} onNavigateToLogin - "로그인" 링크 클릭 시 호출
 */
function SignupForm({ onSignupSuccess, onNavigateToLogin }) {
  const [form, setForm] = useState({ email: '', username: '', password: '', passwordConfirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const validate = () => {
    if (!form.email || !form.username || !form.password) {
      return '모든 항목을 입력해주세요.'
    }
    if (form.password.length < 8) {
      return '비밀번호는 8자 이상이어야 해요.'
    }
    if (form.password !== form.passwordConfirm) {
      return '비밀번호가 일치하지 않아요.'
    }
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || '회원가입에 실패했습니다.')
      }

      localStorage.setItem('bfb_token', data.token)
      onSignupSuccess?.(data.user, data.token)
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
        <h1 className="auth-title">숲에 들어가기</h1>
        <p className="auth-subtitle">닉네임만 남고, 나머지는 숲이 지켜드려요</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label htmlFor="signup-email">이메일</label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-username">닉네임</label>
            <input
              id="signup-username"
              type="text"
              value={form.username}
              onChange={update('username')}
              placeholder="숲에서 쓸 이름"
              autoComplete="username"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password">비밀번호</label>
            <input
              id="signup-password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="8자 이상"
              autoComplete="new-password"
            />
          </div>

          <div className="field">
            <label htmlFor="signup-password-confirm">비밀번호 확인</label>
            <input
              id="signup-password-confirm"
              type="password"
              value={form.passwordConfirm}
              onChange={update('passwordConfirm')}
              placeholder="비밀번호 다시 입력"
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="bamboo-divider auth-divider" />

        <p className="auth-footer">
          이미 계정이 있으신가요?{' '}
          <button type="button" className="btn-text" onClick={onNavigateToLogin}>
            로그인
          </button>
        </p>
      </div>
    </div>
  )
}

export default SignupForm
