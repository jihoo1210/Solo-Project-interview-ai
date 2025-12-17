import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterviewDetail, resumeInterview } from '../../api/interview';
import type { InterviewDetailResponse } from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';
import { LoadingSpinner } from '../../components/common';

export default function InterviewDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<InterviewDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchInterviewDetail(parseInt(id));
    }
  }, [id]);

  const fetchInterviewDetail = async (interviewId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getInterviewDetail(interviewId);
      setInterview(response);
    } catch (err) {
      setError('면접 상세 정보를 불러올 수 없습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-text-muted';
    if (score >= 7) return 'text-success';
    if (score >= 5) return 'text-primary';
    return 'text-error';
  };

  const handleResumeInterview = async () => {
    if (!interview) return;

    setIsResuming(true);
    setError(null);

    try {
      const response = await resumeInterview(interview.id);
      navigate(`/interview/${interview.id}`, {
        state: {
          interviewId: response.interviewId,
          type: response.type,
          difficulty: response.difficulty,
          currentQuestion: response.currentQuestion,
        },
      });
    } catch (err) {
      setError('면접을 계속할 수 없습니다. 다시 시도해주세요.');
      console.error(err);
    } finally {
      setIsResuming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-xl p-8">
          <div className="text-center py-16 flex flex-col items-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-text-muted mt-4">면접 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-xl p-8">
          <div className="text-center py-16">
            <p className="text-error mb-4 cursor-pointer">{error || '면접 정보를 찾을 수 없습니다.'}</p>
            <button
              onClick={() => navigate('/interviews')}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* 요약 정보 카드 */}
      <div className="bg-white shadow rounded-xl p-6 sm:p-8 mb-6">
        {/* 배지들 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded-full">
            {INTERVIEW_TYPE_LABELS[interview.type]}
          </span>
          <span className="px-3 py-1 bg-background-dark text-text-light text-sm font-semibold rounded-full">
            {INTERVIEW_DIFFICULTY_LABELS[interview.difficulty].label}
          </span>
          <span
            className={`px-3 py-1 text-sm font-semibold rounded-full ${
              interview.status === 'COMPLETED'
                ? 'bg-success/20 text-success'
                : 'bg-primary/20 text-primary'
            }`}
          >
            {interview.status === 'COMPLETED' ? '완료' : '진행 중'}
          </span>
        </div>

        {/* 날짜 정보 */}
        <div className="flex flex-wrap gap-6 text-sm text-text-muted mb-6">
          <span>시작: {formatDate(interview.startedAt)}</span>
          {interview.endedAt && <span>종료: {formatDate(interview.endedAt)}</span>}
        </div>

        {/* 종합 점수 */}
        {interview.totalScore !== null && (
          <div className="bg-background rounded-xl p-6 text-center">
            <span className="block text-sm text-text-muted mb-2">종합 점수</span>
            <span className={`text-5xl font-bold ${getScoreColor(interview.totalScore)}`}>
              {interview.totalScore}
            </span>
            <span className="text-2xl text-text-muted ml-1">/ 10</span>
          </div>
        )}
      </div>

      {/* 질문 및 답변 목록 */}
      <div className="bg-white shadow rounded-xl p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-text mb-6">
          질문 및 답변 ({interview.questions.length}개)
        </h2>

        <div className="space-y-6">
          {interview.questions.map((question) => (
            <div key={question.id} className="border border-background-dark rounded-xl p-5 sm:p-6">
              {/* 질문 헤더 */}
              <div className="flex gap-2 mb-3">
                <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                  Q{question.orderNumber}
                </span>
                <span className="px-3 py-1 bg-background-dark text-text-light text-xs font-medium rounded-full">
                  {question.category}
                </span>
              </div>

              {/* 질문 내용 */}
              <p className="text-lg font-medium text-text mb-4 leading-relaxed">
                {question.content}
              </p>

              {question.answer ? (
                <div className="bg-background rounded-xl p-5 space-y-4">
                  {/* 내 답변 */}
                  <div>
                    <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">내 답변</h4>
                    <div className="bg-white border border-background-dark rounded-lg p-4">
                      <p className="text-text-light leading-relaxed">{question.answer.content}</p>
                    </div>
                  </div>

                  {/* 점수 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-muted">점수:</span>
                    <span className={`text-xl font-bold ${getScoreColor(question.answer.score)}`}>
                      {question.answer.score}/10
                    </span>
                  </div>

                  {/* 피드백 */}
                  <div className='bg-white border border-background-dark rounded-lg p-4'>
                    <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">피드백</h4>
                    <p className="text-text-light leading-relaxed">{question.answer.feedback}</p>
                  </div>

                  {/* 모범 답안 */}
                  <div className="bg-white border border-background-dark rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-accent uppercase mb-2">모범 답안</h4>
                    <p className="text-text-light leading-relaxed">{question.answer.modelAnswer}</p>
                  </div>
                </div>
              ) : (
                <p className="text-text-muted italic">답변 없음</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-6 p-4 bg-error/10 border border-error/30 rounded-xl text-center">
          <p className="text-error">{error}</p>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        {interview.status === 'IN_PROGRESS' && (
          <button
            onClick={handleResumeInterview}
            disabled={isResuming}
            className="px-8 py-4 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg disabled:opacity-50 inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {isResuming ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>불러오는 중...</span>
              </>
            ) : (
              '면접 계속하기'
            )}
          </button>
        )}
        <button
          onClick={() => navigate('/interviews')}
          className="px-8 py-4 text-lg font-semibold text-text-light bg-white border-2 border-background-dark rounded-xl hover:border-primary hover:text-primary transition-all cursor-pointer"
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
