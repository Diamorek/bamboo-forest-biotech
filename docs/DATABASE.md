# Database Schema

## 📊 테이블 구조

### 1. users (사용자)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_name VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2. posts (게시글)
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- 구직, 이직, 실험, 회사생활
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. comments (댓글)
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4. likes (좋아요)
```sql
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);
```

## 🔍 인덱스

```sql
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_created_at ON posts(created_at);
CREATE INDEX idx_posts_likes_count ON posts(likes_count);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
```

## 🔥 핫 글 알고리즘

```sql
-- 이주 베스트
SELECT * FROM posts 
WHERE created_at >= DATE_TRUNC('week', NOW())
ORDER BY likes_count DESC, comments_count DESC, views_count DESC
LIMIT 10;

-- 이달 베스트
SELECT * FROM posts 
WHERE created_at >= DATE_TRUNC('month', NOW())
ORDER BY likes_count DESC, comments_count DESC, views_count DESC
LIMIT 10;

-- 올해 베스트
SELECT * FROM posts 
WHERE created_at >= DATE_TRUNC('year', NOW())
ORDER BY likes_count DESC, comments_count DESC, views_count DESC
LIMIT 10;

-- 실시간 핫
SELECT * FROM posts 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY (likes_count + comments_count * 2 + views_count * 0.1) DESC
LIMIT 10;
```
