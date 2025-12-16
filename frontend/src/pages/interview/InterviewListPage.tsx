import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterviewList, type PageResponse } from '../../api/interview';
import type { InterviewListItem } from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';
import { LoadingSpinner } from '../../components/common';

export default function InterviewListPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<InterviewListItem[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, [page]);

  const fetchInterviews = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response: PageResponse<InterviewListItem> = await getInterviewList(page, 10);
      setInterviews(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError('면접 기록을 불러올 수 없습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
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
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-primary';
    return 'text-error';
  };

  return (
    <div className="w-full" style={{ maxWidth: '896px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="text-2xl font-bold text-text mb-6">면접 기록</h1>
      <div className="bg-white shadow rounded-xl p-6 sm:p-8">
        {isLoading ? (
          <div className="text-center py-16 flex flex-col items-center">
            <LoadingSpinner size="lg" color="primary" />
            <p className="text-text-muted mt-4">면접 기록을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-error mb-4">{error}</p>
            <button
              onClick={fetchInterviews}
              className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-background-dark rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-text-muted text-lg mb-6">아직 면접 기록이 없습니다.</p>
            <button
              onClick={() => navigate('/interview/start')}
              className="px-8 py-4 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
            >
              첫 면접 시작하기
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  onClick={() => navigate(`/interviews/${interview.id}`)}
                  className="border border-background-dark rounded-xl p-5 sm:p-6 cursor-pointer hover:border-primary hover:bg-background transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        {INTERVIEW_TYPE_LABELS[interview.type]}
                      </span>
                      <span className="px-3 py-1 bg-background-dark text-text-light text-xs font-semibold rounded-full">
                        {INTERVIEW_DIFFICULTY_LABELS[interview.difficulty].label}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          interview.status === 'COMPLETED'
                            ? 'bg-success/20 text-success'
                            : 'bg-primary/20 text-primary'
                        }`}
                      >
                        {interview.status === 'COMPLETED' ? '완료' : '진행 중'}
                      </span>
                    </div>
                    <span className="text-sm text-text-muted">{formatDate(interview.createdAt)}</span>
                  </div>
                  <div className="flex gap-8">
                    <div>
                      <span className="text-xs text-text-muted">질문 수</span>
                      <p className="text-lg font-semibold text-text">{interview.questionCount}개</p>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted">점수</span>
                      <p className={`text-xl font-bold ${getScoreColor(interview.totalScore)}`}>
                        {interview.totalScore !== null ? `${interview.totalScore}/10` : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    page === 0
                      ? 'bg-background-dark text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  이전
                </button>
                <span className="text-text-light">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className={`px-5 py-2.5 rounded-lg font-medium transition-colors ${
                    page >= totalPages - 1
                      ? 'bg-background-dark text-text-muted cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
