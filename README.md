# 🎋 Bamboo Forest Biotech

바이오/제약 분야 익명 커뮤니티 플랫폼

> 말하고 싶어도 못하는 부분들을 자유롭게 나누는 공간
> 구직/이직 정보, 실험 방법, 회사 생활에 대한 실제 이야기

## 📌 프로젝트 개요

- **대상**: 바이오/제약 분야 종사자
- **컨셉**: 대나무숲 + 블라인드 스타일 익명 게시판
- **논의 주제**: 구직/이직 정보, 실험 방법, 회사 생활
- **상태**: 🚀 초기 개발 중

---

## 📊 배포 상태

| 구분 | URL | 상태 |
|------|-----|------|
| **프론트엔드** | https://bamboo-forest-biotech.vercel.app | ✅ 배포됨 |
| **백엔드 API** | https://bamboo-forest-biotech.onrender.com | ✅ 배포됨 |

---

## 🎯 주요 기능

### ✅ 완료
- [x] 기본 프론트엔드 구조 (React + Vite)
- [x] 기본 백엔드 구조 (Express)
- [x] Vercel 배포
- [x] Render 배포
- [x] API 연결

### 🔄 진행 중
- [ ] **인증 시스템** (회원가입/로그인)
  - [ ] JWT 토큰 기반 인증
  - [ ] 회원가입 엔드포인트 (`POST /api/auth/signup`)
  - [ ] 로그인 엔드포인트 (`POST /api/auth/login`)
  - [ ] 프론트엔드 로그인/회원가입 폼

### 📅 예정
- [ ] 게시판 기능 (게시글, 댓글)
- [ ] 좋아요 시스템
- [ ] 핫 글 순위 (최근/이달/올해 베스트)
- [ ] 카테고리 필터링
- [ ] 모바일 앱 (React Native)

---

## 🛠️ 기술 스택

| 구분 | 기술 | 배포 |
|------|------|------|
| **프론트엔드** | React 18 + Vite 5 | Vercel |
| **백엔드** | Node.js + Express 4 | Render |
| **데이터베이스** | PostgreSQL | (예정) |
| **인증** | JWT (jsonwebtoken) | - |
| **보안** | bcryptjs (비밀번호 암호화) | - |

---

## 📂 프로젝트 구조

```
bamboo-forest-biotech/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── index.js           # 메인 서버 파일
│   │   ├── routes/
│   │   │   ├── auth.js        # 인증 라우터 (회원가입/로그인)
│   │   │   └── health.js      # 헬스 체크
│   │   ├── db.js              # 데이터베이스 연결
│   │   └── middleware/
│   │       └── auth.js        # JWT 검증 미들웨어
│   ├── .env.example
│   └── package.json
├── frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── LoginForm.jsx  # 로그인 폼
│   │   │   └── SignupForm.jsx # 회원가입 폼
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.jsx
│   ├── .env.example
│   ├── .env.production        # 프로덕션 환경 변수
│   └── package.json
├── vercel.json                # Vercel 배포 설정
├── README.md
└── docs/
    ├── API.md                 # API 문서
    └── DATABASE.md            # DB 스키마
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

### 환경 변수 설정

**backend/.env**
```
DATABASE_URL=postgresql://user:password@localhost:5432/bamboo_forest
PORT=3001
NODE_ENV=development
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:5173
```

**frontend/.env.development**
```
VITE_API_URL=http://localhost:3001
```

**frontend/.env.production**
```
VITE_API_URL=https://bamboo-forest-biotech.onrender.com
```

---

## 📚 API 문서

### 헬스 체크
```
GET /api/health
```

### 인증 (진행 중)
```
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "username": "username"
}
→ Response: { token: "jwt_token", user: {...} }

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
→ Response: { token: "jwt_token", user: {...} }
```

자세한 API 문서는 [docs/API.md](./docs/API.md) 참고

---

## 📊 로드맵

### Phase 1: 인증 시스템 (진행 중)
- [x] 백엔드 기본 구조
- [ ] 회원가입 API
- [ ] 로그인 API
- [ ] JWT 토큰 관리
- [ ] 프론트엔드 인증 UI
- [ ] 토큰 저장 (localStorage)
- [ ] 인증 상태 관리

### Phase 2: 게시판 기능 (예정)
- [ ] 게시글 CRUD
- [ ] 댓글 CRUD
- [ ] 좋아요 기능
- [ ] 카테고리 필터링

### Phase 3: 핫 알고리즘 (예정)
- [ ] 인기 글 순위
- [ ] 조회수 추적
- [ ] 좋아요 기반 순위

### Phase 4: 고급 기능 (예정)
- [ ] 검색 기능
- [ ] 알림 시스템
- [ ] 모바일 앱
- [ ] 유료 기능

---

## 🔧 현재 진행 사항

### ✅ 2026-09-10 완료
- [x] React + Vite 프론트엔드 구성
- [x] Express 백엔드 구성
- [x] Vercel 배포 (프론트엔드)
- [x] Render 배포 (백엔드)
- [x] 프론트엔드 ↔ 백엔드 API 연결
- [x] 배포 환경 변수 설정

### 🔄 현재 진행 중
- [ ] JWT 기반 인증 시스템 구현

---

## 📝 라이선스

MIT

## 👥 기여

현재 개인 프로젝트입니다. 기여는 향후 열릴 예정입니다.

---

**상태**: 🚀 개발 중 | **마지막 업데이트**: 2026-09-10
