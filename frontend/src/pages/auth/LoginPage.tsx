import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import OAuthButtons from '../../components/auth/OAuthButtons';
import type { ApiError } from '../../types';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const successMessage = (location.state as { message?: string })?.message;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login(formData);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '로그인에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">로그인</h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            계정이 없으신가요?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              회원가입
            </Link>
          </p>
        </div>

        {successMessage && (
          <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-sm">
            {successMessage}
          </div>
        )}

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
                  {showPassword ? '숨기기' : '보기'}
                </button>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                8자 이상, 대문자, 소문자, 숫자, 특수문자 포함
              </p>
              <div className="mt-2 text-right">
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-dark">
                  비밀번호를 잊으셨나요?
                </Link>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-background-dark" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-text-muted">또는</span>
            </div>
          </div>

          <OAuthButtons />
        </div>

        <div className="text-center">
          <Link to="/delete-account" className="text-sm text-error hover:opacity-80">
            회원 탈퇴
          </Link>
        </div>
      </div>
    </div>
  );
}
