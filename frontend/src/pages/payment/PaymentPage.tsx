import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClientKey, preparePayment } from '../../api/payment';
import { PLAN_TYPE_LABELS, type PlanType } from '../../types';
import { LoadingSpinner } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

export default function PaymentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('PREMIUM_YEARLY');

  const plan = PLAN_TYPE_LABELS[selectedPlan];

  // Premium 사용자는 결제 페이지 접근 불가
  useEffect(() => {
    if (user?.subscriptionType === 'PREMIUM') {
      navigate('/mypage');
    }
  }, [user, navigate]);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. 클라이언트 키 조회
      const clientKey = await getClientKey();

      // 2. 결제 준비 (customerKey 생성)
      const prepareResponse = await preparePayment(selectedPlan);

      // 3. 토스페이먼츠 SDK 로드 확인
      if (!window.TossPayments) {
        throw new Error('결제 모듈을 불러올 수 없습니다.');
      }

      // 4. 선택한 플랜 정보를 localStorage에 저장 (success 페이지에서 사용)
      localStorage.setItem('selectedPlanType', selectedPlan);

      // 5. 토스페이먼츠 빌링키 발급 요청 (v2 SDK)
      const tossPayments = window.TossPayments(clientKey);
      const payment = tossPayments.payment({ customerKey: prepareResponse.customerKey });

      await payment.requestBillingAuth({
        method: 'CARD',
        customerEmail: prepareResponse.customerEmail,
        customerName: prepareResponse.customerName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (err) {
      console.error('결제 요청 실패:', err);
      setError(err instanceof Error ? err.message : '결제 요청에 실패했습니다.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md sm:max-w-lg lg:max-w-2xl">
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-8 lg:p-10">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center text-text mb-2">
            Premium 구독
          </h1>
          <p className="text-center text-text-muted mb-6 sm:mb-8 text-sm sm:text-base">
            자동 결제로 편리하게 이용하세요
          </p>

          {/* 플랜 선택 */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            {/* 월간 플랜 */}
            <button
              onClick={() => setSelectedPlan('PREMIUM_MONTHLY')}
              className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                selectedPlan === 'PREMIUM_MONTHLY'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm sm:text-base font-medium text-text mb-1">월간 구독</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold text-text">
                  {PLAN_TYPE_LABELS.PREMIUM_MONTHLY.price.toLocaleString()}
                </span>
                <span className="text-xs text-text-muted">원/월</span>
              </div>
              {selectedPlan === 'PREMIUM_MONTHLY' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>

            {/* 연간 플랜 */}
            <button
              onClick={() => setSelectedPlan('PREMIUM_YEARLY')}
              className={`relative p-4 sm:p-5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                selectedPlan === 'PREMIUM_YEARLY'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-full">
                {PLAN_TYPE_LABELS.PREMIUM_YEARLY.discount}
              </div>
              <div className="text-sm sm:text-base font-medium text-text mb-1">연간 구독</div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-bold text-text">
                  {PLAN_TYPE_LABELS.PREMIUM_YEARLY.price.toLocaleString()}
                </span>
                <span className="text-xs text-text-muted">원/년</span>
              </div>
              <div className="text-xs text-text-muted line-through">
                {PLAN_TYPE_LABELS.PREMIUM_YEARLY.originalPrice?.toLocaleString()}원
              </div>
              {selectedPlan === 'PREMIUM_YEARLY' && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* 플랜 혜택 */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-6 border border-amber-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-base sm:text-lg font-semibold text-text">{plan.name}</span>
              <span className="px-2 sm:px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs sm:text-sm font-medium rounded-full">
                PREMIUM
              </span>
            </div>

            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 text-sm sm:text-base text-text">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">✓</span>
                무제한 면접 진행
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base text-text">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">✓</span>
                질문 개수 자유 설정 (3~10개)
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base text-text">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">✓</span>
                답변 기반 꼬리질문
              </li>
              <li className="flex items-center gap-2 text-sm sm:text-base text-text">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">✓</span>
                귀여운 노란색 토끼
              </li>
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* 정기결제 안내 */}
          <div className="mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-700">
              <strong>정기결제 안내:</strong> 카드를 등록하면 {selectedPlan === 'PREMIUM_MONTHLY' ? '매월' : '매년'} 자동으로 결제됩니다.
              마이페이지에서 언제든지 구독을 취소할 수 있으며, 취소 후에도 남은 기간은 계속 이용 가능합니다.
            </p>
          </div>

          {/* 버튼 그룹 */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={isLoading}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>결제 준비 중...</span>
                </>
              ) : (
                <span>{plan.price.toLocaleString()}원 정기구독</span>
              )}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-2.5 sm:py-3 px-4 sm:px-6 text-text-muted font-medium rounded-xl border border-background-dark hover:border-primary hover:text-primary transition-all cursor-pointer text-sm sm:text-base"
            >
              취소
            </button>
          </div>

          {/* 안내 문구 */}
          <p className="mt-5 sm:mt-6 text-xs text-text-muted text-center">
            결제 시 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
            <br />
            첫 결제 후 {plan.duration}마다 자동 갱신됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
