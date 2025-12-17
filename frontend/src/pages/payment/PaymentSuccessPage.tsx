import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { issueBillingKey } from '../../api/payment';
import { userApi } from '../../api/user';
import { LoadingSpinner } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuthStore();

  // 빌링키 발급 콜백 파라미터
  const authKey = searchParams.get('authKey');
  const hasValidParams = !!authKey;

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(hasValidParams ? 'loading' : 'error');
  const [error, setError] = useState<string | null>(hasValidParams ? null : '잘못된 결제 정보입니다.');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const isProcessed = useRef(false);

  useEffect(() => {
    if (!hasValidParams || isProcessed.current) return;

    isProcessed.current = true;

    const processPayment = async () => {
      try {
        // 빌링키 발급 및 첫 결제
        const response = await issueBillingKey({ authKey: authKey! });

        setExpiresAt(response.subscriptionExpiresAt);
        setStatus('success');

        // 사용자 정보 갱신
        const updatedUser = await userApi.getMyProfile();
        setUser(updatedUser);
      } catch (err) {
        console.error('결제 승인 실패:', err);
        setStatus('error');
        setError('결제 승인에 실패했습니다. 고객센터로 문의해주세요.');
      }
    };

    processPayment();
  }, [hasValidParams, authKey, setUser]);

  if (status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-text-muted">결제를 처리하고 있습니다...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl text-red-500">X</span>
          </div>
          <h1 className="text-2xl font-bold text-text mb-2">결제 처리 실패</h1>
          <p className="text-text-muted mb-6">{error}</p>

          <div className="space-y-3">
            <Link
              to="/payment"
              className="block w-full py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all"
            >
              다시 시도하기
            </Link>
            <Link
              to="/"
              className="block w-full py-3 px-6 text-text-muted font-medium rounded-xl border border-background-dark hover:border-primary hover:text-primary transition-all"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-white">V</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">정기구독이 시작되었습니다!</h1>
        <p className="text-text-muted mb-2">Premium 구독이 활성화되었습니다.</p>
        {expiresAt && (
          <p className="text-sm text-text-muted mb-6">
            다음 결제일: {new Date(expiresAt).toLocaleDateString('ko-KR')}
          </p>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 mb-6 border border-amber-200">
          <p className="text-sm font-medium text-text mb-2">Premium 혜택</p>
          <ul className="space-y-1 text-sm text-text-muted">
            <li>- 무제한 면접 진행</li>
            <li>- 질문 개수 자유 설정</li>
            <li>- 답변 기반 꼬리질문</li>
            <li>- 귀여운 노란색 토끼</li>
          </ul>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
          <p className="text-xs text-blue-700">
            매월 자동으로 결제됩니다. 마이페이지에서 언제든지 구독을 취소할 수 있습니다.
          </p>
        </div>

        <div className="space-y-3">
          <Link
            to="/interview/start"
            className="block w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            면접 시작하기
          </Link>
          <Link
            to="/mypage"
            className="block w-full py-3 px-6 text-text-muted font-medium rounded-xl border border-background-dark hover:border-primary hover:text-primary transition-all"
          >
            마이페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
