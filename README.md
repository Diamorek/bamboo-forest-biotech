# 🎋 Bamboo Forest Biotech

바이오/제약 분야 익명 커뮤니티 플랫폼

> 말하고 싶어도 못하는 부분들을 자유롭게 나누는 공간
> 구직/이직 정보, 실험 방법, 회사 생활에 대한 실제 이야기

## 📌 프로젝트 개요

- **대상**: 바이오/제약 분야 종사자
- **컨셉**: 대나무숲 + 블라인드 스타일 익명 게시판
- **논의 주제**: 구직/이직 정보, 실험 방법, 회사 생활
- **상태**: 🚀 초기 개발 중

## 🎯 주요 기능 (계획)

- [x] 익명 회원가입/로그인
- [x] 게시판 (게시글, 댓글)
- [x] 좋아요 시스템
- [x] 핫 글 순위 (최근/이달/올해 베스트)
- [x] 카테고리 필터링
- [ ] 모바일 앱 (React Native)

## 🛠️ 기술 스택

| 구분 | 기술 | 배포 |
|------|------|------|
| **프론트엔드** | React + Vite | Vercel |
| **백엔드** | Node.js + Express | Railway |
| **데이터베이스** | PostgreSQL | Supabase |
| **인증** | JWT | - |

## 📂 프로젝트 구조

```
bamboo-forest-biotech/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── .env.example
│   └── package.json
├── frontend/             # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── hooks/
│   ├── .env.example
│   └── package.json
└── docs/                 # 문서
    ├── API.md
    └── DATABASE.md
```

## 🚀 빠른 시작

### 백엔드
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## 📊 로드맵

- **Phase 1**: 기본 게시판 기능 (2주)
- **Phase 2**: 핫 알고리즘 + 필터링 (1주)
- **Phase 3**: 모바일 앱 (4주)
- **Phase 4**: 유료 기능 추가

## 📝 라이선스

MIT

## 👥 기여

현재 개인 프로젝트입니다. 기여는 향후 열릴 예정입니다.

---

**상태**: 🚀 개발 중 | **마지막 업데이트**: 2026-07-20