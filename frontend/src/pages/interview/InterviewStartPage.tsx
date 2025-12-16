import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startInterview, getTodayInterviewCount } from '../../api/interview';
import type { InterviewType, InterviewDifficulty, ApiError } from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';
import { LoadingSpinner } from '../../components/common';
import { useAuthStore } from '../../store/authStore';

const INTERVIEW_TYPES: InterviewType[] = ['FRONTEND', 'BACKEND', 'FULLSTACK', 'DEVOPS', 'DATA', 'MOBILE'];
const DIFFICULTIES: InterviewDifficulty[] = ['JUNIOR', 'MID', 'SENIOR'];
const FREE_DAILY_LIMIT = 3;

export default function InterviewStartPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<InterviewDifficulty | null>(null);
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

    setIsLoading(true);
    setError(null);

    try {
      const response = await startInterview({
        type: selectedType,
        difficulty: selectedDifficulty,
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
              <span className="text-text-muted ml-2">({todayCount}/{FREE_DAILY_LIMIT}회 사용)</span>
              {isLimitReached && (
                <p className="text-sm text-error mt-1">일일 면접 횟수를 모두 사용했습니다. 내일 다시 시도해주세요.</p>
              )}
            </div>
          )}

          {/* 면접 유형 선택 */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-text mb-4">면접 유형</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {INTERVIEW_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-4 border-2 rounded-xl font-medium transition-all text-sm ${
                    selectedType === type
                      ? 'border-primary bg-background text-primary'
                      : 'border-background-dark bg-white text-text-light hover:border-primary/50'
                  }`}
                >
                  {INTERVIEW_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {/* 난이도 선택 */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-text mb-4">난이도</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DIFFICULTIES.map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => setSelectedDifficulty(difficulty)}
                  className={`p-5 border-2 rounded-xl transition-all flex flex-col items-center gap-2 ${
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

          {error && (
            <p className="text-center text-error mb-6">{error}</p>
          )}

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <button
              onClick={handleStart}
              disabled={isLoading || !selectedType || !selectedDifficulty || isLimitReached}
              className={`flex-1 py-4 px-8 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
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
