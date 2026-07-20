import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [status, setStatus] = useState('Connecting...')

  useEffect(() => {
    const checkAPI = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/health`)
        const data = await response.json()
        setStatus(`✅ ${data.message}`)
      } catch (error) {
        setStatus('❌ API Connection Error')
      }
    }
    checkAPI()
  }, [])

  return (
    <div className="App">
      <h1>🎋 Bamboo Forest Biotech</h1>
      <p>바이오/제약 분야 익명 커뮤니티</p>
      <div className="status">{status}</div>
      <div className="coming-soon">
        <h2>🚀 Coming Soon</h2>
        <ul>
          <li>익명 게시판</li>
          <li>구직/이직 정보 공유</li>
          <li>실험 방법 토론</li>
          <li>핫 글 순위</li>
        </ul>
      </div>
    </div>
  )
}

export default App