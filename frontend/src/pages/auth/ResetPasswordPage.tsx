import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../store/authStore';
import type { ApiError } from '../../types';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuthStore();

  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (formData.newPassword !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 정규식 검증
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(formData.newPassword)) {
      setError('비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    if (!token) {
      setError('유효하지 않은 재설정 링크입니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.confirmPasswordReset(token, formData.newPassword);

      // 자동 로그인 처리
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);

      navigate('/', { replace: true });
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '비밀번호 재설정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 토큰이 없는 경우
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-error rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">유효하지 않은 링크</h2>
            <p className="text-text-muted mb-6">
              비밀번호 재설정 링크가 유효하지 않거나 만료되었습니다.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              비밀번호 재설정 다시 요청
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">새 비밀번호 설정</h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            새로운 비밀번호를 입력해주세요.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-text">
                새 비밀번호
              </label>
              <div className="relative mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-16 border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="새 비밀번호를 입력하세요"
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
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
                비밀번호 확인
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 pr-16 border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                >
                  {showConfirmPassword ? '숨기기' : '보기'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-primary hover:text-primary-dark">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
