import { useSearchParams, Link } from 'react-router-dom';
import { StatusPage } from '../components/common';

export default function ErrorPage() {
  const [searchParams] = useSearchParams();

  const title = searchParams.get('title') || '오류가 발생했습니다';
  const message = searchParams.get('message') || '요청을 처리하는 중 문제가 발생했습니다.';
  const code = searchParams.get('code');

  return (
    <StatusPage
      type="error"
      title={title}
      message={message}
      subMessage={code ? `오류 코드: ${code}` : undefined}
    >
      <div className="space-y-3">
        <Link
          to="/"
          className="block w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer text-center"
        >
          홈으로 이동
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
