import { Link } from 'react-router-dom';
import { Suspense, lazy, useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { getTodayInterviewCount } from '../api/interview';

const CoachCharacter = lazy(() => import('../components/3d/CoachCharacter'));

// 면접 유형 데이터
const INTERVIEW_TYPES = [
  { name: 'CS 기초', desc: '자료구조, 알고리즘, OS, 네트워크' },
  { name: '백엔드', desc: 'Spring, DB, API 설계, 시스템 설계' },
  { name: '프론트엔드', desc: 'React, 성능 최적화, 브라우저' },
  { name: '데브옵스', desc: 'CI/CD, Docker, 클라우드, 모니터링' },
];

// 특징 데이터
const FEATURES = [
  {
    title: '개발자 직무별 맞춤 질문',
    desc: 'CS, 백엔드, 프론트엔드, 데브옵스 등 직무에 맞는 기술 면접 질문을 제공합니다.',
  },
  {
    title: 'AI 실시간 피드백',
    desc: '답변 즉시 점수, 상세 피드백, 모범답안을 받아보세요.',
  },
  {
    title: '난이도별 맞춤 연습',
    desc: '신입부터 경력까지, 본인 레벨에 맞는 난이도로 연습할 수 있습니다.',
  },
  {
    title: '상세 분석 리포트',
    desc: '분야별 점수 차트와 종합 평가로 약점을 파악하세요.',
  },
];

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
              <p className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                개발자 전용 AI 면접 코치
              </p>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text mb-6 leading-tight">
                <span className="text-primary">기술 면접</span>,
                <br />
                <span className="text-primary">AI</span>와 함께 정복하세요
              </h1>

              <p className="text-lg text-text-light mb-8 max-w-xl mx-auto lg:mx-0">
                CS, 백엔드, 프론트엔드, 데브옵스까지.
                <br className="hidden sm:block" />
                개발자 직무에 특화된 AI 면접관이 실전처럼 질문하고,
                <br className="hidden sm:block" />
                즉각적인 피드백으로 실력 향상을 도와드립니다.
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

      {/* 면접 유형 섹션 */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              지원하는 <span className="text-primary">기술 면접</span> 유형
            </h2>
            <p className="text-text-light max-w-2xl mx-auto">
              개발자 직무에 맞는 다양한 기술 면접을 준비할 수 있습니다
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {INTERVIEW_TYPES.map((type) => (
              <div
                key={type.name}
                className="bg-background rounded-xl p-5 sm:p-6 text-center hover:shadow-lg transition-shadow border border-transparent hover:border-primary"
              >
                <h3 className="font-bold text-text mb-2 text-lg">{type.name}</h3>
                <p className="text-sm text-text-muted">{type.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-text mb-4">
              왜 <span className="text-primary">InterBit</span>인가요?
            </h2>
            <p className="text-text-light max-w-2xl mx-auto">
              개발자 기술 면접에 특화된 AI 코칭으로 효과적으로 준비하세요
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary font-bold rounded-lg mb-4">
                  {index + 1}
                </span>
                <h3 className="font-bold text-text mb-2">{feature.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            지금 바로 기술 면접을 연습해보세요
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            무료로 시작하고, AI 면접관과 함께 실력을 키워보세요
          </p>
          {isAuthenticated ? (
            <Link
              to="/interview/start"
              className="inline-block px-10 py-4 text-lg font-bold text-primary bg-white rounded-xl hover:bg-background transition-colors shadow-lg"
            >
              면접 시작하기
            </Link>
          ) : (
            <Link
              to="/signup"
              className="inline-block px-10 py-4 text-lg font-bold text-primary bg-white rounded-xl hover:bg-background transition-colors shadow-lg"
            >
              무료로 시작하기
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
