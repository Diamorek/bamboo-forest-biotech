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
      { name: '꼬들', url: 'https://kordle.kr/', desc: '한국어 워들, 6번 안에 단어 맞히기' },
      { name: '꼬오오오오들', url: 'https://koooo.kordle.kr/', desc: '꼬들의 확장판, 더 긴 단어로 도전' },
      { name: 'Wordle', url: 'https://www.nytimes.com/games/wordle/index.html', desc: '5글자 영단어 6번 안에 맞히기' },
      { name: 'Nerdle', url: 'https://nerdlegame.com/', desc: '숫자·수식 버전 워들, 계산식 6번 안에 맞히기' },
      { name: '포켓들', url: 'https://pockedle.vercel.app/', desc: '포켓몬 이름 맞히기 버전 워들' },
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
  {
    label: '📝 취업 준비',
    items: [
      {
        name: '신역검 연습장',
        url: 'https://www.yeokgeom.com/',
        desc: 'AI역량검사(신역검) 게임 9종 무료·무제한 연습 (비공식 연습 도구)',
      },
    ],
  },
  {
    // compact: true → 설명 없이 이름만 칩 모양으로 촘촘하게 보여줘요 (20개라 길어지지 않게)
    label: '🏢 제약·바이오 TOP 20 채용 사이트',
    note: '2026.10.13 기준으로 정리한 목록이에요. 주소가 바뀌었거나 안 열리면 하단 문의 메일로 알려주세요.',
    compact: true,
    items: [
      { name: '삼성바이오로직스', url: 'https://www.samsungcareers.com' },
      { name: '셀트리온', url: 'https://celltrion.recruiter.co.kr' },
      { name: '알테오젠', url: 'https://www.alteogen.com' },
      { name: 'SK바이오팜', url: 'https://www.skcareers.com' },
      { name: '에이비엘바이오', url: 'https://www.ablbio.com' },
      { name: '리가켐바이오', url: 'https://ligachembio.ninehire.site' },
      { name: '삼성바이오에피스', url: 'https://www.samsungcareers.com' },
      { name: 'HLB', url: 'https://hlb-group.career.greetinghr.com' },
      { name: 'SK바이오사이언스', url: 'https://www.skcareers.com' },
      { name: '유한양행', url: 'https://yuhan.recruiter.co.kr' },
      { name: '종근당', url: 'https://ckd.recruiter.co.kr' },
      { name: '한미약품', url: 'https://hanmi.recruiter.co.kr' },
      { name: '대웅제약', url: 'https://daewoong.recruiter.co.kr' },
      { name: 'GC녹십자', url: 'https://recruit.gccorp.com' },
      { name: '보령', url: 'https://recruit.boryung.co.kr' },
      { name: '동국제약', url: 'https://dkpharm.recruiter.co.kr' },
      { name: '파마리서치', url: 'https://pharmaresearch_hr.career.greetinghr.com' },
      { name: '휴젤', url: 'https://hugel.career.greetinghr.com' },
      { name: 'HK이노엔', url: 'https://kolmar.recruiter.co.kr' },
      { name: '오스코텍', url: 'http://www.oscotec.com' },
    ],
  },
]

function LupinBoard() {
  return (
    <div className="board-wrap">
      <p className="lupin-intro">
        조용히 즐길 수 있는 사이트와 취업 준비 링크 모음이에요. 상사 오면 Alt+Tab 잊지 마세요 🙏
      </p>

      {LUPIN_SECTIONS.map((section, i) => (
        <section key={section.label} className="lupin-section">
          <h2 className="lupin-section-title">{section.label}</h2>
          {section.note && <p className="lupin-section-note">{section.note}</p>}

          {section.compact ? (
            <ul className="lupin-chip-grid">
              {section.items.map((item) => (
                // 삼성·SK처럼 한 사이트를 여러 회사가 같이 쓰는 경우가 있어서 key는 이름으로
                <li key={item.name}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lupin-chip"
                  >
                    {item.name} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
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
          )}
          {i < LUPIN_SECTIONS.length - 1 && <div className="bamboo-divider" />}
        </section>
      ))}
    </div>
  )
}

export default LupinBoard
