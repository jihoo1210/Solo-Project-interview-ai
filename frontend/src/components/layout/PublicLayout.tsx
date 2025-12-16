import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // 로그인된 사용자용 네비게이션
  const authNavLinks = [
    { path: '/', label: '홈' },
    { path: '/interview/start', label: '면접 시작' },
    { path: '/interviews', label: '면접 기록' },
    { path: '/mypage', label: '마이페이지' },
  ];

  // 비로그인 사용자용 네비게이션
  const publicNavLinks = [
    { path: '/', label: '홈' },
  ];

  const navLinks = isAuthenticated ? authNavLinks : publicNavLinks;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b border-background-dark sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <Link
              to="/"
              className="text-xl sm:text-2xl font-bold text-text hover:text-primary transition-colors"
            >
              AI 면접 코치
            </Link>

            {/* 데스크탑 내비게이션 */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-primary text-white'
                      : 'text-text-light hover:bg-background-dark hover:text-text'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* 사용자 정보 / 로그인 버튼 */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-text-light">
                    <strong className="text-text">{user?.nickname}</strong>님
                  </span>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-medium text-text-light border border-background-dark rounded-lg hover:border-primary hover:text-primary transition-all cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-text-light border border-background-dark rounded-lg hover:border-primary hover:text-primary transition-all"
                  >
                    로그인
                  </Link>
                  <Link
                    to="/signup"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all"
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-text-light hover:bg-background-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 모바일 메뉴 */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-background-dark">
              {isAuthenticated && (
                <div className="text-sm text-text-light mb-3 px-2">
                  <strong className="text-text">{user?.nickname}</strong>님
                </div>
              )}
              <nav className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive(link.path)
                        ? 'bg-primary text-white'
                        : 'text-text-light hover:bg-background-dark'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-sm font-medium text-text-light text-left hover:bg-background-dark rounded-lg transition-all cursor-pointer"
                  >
                    로그아웃
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-text-light hover:bg-background-dark rounded-lg transition-all"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-white bg-primary rounded-lg transition-all"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-background-dark py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-text-muted">
            AI 면접 코치 - 당신의 성공적인 면접을 응원합니다
          </p>
        </div>
      </footer>
    </div>
  );
}
