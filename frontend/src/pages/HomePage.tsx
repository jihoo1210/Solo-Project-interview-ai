import { Link } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getTodayInterviewCount } from '../api/interview';

const CoachCharacter = lazy(() => import('../components/3d/CoachCharacter'));

export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();
  const [todayCount, setTodayCount] = useState<number>(0);

  useEffect(() => {
    const fetchTodayCount = async () => {
      try {
        const count = await getTodayInterviewCount();
        setTodayCount(count);
      } catch {
        setTodayCount(0);
      }
    };
    if (isAuthenticated) {
      fetchTodayCount();
    }
  }, [isAuthenticated]);

  return (
    <div className="flex-1">
      {/* 히어로 섹션 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-white to-background-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* 텍스트 콘텐츠 */}
            <div className="text-center lg:text-left">
              <p className="text-sm font-medium text-primary mb-4">
                AI 면접 코칭 서비스
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
                <span className="text-primary">AI</span>와 함께하는
                <br />
                실전 <span className="text-primary">면접</span> 연습
              </h1>

              <p className="text-lg text-text-light mb-8 max-w-xl mx-auto lg:mx-0">
                AI 면접관이 실제 면접처럼 질문하고, 피드백을 제공합니다.
                <br className="hidden sm:block" />
                언제 어디서나 편하게 면접을 연습하세요.
              </p>

              {/* 사용자 상태 (로그인된 경우만 표시) */}
              {isAuthenticated && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                  <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm">
                    <span className="text-text-muted">구독: </span>
                    <span className="font-semibold text-primary">{user?.subscriptionType || 'FREE'}</span>
                  </div>
                  <div className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm">
                    <span className="text-text-muted">오늘 면접: </span>
                    <span className={`font-semibold ${user?.subscriptionType === 'FREE' && todayCount >= 3 ? 'text-error' : 'text-accent'}`}>
                      {user?.subscriptionType === 'FREE' ? `${todayCount}/3회` : `${todayCount}회`}
                    </span>
                  </div>
                </div>
              )}

              {/* CTA 버튼 */}
              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/interview/start"
                      className="px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                    >
                      면접 시작하기
                    </Link>
                    <Link
                      to="/interviews"
                      className="px-8 py-4 text-lg font-semibold text-text-light bg-white border border-background-dark rounded-xl hover:border-primary hover:text-primary transition-colors"
                    >
                      면접 기록 보기
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-8 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
                    >
                      로그인하고 시작하기
                    </Link>
                    <Link
                      to="/signup"
                      className="px-8 py-4 text-lg font-semibold text-text-light bg-white border border-background-dark rounded-xl hover:border-primary hover:text-primary transition-colors"
                    >
                      회원가입
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* 3D 효과 */}
            <div className="relative h-[400px] lg:h-[500px] order-first lg:order-last">
              <Suspense
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full animate-pulse" />
                  </div>
                }
              >
                <CoachCharacter className="w-full h-full" isPremium={user?.subscriptionType === 'PREMIUM'} />
              </Suspense>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
