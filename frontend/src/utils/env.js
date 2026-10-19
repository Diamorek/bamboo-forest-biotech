// 어플(웹뷰) 안에서 열렸는지 여부.
// 어플이 주소 뒤에 ?app=1을 붙여서 열면 true가 돼요. (일반 브라우저 접속은 false)
export const IS_IN_APP =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('app') === '1'
