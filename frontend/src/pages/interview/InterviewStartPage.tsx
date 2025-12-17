import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview, getTodayInterviewCount } from '../../api/interview';
import type { InterviewType, InterviewDifficulty, ApiError } from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';
import { LoadingSpinner } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

const INTERVIEW_TYPES: InterviewType[] = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'DATA', 'MOBILE', 'OTHER'];
const DIFFICULTIES: InterviewDifficulty[] = ['JUNIOR', 'MID', 'SENIOR'];
const FREE_DAILY_LIMIT = 3;
const QUESTION_LIMITS = [3, 5, 7, 10];

export default function InterviewStartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [customType, setCustomType] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
  const [questionLimit, setQuestionLimit] = useState<number>(5);
  const [followUpEnabled, setFollowUpEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState<number>(0);

  const isFreeUser = user?.subscriptionType === 'FREE';
  const isLimitReached = isFreeUser && todayCount >= FREE_DAILY_LIMIT;

  useEffect(() => {
    const fetchTodayCount = async () => {
      try {
        const count = await getTodayInterviewCount();
        setTodayCount(count);
      } catch {
        setTodayCount(0);
      }
    };
    fetchTodayCount();
  }, []);

  const handleStart = async () => {
    if (!selectedType || !selectedDifficulty) {
      setError('면접 유형과 난이도를 선택해주세요.');
      return;
    }

    if (selectedType === 'OTHER' && !customType.trim()) {
      setError('기타 유형을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await startInterview({
        type: selectedType,
        difficulty: selectedDifficulty,
        customType: selectedType === 'OTHER' ? customType.trim() : undefined,
        questionLimit: isFreeUser ? 5 : questionLimit,
        followUpEnabled: isFreeUser ? false : followUpEnabled,
      });

      navigate(`/interview/${response.interviewId}`, {
        state: {
          interviewId: response.interviewId,
          type: response.type,
          difficulty: response.difficulty,
          currentQuestion: response.firstQuestion,
        },
      });
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError.name === 'DAILY_LIMIT_EXCEEDED') {
        setError('일일 면접 횟수를 초과했습니다. (FREE: 3회/일)');
        setTodayCount(FREE_DAILY_LIMIT);
      } else {
        setError(apiError.message || '면접을 시작할 수 없습니다. 다시 시도해주세요.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-text mb-3">
            면접 시작
          </h1>
          <p className="text-center text-text-light mb-4">
            면접 유형과 난이도를 선택해주세요
          </p>

          {/* FREE 사용자 일일 제한 안내 */}
          {isFreeUser && (
            <div className={`text-center mb-8 px-4 py-3 rounded-lg ${isLimitReached ? 'bg-error/10 border border-error/30' : 'bg-primary/10 border border-primary/30'}`}>
              <span className={`font-medium ${isLimitReached ? 'text-error' : 'text-primary'}`}>
                오늘 남은 면접: {FREE_DAILY_LIMIT - todayCount}회
              </span>
              {isLimitReached && (
                <p className="text-sm text-error mt-1">일일 면접 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.</p>
              )}
            </div>
          )}

          {/* 면접 유형 선택 */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-text mb-4">면접 유형</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    if (type !== 'OTHER') setCustomType('');
                  }}
                  className={`p-4 border-2 rounded-xl font-medium transition-all text-sm whitespace-nowrap cursor-pointer ${
                    selectedType === type
                      ? 'border-primary bg-background text-primary'
                      : 'border-background-dark bg-white text-text-light hover:border-primary/50'
                  }`}
                >
                  {INTERVIEW_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
            {/* 기타 직접 입력 */}
            {selectedType === 'OTHER' && (
              <div className="mt-4">
                <input
                  autoFocus
                  type="text"
                  value={customType}
                  onChange={(e) => setCustomType(e.target.value)}
                  placeholder="면접 직무를 입력하세요 (예: AI 엔지니어, 보안 전문가)"
                  className="w-full px-4 py-3 border-2 border-primary rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            )}
          </div>

          {/* 난이도 선택 */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-text mb-4">난이도</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    selectedDifficulty === difficulty
                      ? 'border-primary bg-background'
                      : 'border-background-dark bg-white hover:border-primary/50'
                  }`}
                >
                  <span className={`text-lg font-semibold ${
                    selectedDifficulty === difficulty ? 'text-primary' : 'text-text'
                  }`}>
                    {INTERVIEW_DIFFICULTY_LABELS[difficulty].label}
                  </span>
                  <span className="text-sm text-text-muted">
                    {INTERVIEW_DIFFICULTY_LABELS[difficulty].experience}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Premium 옵션 */}
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold text-text">면접 설정</h2>
              {isFreeUser && (
                <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                  PREMIUM
                </span>
              )}
            </div>

            <div className={`p-6 rounded-xl border-2 ${isFreeUser ? 'border-background-dark bg-background-dark/30' : 'border-primary/30 bg-primary/5'}`}>
              {isFreeUser && (
                <div className="mb-4 text-center">
                  <p className="text-text-muted text-sm">Premium 회원만 사용할 수 있는 기능입니다</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 질문 개수 선택 */}
                <div className={isFreeUser ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="block text-sm font-medium text-text mb-3">질문 개수</label>
                  <div className="flex gap-2">
                    {QUESTION_LIMITS.map((limit) => (
                      <button
                        key={limit}
                        onClick={() => setQuestionLimit(limit)}
                        disabled={isFreeUser}
                        className={`flex-1 py-3 px-4 border-2 rounded-lg font-medium transition-all cursor-pointer ${
                          questionLimit === limit
                            ? 'border-primary bg-primary text-white'
                            : 'border-background-dark bg-white text-text hover:border-primary/50'
                        } ${isFreeUser ? 'cursor-not-allowed' : ''}`}
                      >
                        {limit}개
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-2">FREE: 5개 고정</p>
                </div>

                {/* 꼬리질문 토글 */}
                <div className={isFreeUser ? 'opacity-50 pointer-events-none' : ''}>
                  <label className="block text-sm font-medium text-text mb-3">꼬리질문</label>
                  <button
                    onClick={() => setFollowUpEnabled(!followUpEnabled)}
                    disabled={isFreeUser}
                    className={`w-full py-3 px-4 border-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer ${
                      followUpEnabled
                        ? 'border-primary bg-primary text-white'
                        : 'border-background-dark bg-white text-text hover:border-primary/50'
                    } ${isFreeUser ? 'cursor-not-allowed' : ''}`}
                  >
                    <span>답변 기반 꼬리질문</span>
                    <span className={`w-12 h-6 rounded-full transition-all flex items-center ${
                      followUpEnabled ? 'bg-white/30 justify-end' : 'bg-background-dark justify-start'
                    }`}>
                      <span className={`w-5 h-5 rounded-full mx-0.5 transition-all ${
                        followUpEnabled ? 'bg-white' : 'bg-text-muted'
                      }`} />
                    </span>
                  </button>
                  <p className="text-xs text-text-muted mt-2">FREE: 사용 불가</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <p className="text-center text-error mb-6">{error}</p>
          )}

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={handleStart}
              disabled={isLoading || !selectedType || !selectedDifficulty || isLimitReached}
              className={`flex-1 py-4 px-8 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isLoading || !selectedType || !selectedDifficulty || isLimitReached
                  ? 'bg-background-dark text-text-muted cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary-dark shadow-lg'
              }`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>면접 시작 중...</span>
                </>
              ) : isLimitReached ? '오늘 횟수 소진' : '면접 시작'}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-4 px-8 text-lg font-semibold text-text-light bg-white border border-background-dark rounded-xl hover:border-primary hover:text-primary transition-all flex items-center justify-center"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
