import { useState, useEffect } from 'react';
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
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const interviewId = state?.interviewId || parseInt(id || '0');
  const interviewType = state?.type;
  const interviewDifficulty = state?.difficulty;

  useEffect(() => {
    if (!state) {
      navigate('/interview/start');
    }
  }, [state, navigate]);

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) {
      setError('답변을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await submitAnswer(interviewId, {
        questionId: currentQuestion.id,
        content: answer.trim(),
      });

      setAnswerHistory((prev) => [
        ...prev,
        {
          question: currentQuestion,
          userAnswer: answer.trim(),
          evaluation: response.evaluation,
        },
      ]);

      setCurrentEvaluation(response.evaluation);
      setShowEvaluation(true);

      if (response.nextQuestion) {
        setCurrentQuestion(response.nextQuestion);
      } else {
        setCurrentQuestion(null);
      }

      setAnswer('');
    } catch (err) {
      setError('답변을 제출할 수 없습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setShowEvaluation(false);
    setCurrentEvaluation(null);
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
          <span className="text-text font-semibold">
            질문 {answerHistory.length + 1} / 5
          </span>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12">
            {/* 평가 결과 표시 */}
            {showEvaluation && currentEvaluation && (
              <div className="text-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-text mb-8">답변 평가 결과</h3>

                <div className="mb-8">
                  <span className="text-sm text-text-muted">점수</span>
                  <div className="text-6xl font-bold text-primary">
                    {currentEvaluation.score} <span className="text-2xl text-text-muted">/ 10</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 text-left">
                  <div className="bg-background rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-text mb-3">피드백</h4>
                    <p className="text-text-light leading-relaxed">{currentEvaluation.feedback}</p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-accent mb-3">모범 답안</h4>
                    <p className="text-text-light leading-relaxed">{currentEvaluation.modelAnswer}</p>
                  </div>
                </div>

                <button
                  onClick={currentQuestion ? handleNextQuestion : handleEndInterview}
                  disabled={isEnding}
                  className="px-10 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 inline-flex items-center justify-center min-w-[200px]"
                >
                  {isEnding ? (
                    <LoadingSpinner />
                  ) : currentQuestion ? (
                    '다음 질문'
                  ) : (
                    '면접 종료 및 결과 보기'
                  )}
                </button>
              </div>
            )}

            {/* 질문 및 답변 입력 */}
            {!showEvaluation && currentQuestion && (
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
                    className={`flex-1 py-4 px-8 text-lg font-semibold rounded-xl transition-all inline-flex items-center justify-center ${
                      isSubmitting || !answer.trim()
                        ? 'bg-background-dark text-text-muted cursor-not-allowed'
                        : 'bg-primary text-white hover:bg-primary-dark shadow-lg'
                    }`}
                  >
                    {isSubmitting ? <LoadingSpinner /> : '답변 제출'}
                  </button>
                  <button
                    onClick={handleEndInterview}
                    disabled={isEnding || answerHistory.length === 0}
                    className={`py-4 px-8 text-lg font-semibold rounded-xl transition-all inline-flex items-center justify-center ${
                      isEnding || answerHistory.length === 0
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
            {!showEvaluation && !currentQuestion && (
              <div className="text-center py-12">
                <h2 className="text-3xl font-bold text-text mb-4">모든 질문이 완료되었습니다</h2>
                <p className="text-text-light mb-8">면접 결과를 확인해보세요.</p>
                <button
                  onClick={handleEndInterview}
                  disabled={isEnding}
                  className="px-10 py-4 text-lg font-semibold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg disabled:opacity-50 inline-flex items-center justify-center min-w-[200px]"
                >
                  {isEnding ? <LoadingSpinner /> : '결과 보기'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
