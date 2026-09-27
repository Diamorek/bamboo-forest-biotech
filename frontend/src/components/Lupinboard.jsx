export const JOB_CATEGORIES = [
  { id: 'qa', label: 'QA' },
  { id: 'qc', label: 'QC' },
  { id: 'ra', label: 'RA/인허가' },
  { id: 'production', label: '생산' },
  { id: 'rnd', label: '연구개발' },
  { id: 'clinical', label: '임상' },
  { id: 'etc', label: '기타' },
]

export function categoryLabel(id) {
  return JOB_CATEGORIES.find((c) => c.id === id)?.label ?? id
}

// 백엔드 /api/job-postings 붙기 전까지 화면 확인용 목업. 실제 연결되면 지워도 됨.
export const MOCK_JOBS = [
  {
    id: 1,
    title: 'QC 애널리스트 (HPLC/역가시험)',
    company: '(주)그린바이오',
    category: 'qc',
    deadline: '2026-10-15',
    url: 'https://example.com',
    description: '바이오시밀러 품질관리, 3년 이상 경력 우대',
  },
  {
    id: 2,
    title: 'RA 인허가 담당자',
    company: '메디팜',
    category: 'ra',
    deadline: '2026-10-05',
    url: 'https://example.com',
    description: '식약처 품목허가, 변경보고 경험자',
  },
  {
    id: 3,
    title: '세포치료제 연구원',
    company: '셀바이오텍',
    category: 'rnd',
    deadline: '2026-10-20',
    url: 'https://example.com',
    description: 'CGT 파이프라인 초기 연구',
  },
]
