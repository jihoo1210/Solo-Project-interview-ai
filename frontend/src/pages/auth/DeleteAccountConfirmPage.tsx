import { Link, useSearchParams } from 'react-router-dom';
import { StatusPage } from '../../components/common';

export default function DeleteAccountConfirmPage() {
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success') === 'true';
  const errorParam = searchParams.get('error');

  if (success) {
    return (
      <StatusPage
        type="success"
        title="탈퇴가 완료되었습니다"
        message="그동안 서비스를 이용해 주셔서 감사합니다. 언제든지 다시 찾아와 주세요."
        linkTo="/"
        linkText="홈으로 이동"
      />
    );
  }

  return (
    <StatusPage
      type="error"
      title="탈퇴 실패"
      message={errorParam || '회원 탈퇴 처리 중 오류가 발생했습니다.'}
      subMessage="탈퇴 링크가 만료되었거나 유효하지 않습니다."
    >
      <div className="space-y-3">
        <Link
          to="/delete-account"
          className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 cursor-pointer text-center"
        >
          탈퇴 다시 요청
        </Link>
        <Link
          to="/login"
          className="block w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer text-center"
        >
          로그인 페이지로
        </Link>
      </div>
    </StatusPage>
  );
}
