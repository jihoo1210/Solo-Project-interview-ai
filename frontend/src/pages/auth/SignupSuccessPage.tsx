import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import type { ApiError } from '../../types';

export default function SignupSuccessPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이메일이 없으면 회원가입 페이지로 리다이렉트
  if (!email) {
    return <Navigate to="/signup" replace />;
  }

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    setResendSuccess(false);

    try {
      await authApi.resendVerification(email);
      setResendSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || '이메일 재발송에 실패했습니다.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h2>

          <p className="text-gray-600 mb-2">
            회원가입이 완료되었습니다!
          </p>
          <p className="text-gray-600 mb-6">
            <span className="font-medium text-blue-600">{email}</span>로 인증 메일을 발송했습니다.<br />
            이메일의 인증 링크를 클릭하여 가입을 완료해주세요.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-4">
              인증 메일을 다시 발송했습니다.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isResending ? '발송 중...' : '인증 메일 다시 보내기'}
            </button>

            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              로그인 페이지로
            </Link>
          </div>

          <p className="mt-6 text-xs text-gray-500">
            이메일이 도착하지 않았나요?<br />
            스팸 메일함을 확인하거나 위 버튼을 눌러 다시 발송해주세요.<br />
            인증 링크는 10분 후 만료됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
