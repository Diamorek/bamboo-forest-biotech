// 운영자 알림 (디스코드/슬랙 웹훅)
// - NOTIFY_WEBHOOK_URL 이 없으면 아무것도 안 해요 (알림 꺼짐)
// - 호출하는 쪽은 await 하지 마세요. 실패하거나 느려도 예외를 던지지 않아요.

export function isNotifyEnabled() {
  return Boolean(process.env.NOTIFY_WEBHOOK_URL);
}

// 글자 수 자르기 (이모지가 반으로 잘리지 않게 글자 단위로 계산)
export function clip(text, max) {
  const chars = Array.from(String(text ?? ''));
  return chars.length > max ? chars.slice(0, max).join('') + '…' : chars.join('');
}

export function notifyOperator(message) {
  const url = process.env.NOTIFY_WEBHOOK_URL;
  if (!url) return;

  send(url, message).catch((err) => console.error('Notify error:', err.message));
}

async function send(url, message) {
  const isDiscord = /^https:\/\/(?:[a-z]+\.)?discord(?:app)?\.com\/api\/webhooks\//i.test(url);
  const text = String(message).slice(0, 1900);

  // 글 내용에 @everyone, <!channel> 같은 게 있어도 운영 채널이 울리지 않게 막아요
  const payload = isDiscord
    ? { content: text, allowed_mentions: { parse: [] } }
    : { text: text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) console.error(`Notify failed: HTTP ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}
