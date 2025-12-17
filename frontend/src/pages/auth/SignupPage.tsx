import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ApiError } from '../../types';

export default function SignupPage() {
  const { signup, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
      });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '회원가입에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">회원가입</h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              로그인
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text">
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-text">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                value={formData.nickname}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="닉네임을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text">
                비밀번호
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-16 bg-white border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                >
                  {showPassword ? '🙈' : '🙊'}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
              8자 이상, 대문자, 소문자, 숫자, 특수문자(!@#$%^&*) 포함
              </p>
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-text">
                비밀번호 확인
              </label>
              <div className="relative mt-1">
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  required
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-16 bg-white border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                >
                  {showPasswordConfirm ? '🙈' : '🙊'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}
