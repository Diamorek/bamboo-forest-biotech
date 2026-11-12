// 개인정보 처리방침에 들어가는 값들 — 바꿀 일이 있으면 이 파일만 고치면 돼요.

export const POLICY_EFFECTIVE_DATE = '2026.11.09' // 처리방침을 실제로 게시하는 날짜로 바꿔주세요
export const CONTACT_EMAIL = 'biobambooforest@gmail.com'
export const OFFICER = '운영자(Admin)' // 개인정보 보호책임자 (직책)

// 복구용 백업에 삭제한 정보가 남아 있을 수 있는 시간 (Neon 무료 플랜 기준 6시간 — 플랜을 바꾸면 같이 바꿔주세요)
export const BACKUP_HOURS = 6

// 탈퇴한 뒤 그 사람이 쓴 글·댓글을 어떻게 할지 (정한 방식에 맞게 문장을 고르세요 — 실제 처리와 같아야 해요)
export const WITHDRAWAL_POSTS_TEXT =
  '"탈퇴한 회원"으로 표시되어 남아요. 삭제를 원하는 글·댓글이 있으면 탈퇴를 요청할 때 함께 알려주시면 삭제해요.'

// 처리 위탁·국외 이전 대상 (서버/DB 위치: Neon·Render는 싱가포르, Vercel은 미국)
export const VENDORS = [
  {
    name: 'Neon (Databricks 계열)',
    task: '데이터베이스 보관',
    items: '아래 1항의 모든 정보',
    country: '싱가포르 (운영사 소재국: 미국)',
    url: 'https://neon.com/privacy-policy',
  },
  {
    name: 'Render Services, Inc.',
    task: '서버 운영',
    items: '이용자가 입력한 모든 정보, 접속 정보(IP 등)',
    country: '싱가포르 (운영사 소재국: 미국)',
    url: 'https://render.com/privacy',
  },
  {
    name: 'Vercel Inc.',
    task: '웹사이트 호스팅, 방문 통계',
    items: '접속 정보(IP 등), 방문 통계',
    country: '미국',
    url: 'https://vercel.com/legal/privacy-policy',
  },
]
