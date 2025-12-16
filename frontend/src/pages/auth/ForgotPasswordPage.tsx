import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import type { ApiError } from '../../types';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authApi.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '비밀번호 재설정 요청에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 화면
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 bg-success rounded-full" />
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">이메일을 확인해주세요</h2>
            <p className="text-text-muted mb-6">
              {email}로 비밀번호 재설정 링크를 발송했습니다.<br />
              이메일을 확인하고 링크를 클릭해주세요.
            </p>
            <p className="text-sm text-text-muted mb-6">
              이메일이 도착하지 않았나요?{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-primary hover:text-primary-dark cursor-pointer"
              >
                다시 시도
              </button>
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              로그인 페이지로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 입력 화면
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">비밀번호 찾기</h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-background-dark rounded-lg shadow-sm placeholder-text-muted focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '발송 중...' : '재설정 링크 발송'}
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
