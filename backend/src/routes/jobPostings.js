import express from 'express';
import pool from '../db.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const VALID_CATEGORIES = ['qa', 'qc', 'ra', 'production', 'rnd', 'clinical', 'etc'];
const VALID_REGIONS = ['seoul', 'gyeonggi', 'incheon', 'daejeon', 'chungbuk', 'busan', 'etc'];

// 이직 공고 목록 (마감 지난 공고는 숨기고, 가끔 백그라운드로 실제 삭제도 함께 수행)
router.get('/', async (req, res) => {
  try {
    if (Math.random() < 0.05) {
      pool.query(`
        DELETE FROM job_postings
        WHERE deadline < (timezone('Asia/Seoul', now())::date)
      `).catch(err => console.error('BG Delete Error:', err));
    }

    const result = await pool.query(
      `SELECT id, title, company, categories, region,
              to_char(deadline, 'YYYY-MM-DD') AS deadline,
              url, description
       FROM job_postings
       WHERE deadline >= (timezone('Asia/Seoul', now())::date)
       ORDER BY deadline ASC, id DESC`
    );
    res.json({ jobs: result.rows });
  } catch (err) {
    console.error('List job postings error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

// 이직 공고 등록 (admin만)
router.post('/', authMiddleware, async (req, res) => {
  const { title, company, categories, region, deadline, url, description } = req.body;

  try {
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.userId]);
    if (userResult.rows[0]?.role !== 'admin') {
      return res.status(403).json({ message: '운영자만 등록할 수 있습니다.' });
    }

    if (!title || !company || !Array.isArray(categories) || categories.length === 0 || !region || !deadline || !url) {
      return res.status(400).json({ message: '제목, 회사, 분류, 지역, 마감일, 링크를 모두 입력해주세요.' });
    }
    if (!categories.every((c) => VALID_CATEGORIES.includes(c))) {
      return res.status(400).json({ message: '유효하지 않은 분류가 포함되어 있습니다.' });
    }
    if (!VALID_REGIONS.includes(region)) {
      return res.status(400).json({ message: '유효하지 않은 지역입니다.' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
      return res.status(400).json({ message: '마감일은 YYYY-MM-DD 형식이어야 합니다.' });
    }
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ message: '링크는 http:// 또는 https://로 시작해야 합니다.' });
    }

    const result = await pool.query(
      `INSERT INTO job_postings (title, company, categories, region, deadline, url, description, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, title, company, categories, region,
                 to_char(deadline, 'YYYY-MM-DD') AS deadline, url, description`,
      [title, company, categories, region, deadline, url, description || '', req.user.userId]
    );

    res.status(201).json({ job: result.rows[0] });
  } catch (err) {
    if (err.code === '22008' || err.code === '22007') {
      return res.status(400).json({ message: '유효하지 않은 마감일입니다.' });
    }
    console.error('Create job posting error:', err);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
});

export default router;
