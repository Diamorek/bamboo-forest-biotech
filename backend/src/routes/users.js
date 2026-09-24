import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// 내 정보 조회
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 닉네임 변경
router.patch('/me', authMiddleware, async (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  }
  if (username.length > 50) {
    return res.status(400).json({ message: '닉네임은 50자 이하로 입력해주세요.' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email',
      [username, req.user.userId]
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    // unique 제약 위반 (username UNIQUE)
    if (err.code === '23505') {
      return res.status(409).json({ message: '이미 사용 중인 닉네임이에요.' });
    }
    console.error('Update username error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
