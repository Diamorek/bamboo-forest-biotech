# 🎋 바이오대나무숲 (Bio Bamboo Forest)

바이오/제약 분야 익명 커뮤니티 플랫폼

> 말하고 싶어도 못하는 부분들을 자유롭게 나누는 공간
> 구직/이직 정보, 실험 방법, 회사 생활에 대한 실제 이야기

## 📌 프로젝트 개요

- **대상**: 바이오/제약 분야 종사자
- **컨셉**: 대나무숲 + 블라인드 스타일 익명 게시판
- **논의 주제**: 구직/이직 정보, 실험 방법, 회사 생활, 이직공고
- **상태**: 🚀 베타 운영 중 (핵심 기능 반영 완료)

---

## 📊 배포 상태

| 구분 | URL | 상태 |
|------|-----|------|
| **프론트엔드** | https://bamboo-forest-biotech.vercel.app | ✅ 배포됨 |
| **백엔드 API** | https://bamboo-forest-biotech.onrender.com | ✅ 배포됨 |
| **DB** | Neon (PostgreSQL) | ✅ 이전 완료 |

문의사항 · 신고 · 이직공고 문의: **biobambooforest@gmail.com**

---

## 🎯 주요 기능

### ✅ 완료
- [x] 회원가입 / 로그인 (JWT 인증)
- [x] 닉네임 변경 (설정 화면)
- [x] 게시판: 글쓰기 / 목록 / 상세 / 수정 / 삭제
  - [x] 카테고리: 구직/이직, 실험 방법, 회사 생활
  - [x] 댓글
  - [x] 좋아요 (토글)
  - [x] 신고
  - [x] 본인 글 수정·삭제, 운영자(admin) 권한으로 타인 글 삭제
- [x] 이직공고 게시판 (관리자 전용 등록)
  - [x] 직무 분류 다중 선택 (QA / QC / RA·인허가 / 생산 / 연구개발 / 임상 / 기타)
  - [x] 지역 선택 (서울 / 경기 / 인천 / 대전 / 충북 / 부산·경남 / 기타)
  - [x] 리스트 뷰 (D-day 표시) / 달력 뷰
- [x] 월루 게시판 (직장인용 딴짓 사이트 링크 모음)
- [x] 실험실 타이머 (BenchTick 임베드)
- [x] 페이지 하단 문의/신고 안내 (Footer)
- [x] Vercel + Render 배포, Neon DB 이전
- [x] Google Search Console 소유권 인증

### 📅 예정
- [ ] 핫 글 순위 (최근/이달/올해 베스트)
- [ ] 좋아요 여부 페이지 로드 시 즉시 반영 (현재는 새로고침 시 버튼 상태 초기화, 카운트는 정상 반영)
- [ ] 신고 게시글 모아보는 운영자 페이지
- [ ] 검색 기능
- [ ] 알림 시스템
- [ ] 모바일 앱 (React Native)

---

## 🛠️ 기술 스택

| 구분 | 기술 | 배포 |
|------|------|------|
| **프론트엔드** | React 18 + Vite 5 | Vercel |
| **백엔드** | Node.js + Express 4 (ESM) | Render |
| **데이터베이스** | PostgreSQL (Neon) | Neon |
| **인증** | JWT (jsonwebtoken) | - |
| **보안** | bcryptjs (비밀번호 암호화) | - |

---

## 📂 프로젝트 구조

```
bamboo-forest-biotech/
├── backend/
│   ├── src/
│   │   ├── index.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── posts.js          # 게시글/댓글/좋아요/신고
│   │   │   ├── jobPostings.js    # 이직공고
│   │   │   └── health.js
│   │   ├── db.js
│   │   └── middleware/
│   │       └── auth.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx / SignupForm.jsx / AuthForm.css
│   │   │   ├── BoardList.jsx / PostDetail.jsx / PostForm.jsx / Board.css
│   │   │   ├── JobBoard.jsx / JobPostForm.jsx / jobBoardData.js / JobBoard.css
│   │   │   ├── LupinBoard.jsx / LupinBoard.css
│   │   │   ├── BenchTimerSection.jsx / BenchTimerSection.css
│   │   │   ├── SettingsForm.jsx / SettingsForm.css
│   │   │   ├── TopNav.jsx / TopNav.css
│   │   │   ├── Footer.jsx / Footer.css
│   │   │   └── BambooIcon.jsx
│   │   ├── styles/
│   │   │   └── theme.css         # 디자인 토큰 (색상/폰트/공용 스타일)
│   │   ├── utils/
│   │   │   ├── auth.js           # 로그인 세션 저장/조회
│   │   │   └── formatDate.js     # 상대 시간 포맷("n시간 전")
│   │   └── App.jsx
│   ├── .env.production
│   └── package.json
├── vercel.json
└── README.md
```

---

## 🚀 빠른 시작

### 백엔드 로컬 개발
```bash
cd backend
npm install
cp .env.example .env
# .env 파일 수정 (DATABASE_URL, JWT_SECRET 등)
npm run dev
# http://localhost:3001 에서 실행
```

### 프론트엔드 로컬 개발
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173 에서 실행
```

### 환경 변수

**backend/.env**
```
DATABASE_URL=<Neon PostgreSQL 연결 문자열>
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**frontend/.env.production**
```
VITE_API_URL=https://bamboo-forest-biotech.onrender.com
```

---

## 📚 API 개요

인증, 게시글, 이직공고 관련 엔드포인트는 `backend/src/routes/` 안 각 파일에 정리되어 있어요. 주요 응답은 에러 시 `{ "message": "..." }` 형태로 통일되어 있습니다.

| 영역 | 엔드포인트 |
|------|-----------|
| 인증 | `POST /api/auth/signup`, `POST /api/auth/login` |
| 내 정보 | `GET /api/users/me`, `PATCH /api/users/me` (닉네임 변경) |
| 게시글 | `GET/POST /api/posts`, `GET/PATCH/DELETE /api/posts/:id` |
| 댓글 | `POST /api/posts/:id/comments` |
| 좋아요 | `POST /api/posts/:id/like` (토글) |
| 신고 | `POST /api/posts/:id/report` |
| 이직공고 | `GET/POST /api/job-postings` (등록은 관리자만) |

---

## 👥 팀

- 프론트엔드: 다이어모어
- 백엔드: 별도 담당자 (Render → Neon 전환, TablePlus로 DB 관리)

---

## 📝 라이선스

MIT

---

**상태**: 🚀 베타 운영 중 | **마지막 업데이트**: 2026-09-30
