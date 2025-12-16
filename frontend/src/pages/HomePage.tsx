import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">AI 기술면접 시뮬레이터</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              안녕하세요, <strong>{user?.nickname}</strong>님
            </span>
            <Link
              to="/mypage"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
            >
              마이페이지
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">환영합니다!</h2>
              <p className="text-gray-500 mb-2">AI 기술면접 시뮬레이터에서 면접 연습을 시작하세요.</p>
              <p className="text-sm text-gray-400">
                구독: <span className="font-medium">{user?.subscriptionType}</span> | 이메일 인증:{' '}
                <span className={user?.emailVerified ? 'text-green-600' : 'text-red-600'}>
                  {user?.emailVerified ? '완료' : '미완료'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
