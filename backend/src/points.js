import pool from './db.js';

export const POINT_RULES = {
  visit: { points: 5, dailyLimit: 1 },
  post: { points: 20, dailyLimit: 2 },
  comment: { points: 3, dailyLimit: 10 },
};

export const LEVELS = [
  { level: 1, name: '대숲 아기씨', points: 0, badge: 'bamboo-baby' },
  { level: 2, name: '죽순 쪼꼬미', points: 50, badge: 'tiny-shoot' },
  { level: 3, name: '대숲 꼬물이', points: 150, badge: 'forest-cub' },
  { level: 4, name: '대나무 새싹', points: 350, badge: 'bamboo-sprout' },
  { level: 5, name: '대숲 수다쟁이', points: 700, badge: 'chatty-panda' },
  { level: 6, name: '대숲 단골곰', points: 1200, badge: 'regular-panda' },
  { level: 7, name: '지식 냠냠곰', points: 2000, badge: 'knowledge-panda' },
  { level: 8, name: '대숲 인기쟁이', points: 3200, badge: 'popular-panda' },
  { level: 9, name: '대숲 지킴이', points: 5000, badge: 'forest-keeper' },
  { level: 10, name: '대숲의 주인공', points: 8000, badge: 'forest-star' },
];

export function getLevel(totalPoints) {
  const points = Math.max(0, totalPoints);
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].points) return LEVELS[i];
  }
  return LEVELS[0];
}

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
export function getKoreaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

// 총점으로 현재 레벨, 다음 레벨까지 남은 점수, 진행률 계산
export function buildSummary(totalPoints) {
  const current = getLevel(totalPoints);
  const next = LEVELS.find((l) => l.level === current.level + 1) ?? null;
  const progress = next
    ? Math.floor(((totalPoints - current.points) / (next.points - current.points)) * 100)
    : 100;

  return {
    totalPoints,
    level: current.level,
    levelName: current.name,
    badge: current.badge,
    nextLevel: next
      ? {
          level: next.level,
          name: next.name,
          requiredPoints: next.points,
          remainingPoints: next.points - totalPoints,
        }
      : null,
    progress,
  };
}

export async function getPointSummary(userId) {
  const result = await pool.query(
    'SELECT total_points FROM user_point_stats WHERE user_id = $1',
    [userId]
  );
  return buildSummary(result.rows[0]?.total_points ?? 0);
}

/**
 * 포인트 지급 (모든 지급은 이 함수 하나로 통일)
 * - eventKey는 반드시 서버가 만든 값 (예: post:12, comment:30, visit:5:2026-10-23)
 * - 이력과 합계를 같은 트랜잭션에서 갱신
 */
export async function awardPoints({ userId, eventType, eventKey, referenceId = null, description = null }) {
  const rule = POINT_RULES[eventType];
  if (!rule) throw new Error(`알 수 없는 포인트 이벤트: ${eventType}`);

  // 이미 지급된 이벤트면 트랜잭션 없이 바로 종료 (방문 API가 자주 불려도 쿼리 1번)
  const already = await pool.query('SELECT 1 FROM point_history WHERE event_key = $1', [eventKey]);
  if (already.rowCount > 0) return { awarded: false, reason: 'duplicate' };

  const activityDate = getKoreaDate();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 통계 행을 만들면서 동시에 잠근다 → 같은 회원의 지급은 순서대로 처리됨
    const statsResult = await client.query(
      `INSERT INTO user_point_stats (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET user_id = EXCLUDED.user_id
       RETURNING total_points, current_level`,
      [userId]
    );
    const stats = statsResult.rows[0];

    const countResult = await client.query(
      `SELECT COUNT(*)::int AS count
       FROM point_history
       WHERE user_id = $1 AND event_type = $2 AND activity_date = $3 AND points > 0`,
      [userId, eventType, activityDate]
    );

    if (countResult.rows[0].count >= rule.dailyLimit) {
      await client.query('COMMIT');
      return {
        awarded: false,
        reason: 'daily_limit',
        totalPoints: stats.total_points,
        level: stats.current_level,
      };
    }

    const inserted = await client.query(
      `INSERT INTO point_history
         (user_id, event_type, points, event_key, activity_date, reference_id, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (event_key) DO NOTHING
       RETURNING id`,
      [userId, eventType, rule.points, eventKey, activityDate, referenceId, description]
    );

    if (inserted.rowCount === 0) {
      await client.query('COMMIT');
      return { awarded: false, reason: 'duplicate' };
    }

    const totalPoints = stats.total_points + rule.points;
    const level = getLevel(totalPoints);

    await client.query(
      `UPDATE user_point_stats
       SET total_points = $2, current_level = $3, updated_at = NOW()
       WHERE user_id = $1`,
      [userId, totalPoints, level.level]
    );

    await client.query('COMMIT');

    return {
      awarded: true,
      pointsEarned: rule.points,
      totalPoints,
      previousLevel: stats.current_level,
      level: level.level,
      levelName: level.name,
      badge: level.badge,
      leveledUp: level.level > stats.current_level,
    };
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Rollback error:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

// 포인트 지급이 실패해도 글/댓글 작성 자체는 성공 처리하기 위한 안전 버전
export async function awardPointsSafe(input) {
  try {
    return await awardPoints(input);
  } catch (err) {
    console.error('Award points error:', err);
    return { awarded: false, reason: 'error' };
  }
}
