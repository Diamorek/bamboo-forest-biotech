import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';
import { awardPointsSafe } from '../points.js';
import { notifyOperator, isNotifyEnabled, clip } from '../utils/notify.js';

const router = express.Router();

const VALID_CATEGORIES = ['job', 'experiment', 'worklife', 'free', 'news'];

// 신고 알림: 응답과 별개로 백그라운드에서 처리 (실패해도 신고 접수는 정상)
function notifyReport(postId) {
  if (!isNotifyEnabled()) return;

  pool
    .query(
      `SELECT p.title,
              (SELECT COUNT(*) FROM reports r WHERE r.post_id = p.id) AS report_count
       FROM posts p
       WHERE p.id = $1`,
      [postId]
    )
    .then((result) => {
      const row = result.rows[0];
      if (!row) return;
      notifyOperator(`🚩 신고 접수 — 게시글 #${postId} "${clip(row.title, 80)}" (누적 ${row.report_count}건)`);
    })
    .catch((err) => console.error('Report notify error:', err));
}

// 게시글 작성 (로그인 필요)
router.post('/', authMiddleware, async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ message: '제목, 본문, 카테고리를 모두 입력해주세요.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
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

    // 운영자 알림 (기다리지 않음: 알림이 느리거나 실패해도 글쓰기는 정상 처리)
    notifyOperator(
      `🆕 새 글 #${row.id} [${row.category}] ${clip(row.title, 80)}\n${clip(row.content, 100)}`
    );

    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.user.userId]);

    // 글이 정상 저장된 뒤에만 포인트 지급 (지급이 실패해도 글 작성은 성공 처리)
    const points = await awardPointsSafe({
      userId: req.user.userId,
      eventType: 'post',
      eventKey: `post:${row.id}`,
      referenceId: String(row.id),
      description: '게시글 작성',
    });

    res.status(201).json({
      post: {
        id: row.id,
        category: row.category,
        title: row.title,
        content: row.content,
        author: userResult.rows[0].username,
        authorLevel: points.level ?? null,
        createdAt: row.created_at,
        likeCount: row.like_count,
        commentCount: 0,
      },
      points,
    });
  } catch (err) {
    console.error('Create post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 목록 (카테고리 필터, 검색어 q 선택)
router.get('/', async (req, res) => {
  const { category } = req.query;
  const q = String(req.query.q || '').trim().slice(0, 50);

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
  }
  if (q && q.length < 2) {
    return res.status(400).json({ message: '검색어는 2글자 이상 입력해주세요.' });
  }

  try {
    const params = [];
    const conditions = [];

    if (category) {
      params.push(category);
      conditions.push(`p.category = $${params.length}`);
    }
    if (q) {
      // 검색어에 LIKE 특수문자(% _ \)가 있어도 글자 그대로 찾도록 이스케이프
      params.push(`%${q.replace(/[\\%_]/g, '\\$&')}%`);
      conditions.push(`(p.title ILIKE $${params.length} OR p.content ILIKE $${params.length})`);
    }

    // 검색할 때만 결과 개수를 제한 (기본 50건, 최대 100건)
    let limitClause = '';
    if (q) {
      const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 100);
      params.push(limit);
      limitClause = `LIMIT $${params.length}`;
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await pool.query(
      // 본문 전체 대신 앞 81글자만 가져와요 (미리보기 80자 + 더 있는지 확인용)
      `SELECT p.id, p.category, p.title, LEFT(p.content, 81) AS content_head, p.created_at, p.like_count, u.username,
              COALESCE(s.current_level, 1) AS author_level,
              (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.deleted_at IS NULL) AS comment_count
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN user_point_stats s ON s.user_id = p.user_id
       ${where}
       ORDER BY p.created_at DESC
       ${limitClause}`,
      params
    );

    const posts = result.rows.map((row) => ({
      id: row.id,
      category: row.category,
      title: row.title,
      preview: row.content_head.length > 80 ? row.content_head.slice(0, 80) + '...' : row.content_head,
      author: row.username,
      authorLevel: row.author_level,
      createdAt: row.created_at,
      commentCount: Number(row.comment_count),
      likeCount: row.like_count,
    }));

    // searched: true → 서버가 검색을 실제로 적용했다는 표시 (프론트가 확인용으로 사용)
    res.json(q ? { posts, searched: true } : { posts });
  } catch (err) {
    console.error('List posts error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 새 글 알림용 가벼운 통계 (로그인 불필요, 프론트가 1분마다 호출)
// 반드시 router.get('/:id') 보다 위에 있어야 해요 (아래에 두면 'stats'가 글 번호로 처리돼요)
router.get('/stats', async (req, res) => {
  res.set('Cache-Control', 'no-store');

  // sinceId가 없거나 숫자가 아니면 null → newCount는 0
  const raw = String(req.query.sinceId ?? '');
  const sinceId = /^\d{1,10}$/.test(raw) && Number(raw) <= 2147483647 ? Number(raw) : null;

  try {
    const result = await pool.query(
      `SELECT (SELECT COALESCE(MAX(id), 0) FROM posts) AS latest_id,
              (SELECT COUNT(*) FROM posts WHERE id > $1::int) AS new_count`,
      [sinceId]
    );
    const row = result.rows[0];
    res.json({ latestId: Number(row.latest_id), newCount: Number(row.new_count) });
  } catch (err) {
    console.error('Post stats error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 상세
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const postResult = await pool.query(
      `SELECT p.id, p.user_id, p.category, p.title, p.content, p.created_at, p.like_count, u.username,
              COALESCE(s.current_level, 1) AS author_level
       FROM posts p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN user_point_stats s ON s.user_id = p.user_id
       WHERE p.id = $1`,
      [id]
    );

    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const post = postResult.rows[0];

    const commentsResult = await pool.query(
      `SELECT c.id, c.user_id, c.parent_id, c.content, c.created_at, c.edited_at, c.deleted_at, u.username,
              COALESCE(s.current_level, 1) AS author_level
       FROM comments c
       JOIN users u ON u.id = c.user_id
       LEFT JOIN user_point_stats s ON s.user_id = c.user_id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [id]
    );

    res.json({
      id: post.id,
      authorId: post.user_id,
      category: post.category,
      title: post.title,
      content: post.content,
      author: post.username,
      authorLevel: post.author_level,
      createdAt: post.created_at,
      likeCount: post.like_count,
      // 삭제된 댓글은 내용/작성자를 아예 내려주지 않고 "삭제됨" 표시만 남겨요
      // parentId는 삭제된 댓글도 그대로 내려줘요 (답글 묶음에서 빠지지 않게)
      comments: commentsResult.rows.map((c) => ({
        id: c.id,
        parentId: c.parent_id,
        authorId: c.deleted_at ? null : c.user_id,
        author: c.deleted_at ? null : c.username,
        authorLevel: c.deleted_at ? null : c.author_level,
        content: c.deleted_at ? '' : c.content,
        createdAt: c.created_at,
        edited: Boolean(c.edited_at),
        deleted: Boolean(c.deleted_at),
      })),
    });
  } catch (err) {
    console.error('Get post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 수정 (작성자 본인 / 운영자는 타인 글의 카테고리만)
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { title, content, category } = req.body;

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ message: '유효하지 않은 카테고리입니다.' });
  }

  try {
    const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const isOwner = postResult.rows[0].user_id === req.user.userId;

    if (!isOwner) {
      const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
      const isAdmin = userResult.rows[0]?.role === 'admin';

      // 운영자는 타인 글의 카테고리만 변경 가능 (제목/본문은 작성자만)
      if (!isAdmin || !category || title !== undefined || content !== undefined) {
        return res.status(403).json({ message: '수정 권한이 없습니다.' });
      }
    }

    const result = await pool.query(
      `UPDATE posts
       SET title = COALESCE($1, title),
           content = COALESCE($2, content),
           category = COALESCE($3, category)
       WHERE id = $4
       RETURNING id, category, title, content, created_at, like_count`,
      [title, content, category, id]
    );

    res.json({ post: result.rows[0] });
  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 삭제 (작성자 본인 또는 admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const role = userResult.rows[0]?.role;
    const isOwner = postResult.rows[0].user_id === req.user.userId;

    if (!isOwner && role !== 'admin') {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('Delete post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 신고
router.post('/:id/report', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    await pool.query(
      'INSERT INTO reports (post_id, reporter_id) VALUES ($1, $2)',
      [id, req.user.userId]
    );

    // 운영자 알림 (기다리지 않음)
    notifyReport(id);

    res.status(201).json({ message: '신고가 접수되었습니다.' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ message: '이미 신고한 게시글이에요.' });
    }
    console.error('Report post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 작성 (로그인 필요) — body에 parentId를 보내면 대댓글(답글)
router.post('/:id/comments', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const content = (req.body.content || '').trim();

  if (!content) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ message: '댓글은 1000자 이하로 입력해주세요.' });
  }

  // parentId가 없으면(없음/null/빈 문자열) 맨 위 댓글, 있으면 대댓글
  const rawParent = req.body.parentId;
  let parentId = null;
  if (rawParent !== undefined && rawParent !== null && rawParent !== '') {
    const parentStr = String(rawParent);
    if (!/^\d{1,10}$/.test(parentStr) || Number(parentStr) < 1 || Number(parentStr) > 2147483647) {
      return res.status(400).json({ message: '답글을 달 댓글이 올바르지 않습니다.' });
    }
    parentId = Number(parentStr);
  }

  try {
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    if (parentId !== null) {
      const parentResult = await pool.query(
        'SELECT post_id, parent_id FROM comments WHERE id = $1',
        [parentId]
      );
      const parent = parentResult.rows[0];

      // 존재하는 댓글이고, 같은 글의 댓글이어야 해요
      // (부모가 삭제된 댓글이어도 허용: 삭제 표시 아래에 답글이 이어져요)
      if (!parent || parent.post_id !== postResult.rows[0].id) {
        return res.status(400).json({ message: '답글을 달 댓글을 찾을 수 없습니다.' });
      }
      // 맨 위 댓글(parent_id가 비어 있는 댓글)에만 답글 가능 (1단계까지)
      if (parent.parent_id !== null) {
        return res.status(400).json({ message: '답글에는 다시 답글을 달 수 없습니다.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO comments (post_id, user_id, content, parent_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, content, created_at, parent_id`,
      [id, req.user.userId, content, parentId]
    );
    const row = result.rows[0];

    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.user.userId]);

    // 댓글이 정상 저장된 뒤에만 포인트 지급 (대댓글도 일반 댓글과 같은 규칙, 실패해도 작성은 성공 처리)
    const points = await awardPointsSafe({
      userId: req.user.userId,
      eventType: 'comment',
      eventKey: `comment:${row.id}`,
      referenceId: String(row.id),
      description: '댓글 작성',
    });

    res.status(201).json({
      comment: {
        id: row.id,
        parentId: row.parent_id,
        authorId: req.user.userId,
        author: userResult.rows[0].username,
        authorLevel: points.level ?? null,
        content: row.content,
        createdAt: row.created_at,
        edited: false,
        deleted: false,
      },
      points,
    });
  } catch (err) {
    console.error('Create comment error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 게시글 좋아요 토글 (로그인 필요) — 이미 눌렀으면 취소, 안 눌렀으면 추가
router.post('/:id/like', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const postResult = await pool.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }

    const removed = await pool.query(
      'DELETE FROM likes WHERE post_id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.userId]
    );

    let liked;
    if (removed.rows.length > 0) {
      await pool.query('UPDATE posts SET like_count = like_count - 1 WHERE id = $1', [id]);
      liked = false;
    } else {
      const added = await pool.query(
        `INSERT INTO likes (post_id, user_id) VALUES ($1, $2)
         ON CONFLICT (post_id, user_id) DO NOTHING RETURNING id`,
        [id, req.user.userId]
      );
      if (added.rows.length > 0) {
        await pool.query('UPDATE posts SET like_count = like_count + 1 WHERE id = $1', [id]);
      }
      liked = true;
    }

    const countResult = await pool.query('SELECT like_count FROM posts WHERE id = $1', [id]);
    res.json({ liked, likeCount: countResult.rows[0].like_count });
  } catch (err) {
    console.error('Like post error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 수정 (작성자 본인만) — 수정되면 화면에 "(수정됨)"이 붙어요
router.patch('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  const { id, commentId } = req.params;
  const content = (req.body.content || '').trim();

  if (!content) {
    return res.status(400).json({ message: '댓글 내용을 입력해주세요.' });
  }
  if (content.length > 1000) {
    return res.status(400).json({ message: '댓글은 1000자 이하로 입력해주세요.' });
  }

  try {
    const found = await pool.query(
      'SELECT user_id, deleted_at FROM comments WHERE id = $1 AND post_id = $2',
      [commentId, id]
    );
    if (found.rows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    if (found.rows[0].deleted_at) {
      return res.status(400).json({ message: '삭제된 댓글은 수정할 수 없습니다.' });
    }
    if (found.rows[0].user_id !== req.user.userId) {
      return res.status(403).json({ message: '수정 권한이 없습니다.' });
    }

    const result = await pool.query(
      `UPDATE comments SET content = $1, edited_at = NOW()
       WHERE id = $2
       RETURNING id, content, created_at, parent_id,
                 COALESCE((SELECT current_level FROM user_point_stats WHERE user_id = comments.user_id), 1) AS author_level`,
      [content, commentId]
    );
    const row = result.rows[0];

    const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [req.user.userId]);

    res.json({
      comment: {
        id: row.id,
        parentId: row.parent_id,
        authorId: req.user.userId,
        author: userResult.rows[0].username,
        authorLevel: row.author_level,
        content: row.content,
        createdAt: row.created_at,
        edited: true,
        deleted: false,
      },
    });
  } catch (err) {
    console.error('Update comment error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 댓글 삭제 (작성자 본인 또는 admin) — 실제로 지우지 않고 "삭제된 댓글입니다."로 흔적을 남겨요
router.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  const { id, commentId } = req.params;

  try {
    const found = await pool.query(
      'SELECT user_id, deleted_at FROM comments WHERE id = $1 AND post_id = $2',
      [commentId, id]
    );
    if (found.rows.length === 0) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }
    if (found.rows[0].deleted_at) {
      return res.json({ message: '이미 삭제된 댓글입니다.' });
    }

    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    const role = userResult.rows[0]?.role;
    const isOwner = found.rows[0].user_id === req.user.userId;

    if (!isOwner && role !== 'admin') {
      return res.status(403).json({ message: '삭제 권한이 없습니다.' });
    }

    await pool.query('UPDATE comments SET deleted_at = NOW() WHERE id = $1', [commentId]);
    res.json({ message: '삭제되었습니다.' });
  } catch (err) {
    console.error('Delete comment error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
