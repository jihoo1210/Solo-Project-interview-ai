import { useSearchParams, Link } from 'react-router-dom';

export default function PaymentFailPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-red-500">!</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-2">결제에 실패했습니다</h1>
        <p className="text-text-muted mb-2">
          {errorMessage || '결제 중 문제가 발생했습니다.'}
        </p>
        {errorCode && (
          <p className="text-xs text-text-muted mb-6">
            오류 코드: {errorCode}
          </p>
        )}

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-text-muted">
            결제가 취소되었거나 오류가 발생했습니다.
            <br />
            다시 시도하거나 다른 결제 수단을 이용해주세요.
          </p>
        </div>

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
