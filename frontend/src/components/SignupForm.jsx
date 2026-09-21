import { useState } from 'react';
import { signup } from '../services/api';

export default function SignupForm() {
  const [form, setForm] = useState({ email: '', password: '', username: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await signup(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <p>가입 완료! 토큰이 localStorage에 저장됐어요. 개발자도구 → Application → Local Storage에서 확인해보세요.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        name="username"
        placeholder="닉네임"
        value={form.username}
        onChange={handleChange}
        required
      />
      <input
        name="email"
        type="email"
        placeholder="이메일"
        value={form.email}
        onChange={handleChange}
        required
      />
      <input
        name="password"
        type="password"
        placeholder="비밀번호 (8자 이상)"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '가입하기'}
      </button>
    </form>
  );
}
