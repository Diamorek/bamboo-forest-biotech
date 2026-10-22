// 게시글 수정 (작성자 본인 / 운영자는 카테고리만)
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

export default router;
