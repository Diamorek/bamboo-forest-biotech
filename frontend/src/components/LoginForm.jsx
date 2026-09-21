import { useState } from 'react';
import { login } from '../services/api';

export default function LoginForm() {
  const [form, setForm] = useState({ email: '', password: '' });
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
      const data = await login(form);
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
    return <p>로그인 성공! 토큰 저장 완료.</p>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>로그인</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
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
        placeholder="비밀번호"
        value={form.password}
        onChange={handleChange}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '로그인'}
      </button>
    </form>
  );
}
