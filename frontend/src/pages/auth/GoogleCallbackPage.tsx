import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { ApiError } from '../../types';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { googleLogin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const processedRef = useRef(false);

  const code = searchParams.get('code');
  const errorParam = searchParams.get('error');

  // URL 파라미터에서 바로 감지 가능한 에러는 렌더링 단계에서 처리
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
        console.log('Google OAuth: Starting login with code:', code?.substring(0, 20) + '...');
        await googleLogin(code);
        console.log('Google OAuth: Login successful');
      } catch (err) {
        console.error('Google OAuth: Login failed', err);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <div className="text-gray-600">Google 로그인 처리 중...</div>
      </div>
    </div>
  );
}
