import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common';
import type { ApiError } from '../../types';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  const immediateError = errorParam
    ? 'Google 로그인이 취소되었습니다.'
    : !code
      ? '인증 코드가 없습니다.'
      : null;

  useEffect(() => {
    if (immediateError) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (processedRef.current || !code) return;
    processedRef.current = true;

    const processLogin = async () => {
      try {
        await googleLogin(code);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Google 로그인에 실패했습니다.');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processLogin();
  }, [code, immediateError, googleLogin, navigate]);

  const displayError = immediateError || error;

  if (displayError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">{displayError}</div>
          <div className="text-gray-500">로그인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner message="Google 로그인 처리 중..." />;
}
