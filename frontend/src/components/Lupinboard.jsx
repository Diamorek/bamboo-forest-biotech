import './LupinBoard.css'

// 관리 편의를 위해 그냥 배열로 관리. 나중에 항목 추가/삭제는 이 배열만 고치면 됨.
const LUPIN_SECTIONS = [
  {
    label: '💻 일하는 척 완벽 위장형',
    items: [
      { name: 'DeepL 번역기', url: 'https://www.deepl.com/', desc: '업무용 화면처럼 보여서 멍 때리기 가장 좋음' },
      { name: 'Google Keep', url: 'https://keep.google.com/', desc: '개인 낙서도 기획서 정리처럼 보임' },
      { name: '국가통계포털 (KOSIS)', url: 'https://kosis.kr/', desc: '그래프/숫자 가득해서 시장조사 중처럼 보임' },
    ],
  },
  {
    label: '🎮 초성·단어 맞히기',
    items: [
      { name: '꼬맨틀', url: 'https://semantle-ko.newsjel.ly/', desc: '단어 유사도로 정답 추리, 텍스트만 나열돼서 안전' },
      { name: 'Wordle', url: 'https://www.nytimes.com/games/wordle/index.html', desc: '5글자 영단어 6번 안에 맞히기' },
    ],
  },
  {
    label: '🐭 마우스 클릭 미니 웹게임',
    items: [
      { name: '월급루팡연구소', url: 'https://lupin-lab.co.kr/', desc: '직장인 맞춤 미니게임 20여 종 모음' },
      { name: '사과게임 (과일박스)', url: 'https://www.gamesaien.com/game/fruit_box_a/', desc: '숫자 합 10 만들기, 조용한 드래그 게임' },
      { name: '수박게임', url: 'https://suika-game.app/ko', desc: '과일 합쳐서 수박 만들기, 중독성 주의' },
    ],
  },
  {
    label: '🌍 멍 때리기 & 힐링형',
    items: [
      { name: 'WindowSwap', url: 'https://www.window-swap.com/', desc: '전 세계 창밖 풍경 무작위로 보기' },
    ],
  },
]

function LupinBoard() {
  return (
    <div className="board-wrap">
      <p className="lupin-intro">
        조용히 즐길 수 있는 사이트 모음이에요. 상사 오면 Alt+Tab 잊지 마세요 🙏
      </p>

      {LUPIN_SECTIONS.map((section, i) => (
        <section key={section.label} className="lupin-section">
          <h2 className="lupin-section-title">{section.label}</h2>
          <ul className="lupin-list">
            {section.items.map((item) => (
              <li key={item.url}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lupin-item"
                >
                  <span className="lupin-item-name">{item.name} ↗</span>
                  <span className="lupin-item-desc">{item.desc}</span>
                </a>
              </li>
            ))}
          </ul>
          {i < LUPIN_SECTIONS.length - 1 && <div className="bamboo-divider" />}
        </section>
      ))}
    </div>
  )
}

export default LupinBoard
