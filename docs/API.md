# API Documentation

## 🔐 인증

### 회원가입
```
POST /api/auth/register
Content-Type: application/json

{
  "anonymousName": "대나무숲_123",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "anonymousName": "대나무숲_123",
  "token": "jwt_token"
}
```

### 로그인
```
POST /api/auth/login
Content-Type: application/json

{
  "anonymousName": "대나무숲_123",
  "password": "password123"
}

Response:
{
  "id": "uuid",
  "anonymousName": "대나무숲_123",
  "token": "jwt_token"
}
```

## 📝 게시글

### 게시글 목록
```
GET /api/posts?category=이직&page=1&limit=20
GET /api/posts/hot?period=week
GET /api/posts/hot?period=month
GET /api/posts/hot?period=year

Response:
{
  "data": [
    {
      "id": "uuid",
      "title": "제약사 현황",
      "content": "...",
      "category": "이직",
      "likesCount": 42,
      "commentsCount": 12,
      "viewsCount": 189,
      "createdAt": "2026-07-20T10:00:00Z",
      "author": "대나무숲_123"
    }
  ],
  "total": 100,
  "page": 1
}
```

### 게시글 작성
```
POST /api/posts
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "title": "제약사 이직 후기",
  "content": "...",
  "category": "이직"
}

Response:
{
  "id": "uuid",
  "title": "제약사 이직 후기",
  "content": "...",
  "category": "이직",
  "createdAt": "2026-07-20T10:00:00Z"
}
```

### 게시글 상세 조회
```
GET /api/posts/:id

Response:
{
  "id": "uuid",
  "title": "제약사 이직 후기",
  "content": "...",
  "category": "이직",
  "likesCount": 42,
  "commentsCount": 12,
  "viewsCount": 189,
  "createdAt": "2026-07-20T10:00:00Z",
  "comments": [
    {
      "id": "uuid",
      "content": "정보 감사합니다!",
      "likesCount": 5,
      "createdAt": "2026-07-20T11:00:00Z",
      "author": "대나무숲_456"
    }
  ]
}
```

## 💬 댓글

### 댓글 작성
```
POST /api/posts/:postId/comments
Authorization: Bearer jwt_token
Content-Type: application/json

{
  "content": "정보 감사합니다!"
}

Response:
{
  "id": "uuid",
  "postId": "uuid",
  "content": "정보 감사합니다!",
  "likesCount": 0,
  "createdAt": "2026-07-20T11:00:00Z"
}
```

### 댓글 삭제
```
DELETE /api/comments/:commentId
Authorization: Bearer jwt_token

Response:
{
  "message": "Comment deleted"
}
```

## 👍 좋아요

### 좋아요 추가
```
POST /api/posts/:postId/like
Authorization: Bearer jwt_token

Response:
{
  "likesCount": 43
}
```

### 좋아요 취소
```
DELETE /api/posts/:postId/like
Authorization: Bearer jwt_token

Response:
{
  "likesCount": 42
}
```

## 🔥 핫 글

### 이주 베스트
```
GET /api/posts/hot?period=week

Response:
{
  "data": [...],
  "period": "week"
}
```

### 이달 베스트
```
GET /api/posts/hot?period=month
```

### 올해 베스트
```
GET /api/posts/hot?period=year
```

## 🏥 헬스 체크
```
GET /api/health

Response:
{
  "status": "OK",
  "message": "Bamboo Forest API is running"
}
```