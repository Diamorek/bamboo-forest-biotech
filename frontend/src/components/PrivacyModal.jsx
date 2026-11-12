import { useEffect } from 'react'
import { closePrivacyPolicy, usePrivacyOpen } from '../utils/privacy'
import {
  BACKUP_HOURS,
  CONTACT_EMAIL,
  OFFICER,
  POLICY_EFFECTIVE_DATE,
  VENDORS,
  WITHDRAWAL_POSTS_TEXT,
} from './privacyConfig'
import './Privacy.css'

/** 개인정보 처리방침 팝업. App에 한 번만 넣어두면 어디서든 열려요. */
function PrivacyModal() {
  const isOpen = usePrivacyOpen()

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closePrivacyPolicy()
    }
    window.addEventListener('keydown', onKeyDown)

    // 팝업이 열려 있는 동안 뒤 화면이 같이 스크롤되지 않게 잠가요
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="privacy-overlay" onClick={closePrivacyPolicy}>
      <div
        className="privacy-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="privacy-modal__header">
          <h2 id="privacy-title">🌳 바이오대나무숲 개인정보 처리방침</h2>
          <button type="button" className="btn-text" onClick={closePrivacyPolicy}>
            닫기
          </button>
        </div>

        <div className="privacy-modal__body">
          <p className="privacy-date">시행일: {POLICY_EFFECTIVE_DATE}</p>

          <h3>1. 수집 항목과 이용 목적</h3>
          <ul>
            <li>필수: 이메일(로그인 식별·계정 관리), 닉네임(서비스 내 활동 표시), 비밀번호(로그인 인증, 일방향 암호화 저장)</li>
            <li>서비스 이용 중 생성: 작성한 글·댓글, 좋아요·신고 내역, 포인트·레벨, 방문 일자</li>
            <li>
              자동 생성: IP 주소, 접속 일시, 브라우저 정보 등이 서비스 안정성 유지와 부정 이용(디도스·스팸) 방지를 위해
              Vercel·Render 인프라에서 자동으로 생성·처리될 수 있어요. 글과 댓글에는 작성자의 IP를 저장하지 않아요.
            </li>
            <li>만 14세 미만은 가입할 수 없어요.</li>
          </ul>

          <h3>2. 보유 기간과 파기</h3>
          <ul>
            <li>회원 탈퇴 시까지 보유하며, 삭제 요청을 받은 날부터 5일 이내에 파기해요.</li>
            <li>탈퇴 후 작성한 글·댓글: {WITHDRAWAL_POSTS_TEXT}</li>
            <li>데이터베이스의 복구용 기록에는 삭제 후에도 최대 {BACKUP_HOURS}시간 남을 수 있고, 그 뒤에 사라져요.</li>
            <li>법령에 따라 보관해야 하는 정보는 해당 기간 동안 보관해요.</li>
          </ul>

          <h3>3. 제3자 제공</h3>
          <p>동의 없이 제3자에게 제공하지 않아요. 단, 법령에 따른 요청이 있는 경우는 예외예요.</p>

          <h3>4. 처리 위탁과 국외 이전</h3>
          <p>서비스 운영을 위해 아래 업체에 맡기고 있고, 모두 해외에서 처리돼요.</p>
          <ul className="privacy-vendors">
            {VENDORS.map((v) => (
              <li key={v.name}>
                <strong>{v.name}</strong> — {v.task}
                <br />
                이전 항목: {v.items} · 이전 국가: {v.country}
                <br />
                개인정보 문의:{' '}
                <a href={v.url} target="_blank" rel="noopener noreferrer">
                  {v.name.split(' (')[0]} 개인정보 처리방침
                </a>
              </li>
            ))}
          </ul>
          <ul>
            <li>이전 시기·방법: 서비스를 이용할 때 네트워크(HTTPS)로 수시 전송</li>
            <li>이전받는 자의 이용 목적·보유 기간: 위 업무 수행 목적, 회원 탈퇴 또는 위탁 종료 시까지</li>
            <li>국외 이전을 원하지 않으면 가입하지 않거나 탈퇴를 요청할 수 있어요. 이 경우 서비스 이용이 제한돼요.</li>
          </ul>

          <h3>5. 이용자의 권리</h3>
          <p>
            언제든지 본인 정보의 열람·정정·삭제·처리정지를 요구할 수 있어요. 방법: {CONTACT_EMAIL} 으로 가입한 이메일에서
            요청해 주세요. 본인 확인 후 처리해요.
          </p>

          <h3>6. 자동 수집 장치</h3>
          <p>
            쿠키 대신 브라우저 저장소를 사용해요. 로그인 유지 정보, 마지막으로 본 글 표시, 이용자가 설정한 화면 이미지(서버로
            전송되지 않아요)를 저장하며, 브라우저에서 삭제하거나 로그아웃하면 지워져요. 방문 통계는 Vercel Analytics를 사용하는데,
            쿠키를 사용하지 않고 익명화된 데이터만 저장해요.
          </p>

          <h3>7. 안전성 확보 조치</h3>
          <p>비밀번호 암호화 저장, 접속 구간 암호화(HTTPS), 관리자 접근 최소화</p>

          <h3>8. 개인정보 보호책임자</h3>
          <p>
            {OFFICER} / {CONTACT_EMAIL}
          </p>

          <h3>9. 방침 변경</h3>
          <p>변경 시 이 팝업에 시행일과 함께 공지해요.</p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal
