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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>
            <p className="text-gray-600 mb-6">
              {email}로 비밀번호 재설정 링크를 발송했습니다.<br />
              이메일을 확인하고 링크를 클릭해주세요.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              이메일이 도착하지 않았나요?{' '}
              <button
                onClick={() => setIsSuccess(false)}
                className="text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                다시 시도
              </button>
            </p>
            <Link
              to="/login"
              className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">비밀번호 찾기</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? '발송 중...' : '재설정 링크 발송'}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
