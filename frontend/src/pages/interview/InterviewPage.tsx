import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { submitAnswer, endInterview } from '../../api/interview';
import type {
  InterviewType,
  InterviewDifficulty,
  QuestionResponse,
  EvaluationResult,
} from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';
import { LoadingSpinner } from '../../components/common';

interface LocationState {
  interviewId: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  currentQuestion: QuestionResponse;
}

interface AnswerHistory {
  question: QuestionResponse;
  userAnswer: string;
  evaluation: EvaluationResult;
  answerTimeSeconds: number;
}

export default function InterviewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(
    state?.currentQuestion || null
  );
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  // 타이머 상태
  const [elapsedTime, setElapsedTime] = useState(0);
  const questionStartTimeRef = useRef<number>(Date.now());
  const timerIntervalRef = useRef<number | null>(null);

  const interviewId = state?.interviewId || parseInt(id || '0');
  const interviewType = state?.type;
  const interviewDifficulty = state?.difficulty;

  // 타이머 시작/정지 함수
  const startTimer = useCallback(() => {
    questionStartTimeRef.current = Date.now();
    setElapsedTime(0);
    timerIntervalRef.current = window.setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - questionStartTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  // 소요 시간 계산
  const getElapsedSeconds = useCallback(() => {
    return Math.floor((Date.now() - questionStartTimeRef.current) / 1000);
  }, []);

  // 시간 포맷팅 (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!state) {
      navigate('/interview/start');
    }
  }, [state, navigate]);

  // 컴포넌트 마운트 시 타이머 시작
  useEffect(() => {
    if (state && currentQuestion) {
      startTimer();
    }
    return () => stopTimer();
  }, [state, currentQuestion, startTimer, stopTimer]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) {
      setError('답변을 입력해주세요.');
      return;
    }

    // 소요 시간 계산 후 타이머 정지
    const answerTimeSeconds = getElapsedSeconds();
    stopTimer();

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitAnswer(interviewId, {
        questionId: currentQuestion.id,
        content: answer.trim(),
        answerTimeSeconds,
      });

      // 답변 기록 저장
      setAnswerHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          userAnswer: answer.trim(),
          evaluation: response.evaluation,
          answerTimeSeconds,
        },
      ]);

      // 다음 질문으로 바로 이동
      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
        setAnswer('');
        // 새 질문 타이머 시작
        startTimer();
      } else {
        // 모든 질문 완료
        setCurrentQuestion(null);
      }
    } catch (err) {
      setError('답변을 제출할 수 없습니다. 다시 시도해주세요.');
      console.error(err);
      // 에러 시 타이머 재시작
      startTimer();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    setIsEnding(true);
    setError(null);

    try {
      const response = await endInterview(interviewId);
      navigate(`/interview/${interviewId}/result`, {
        state: {
          result: response,
          history: answerHistory,
        },
      });
    } catch (err) {
      setError('면접을 종료할 수 없습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsEnding(false);
    }
  };

  if (!state) {
    return null;
  }

  return (
    <>
      {/* 진행 상태 바 */}
      <div className="bg-white border-b border-background-dark">
        <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1.5 bg-background text-primary rounded-lg text-sm font-medium">
              {interviewType && INTERVIEW_TYPE_LABELS[interviewType]}
            </span>
            <span className="px-3 py-1.5 bg-background-dark text-text-light rounded-lg text-sm font-medium">
              {interviewDifficulty && INTERVIEW_DIFFICULTY_LABELS[interviewDifficulty].label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* 타이머 표시 */}
            {currentQuestion && (
              <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-mono font-semibold">
                {formatTime(elapsedTime)}
              </span>
            )}
            <span className="text-text font-semibold">
              질문 {answerHistory.length + (currentQuestion ? 1 : 0)} / 5
            </span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
            {/* 질문 및 답변 입력 */}
            {currentQuestion && (
              <div>
                <div className="mb-8">
                  <span className="inline-block px-4 py-1.5 bg-primary text-white rounded-lg text-sm font-semibold mb-4">
                    Q{currentQuestion.orderNumber}
                  </span>
                  <p className="text-xl sm:text-2xl font-medium text-text leading-relaxed">
                    {currentQuestion.content}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-text-light mb-3">
                    답변을 입력해주세요
                  </label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="여기에 답변을 입력하세요..."
                    disabled={isSubmitting}
                    className="w-full min-h-[250px] p-5 border-2 border-background-dark rounded-xl text-base leading-relaxed resize-y focus:border-primary focus:outline-none transition-colors disabled:bg-background-dark"
                  />
                  <div className="text-right text-sm text-text-muted mt-2">{answer.length}자</div>
                </div>

                {error && <p className="text-error mb-4">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={isSubmitting || !answer.trim()}
                    className={`flex-1 py-4 px-8 text-lg font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer ${
                      isSubmitting || !answer.trim()
                        ? 'bg-background-dark text-text-muted cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-lg'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" color="white" />
                        <span>제출 중...</span>
                      </>
                    ) : (
                      '답변 제출'
                    )}
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(true)}
                    disabled={isEnding}
                    className={`py-4 px-8 text-lg font-semibold rounded-xl transition-all inline-flex items-center justify-center cursor-pointer ${
                      isEnding
                        ? 'text-text-muted border border-background-dark cursor-not-allowed'
                        : 'text-text-light border border-background-dark hover:border-primary hover:text-primary'
                    }`}
                  >
                    면접 종료
                  </button>
                </div>
              </div>
            )}

            {/* 모든 질문 완료 */}
            {!currentQuestion && (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-text mb-4">모든 질문이 완료되었습니다</h2>
                <p className="text-text-light mb-8">면접 결과를 확인해보세요.</p>
                <button
                  onClick={handleEndInterview}
                  disabled={isEnding}
                  className="px-10 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 min-w-[200px] cursor-pointer"
                >
                  {isEnding ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      <span>결과 생성 중...</span>
                    </>
                  ) : (
                    '결과 보기'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 면접 종료 확인 모달 */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 sm:p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-text mb-2">면접을 종료하시겠습니까?</h3>
              <p className="text-text-muted mb-6">
                아직 {5 - answerHistory.length}개의 질문이 남았습니다.<br />
                종료하면 현재까지의 답변으로 결과가 생성됩니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-3 px-4 text-text-light font-semibold border border-background-dark rounded-xl hover:border-primary hover:text-primary transition-all cursor-pointer"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    setShowEndConfirm(false);
                    handleEndInterview();
                  }}
                  disabled={isEnding}
                  className="flex-1 py-3 px-4 text-white font-semibold bg-primary rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isEnding ? '종료 중...' : '면접 종료'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
