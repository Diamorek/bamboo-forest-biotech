import { useEffect, useRef, useState } from 'react'
import './BossKey.css'

const STORAGE_KEY = 'bfb_boss_key_image'

/**
 * 어디서든 떠 있는 위장 버튼.
 * - 이미지를 아직 안 올렸으면: 누르면 파일 선택창이 뜸
 * - 이미지가 있으면: 누르면 바로 전체화면으로 덮음 (Esc 또는 클릭으로 해제)
 * 이미지는 서버에 안 올라가고 이 브라우저(localStorage)에만 저장돼요.
 */
function BossKey() {
  const [image, setImage] = useState(null)
  const [active, setActive] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setImage(saved)
    } catch {
      // localStorage 접근 안 되는 환경이면 그냥 무시
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActive(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [active])

  const handleButtonClick = () => {
    if (image) {
      setActive(true)
    } else {
      fileInputRef.current?.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result
      setImage(dataUrl)
      try {
        localStorage.setItem(STORAGE_KEY, dataUrl)
      } catch {
        // 용량 초과 등으로 저장 실패해도, 이번 세션에서는 그냥 보여줌
      }
      setActive(true)
    }
    reader.readAsDataURL(file)
    e.target.value = '' // 같은 파일 다시 선택해도 onChange 되게
  }

  const handleChangeImage = (e) => {
    e.stopPropagation()
    fileInputRef.current?.click()
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="boss-key-file-input"
      />

      <button
        type="button"
        className="boss-key-btn"
        onClick={handleButtonClick}
        title={image ? '상사 떴다! (Esc로 해제)' : '위장용 이미지 올리기'}
        aria-label="위장 화면 켜기"
      >
        🙈
      </button>

      {active && image && (
        <div className="boss-key-overlay" onClick={() => setActive(false)}>
          <img src={image} alt="" className="boss-key-image" />
          <button type="button" className="boss-key-change-btn" onClick={handleChangeImage}>
            이미지 변경
          </button>
        </div>
      )}
    </>
  )
}

export default BossKey
