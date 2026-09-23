import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 게시글 작성 (로그인 필요)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;
  const validCategories = ['job', 'experiment', 'worklife'];

  if (!title || !content || !category) {
    return res.status(400).json({ message: '제목, 본문, 카테고리를 모두 입력해주세요.' });
  }
  if (!validCategories.includes(category)) {
    return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO posts (user_id, category, title, content)
       VALUES ($1, $2, $3, $4)
       RETURNING id, category, title, content, created_at, like_count`,
      [req.user.userId, category, title, content]
    );
    const row = result.rows[0];

    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.user.userId]);

    res.status(201).json({
      post: {
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        author: userResult.rows[0].username,
        createdAt: row.created_at,
        likeCount: row.like_count,
        commentCount: 0,
      },
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 목록 (카테고리 필터 선택)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const validCategories = ['job', 'experiment', 'worklife'];

  if (category && !validCategories.includes(category)) {
    return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
  }

  try {
    const params = [];
    let where = '';
    if (category) {
      params.push(category);
      where = 'WHERE p.category = $1';
    }

    const result = await pool.query(
      `SELECT p.id, p.category, p.title, p.content, p.created_at, p.like_count, u.username,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       ${where}
       ORDER BY p.created_at DESC`,
      params
    );

    const posts = result.rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      preview: row.content.length > 80 ? row.content.slice(0, 80) + '...' : row.content,
      author: row.username,
      createdAt: row.created_at,
      commentCount: Number(row.comment_count),
      likeCount: row.like_count,
    }));

    res.json({ posts });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const postResult = await pool.query(
      `SELECT p.id, p.category, p.title, p.content, p.created_at, p.like_count, u.username
       FROM posts p
       JOIN users u ON u.id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const post = postResult.rows[0];

    const commentsResult = await pool.query(
      `SELECT c.id, c.content, c.created_at, u.username
       FROM comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({
      id: post.id,
      category: post.category,
      title: post.title,
      content: post.content,
      author: post.username,
      createdAt: post.created_at,
      likeCount: post.like_count,
      comments: commentsResult.rows.map((c) => ({
        id: c.id,
        author: c.username,
        content: c.content,
        createdAt: c.created_at,
      })),
    });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
