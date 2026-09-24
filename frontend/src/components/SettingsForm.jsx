import { useEffect, useState } from 'react'
import { getToken, updateCachedUser } from '../utils/auth'
import './PostForm.css'
import './SettingsForm.css'

const API_URL = import.meta.env.VITE_API_URL

/**
 * 계정 설정 — 지금은 닉네임 변경만.
 * @param {() => void} onBack
 */
function SettingsForm({ onBack }) {
  const [nickname, setNickname] = useState('')
  const [originalNickname, setOriginalNickname] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const token = getToken()

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || data.error || '불러오지 못했어요.')
        const name = data.user?.username ?? data.username ?? ''
        setNickname(name)
        setOriginalNickname(name)
        if (data.user) updateCachedUser(data.user)
      } catch (err) {
        setError(err.message || '프로필을 불러오지 못했어요.')
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchMe()
    else setLoading(false)
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess(false)

    const trimmed = nickname.trim()
    if (!trimmed) {
      setError('닉네임을 입력해주세요.')
      return
    }
    if (trimmed === originalNickname) {
      setError('')
      return
    }

    setError('')
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: trimmed }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || data.error || '변경에 실패했어요.')

      const updated = data.user?.username ?? data.username ?? trimmed
      setNickname(updated)
      setOriginalNickname(updated)
      updateCachedUser({ username: updated })
      setSuccess(true)
    } catch (err) {
      setError(err.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="board-wrap">
      <button type="button" className="btn-text back-link" onClick={onBack}>
        ← 돌아가기
      </button>

      <h1 className="post-form-title">설정</h1>

      {loading ? (
        <div className="board-empty">불러오는 중...</div>
      ) : !token ? (
        <div className="board-empty">로그인이 필요해요.</div>
      ) : (
        <form className="post-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          {success && <div className="success-banner">닉네임이 변경됐어요.</div>}

          <div className="field">
            <label htmlFor="settings-nickname">닉네임</label>
            <input
              id="settings-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="숲에서 쓸 이름"
              maxLength={20}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </form>
      )}
    </div>
  )
}

export default SettingsForm
