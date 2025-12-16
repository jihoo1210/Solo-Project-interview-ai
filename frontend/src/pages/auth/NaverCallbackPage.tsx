import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common';
import type { ApiError } from '../../types';

export default function NaverCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { naverLogin } = useAuth();
  const processedRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const immediateError = errorParam
    ? '네이버 로그인이 취소되었습니다.'
    : !code || !state
      ? '인증 정보가 없습니다.'
      : null;

  useEffect(() => {
    if (immediateError) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (processedRef.current || !code || !state) return;
    processedRef.current = true;

    const savedState = sessionStorage.getItem('naver_oauth_state');
    if (state !== savedState) {
      errorRef.current = '보안 검증에 실패했습니다.';
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    sessionStorage.removeItem('naver_oauth_state');

    const processLogin = async () => {
      try {
        await naverLogin(code, state);
      } catch (err) {
        const apiError = err as ApiError;
        errorRef.current = apiError.message || '네이버 로그인에 실패했습니다.';
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    processLogin();
  }, [code, state, immediateError, naverLogin, navigate]);

  if (immediateError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">{immediateError}</div>
          <div className="text-gray-500">로그인 페이지로 이동합니다...</div>
        </div>
      </div>
    );
  }

  return <LoadingSpinner color="border-[#03C75A]" message="네이버 로그인 처리 중..." />;
}
