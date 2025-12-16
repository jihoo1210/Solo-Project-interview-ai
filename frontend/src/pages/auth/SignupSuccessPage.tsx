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
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-primary rounded-full" />
          </div>

          <h2 className="text-2xl font-bold text-text mb-2">이메일을 확인해주세요</h2>

          <p className="text-text-muted mb-2">
            회원가입이 완료되었습니다!
          </p>
          <p className="text-text-muted mb-6">
            <span className="font-medium text-primary">{email}</span>로 인증 메일을 발송했습니다.<br />
            이메일의 인증 링크를 클릭하여 가입을 완료해주세요.
          </p>

          {error && (
            <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {resendSuccess && (
            <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-sm mb-4">
              인증 메일을 다시 발송했습니다.
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full flex justify-center py-2 px-4 border border-primary rounded-lg shadow-sm text-sm font-medium text-primary bg-white hover:bg-background focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isResending ? '발송 중...' : '인증 메일 다시 보내기'}
            </button>

            <Link
              to="/login"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary cursor-pointer"
            >
              로그인 페이지로
            </Link>
          </div>

          <p className="mt-6 text-xs text-text-muted">
            이메일이 도착하지 않았나요?<br />
            스팸 메일함을 확인하거나 위 버튼을 눌러 다시 발송해주세요.<br />
            인증 링크는 10분 후 만료됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
