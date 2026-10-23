// backend/src/utils/notify.js
//
// 운영자에게 알림을 보내는 도우미 (디스코드 / 슬랙 웹훅)
//
// 쓰는 법: Render 환경변수에 NOTIFY_WEBHOOK_URL 을 넣으면 켜지고, 없으면 아무 일도 안 해요.
//  - 디스코드: 서버 설정 → 연동 → 웹후크 → 새 웹후크 → "웹후크 URL 복사"
//  - 슬랙:     Incoming Webhooks 앱에서 만든 URL
// (두 서비스 모두 받을 수 있도록 content/text 를 같이 보내요)
//
// 알림이 실패하거나 느려도 글쓰기/신고 같은 본 기능에는 절대 영향이 없게 만들었어요.

export function notifyOperator(message) {
  try {
    const url = process.env.NOTIFY_WEBHOOK_URL; // 호출 시점에 읽어야 .env 로딩 순서와 상관없이 동작
    if (!url) return;

    // 사용자가 쓴 글에 @everyone, <!channel> 같은 게 있어도 운영자 채널 전체를 호출하지 못하게 제거
    const clean = String(message).replace(/[@<>]/g, '').slice(0, 1800);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: clean, text: clean, allowed_mentions: { parse: [] } }),
      signal: controller.signal,
    })
      .catch((err) => console.error('Notify error:', err.message))
      .finally(() => clearTimeout(timer));
  } catch (err) {
    console.error('Notify error:', err.message);
  }
}
