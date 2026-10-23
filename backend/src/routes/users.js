import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { LEVELS, getKoreaDate, getPointSummary, awardPointsSafe } from '../points.js';

const router = express.Router();

// 레벨표 (로그인 불필요, 프론트가 한 번 받아서 배지 이름/이미지 매핑에 사용)
router.get('/levels', (req, res) => {
  res.json({
    levels: LEVELS.map((l) => ({
      level: l.level,
      name: l.name,
      requiredPoints: l.points,
      badge: l.badge,
    })),
  });
});

// 내 정보 조회
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
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
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email, role',
      [username, req.user.userId]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: '이미 사용 중인 닉네임이에요.' });
    }
    console.error('Update username error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 하루 첫 방문 포인트 (앱을 열 때 / 로그인·가입 직후 프론트가 호출, 여러 번 불려도 하루 1회만 지급)
router.post('/me/visit', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const points = await awardPointsSafe({
    userId,
    eventType: 'visit',
    eventKey: `visit:${userId}:${getKoreaDate()}`,
    description: '하루 첫 방문',
  });
  res.json({ points });
});

// 내 포인트와 레벨
router.get('/me/points', authMiddleware, async (req, res) => {
  try {
    res.json(await getPointSummary(req.user.userId));
  } catch (err) {
    console.error('Get points error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 내 포인트 활동 내역 (최신순, 기본 20건 / 최대 50건)
router.get('/me/points/history', authMiddleware, async (req, res) => {
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 50);

  try {
    const result = await pool.query(
      `SELECT id, event_type, points, description, reference_id, created_at
       FROM point_history
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2`,
      [req.user.userId, limit]
    );

    res.json({
      history: result.rows.map((r) => ({
        id: Number(r.id),
        type: r.event_type,
        points: r.points,
        description: r.description,
        referenceId: r.reference_id,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error('Get point history error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
