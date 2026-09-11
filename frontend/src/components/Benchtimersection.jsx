import './BenchTimerSection.css'

const BENCHTICK_URL = 'https://benchtick-2c0b0.web.app/'

/**
 * 실험실 타이머(BenchTick) 임베드 섹션.
 * 타이머 자체는 로그인 없이 쓸 수 있지만, "오늘 할일" 기능은 Google 로그인이 필요해요.
 * Google은 iframe 안에서의 로그인을 막기 때문에, 그 기능은 새 탭 링크로 안내합니다.
 */
function BenchTimerSection() {
  return (
    <section className="benchtick-section">
      <div className="benchtick-header">
        <h2 className="section-title">🧪 실험실 타이머</h2>
        <a
          href={BENCHTICK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-text"
        >
          새 탭에서 전체 기능으로 열기 ↗
        </a>
      </div>

      <div className="benchtick-frame-wrap">
        <iframe
          src={BENCHTICK_URL}
          title="BenchTick 실험 타이머"
          className="benchtick-frame"
          allow="clipboard-write"
        />
      </div>

      <p className="benchtick-note">
        타이머는 바로 사용할 수 있어요. "오늘 할일" 로그인은 새 탭에서 진행해주세요 —
        구글 정책상 이 화면 안에서는 로그인이 되지 않아요.
      </p>
    </section>
  )
}

export default BenchTimerSection
