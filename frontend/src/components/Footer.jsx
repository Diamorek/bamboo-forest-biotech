import { openPrivacyPolicy } from '../utils/privacy'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <p>
        문의사항 · 신고 · 이직공고 관련 문의는{' '}
        <a href="mailto:biobambooforest@gmail.com">biobambooforest@gmail.com</a>
        {' '}으로 보내주세요.
      </p>
      <p className="site-footer__links">
        <button type="button" className="btn-text" onClick={openPrivacyPolicy}>
          개인정보 처리방침
        </button>
      </p>
    </footer>
  )
}

export default Footer
