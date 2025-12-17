import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { InterviewEndResponse, EvaluationResult, QuestionResponse } from '../../types';
import { formatMarkdown } from '../../utils/formatMarkdown';

interface AnswerHistory {
  question: QuestionResponse;
  userAnswer: string;
  evaluation: EvaluationResult;
  answerTimeSeconds: number;
}

interface LocationState {
  result: InterviewEndResponse;
  history: AnswerHistory[];
}

// 시간 포맷팅 함수
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}분 ${secs}초`;
  }
  return `${secs}초`;
};

export default function InterviewResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());

  const toggleAnswer = (index: number) => {
    setExpandedAnswers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!state) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-text mb-4">결과를 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const { result, history } = state;
  const { summary } = result;
  const categoryScores = Object.entries(summary.categoryScores);

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-success';
    if (score >= 6) return 'text-primary';
    return 'text-error';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-success';
    if (score >= 6) return 'bg-primary';
    return 'bg-error';
  };

  // 레이더 차트 그리기
  const renderRadarChart = () => {
    const size = 300;
    const center = size / 2;
    const radius = size / 2 - 40;
    const angleStep = (2 * Math.PI) / categoryScores.length;

    const points = categoryScores.map(([, score], index) => {
      const angle = index * angleStep - Math.PI / 2;
      const normalizedScore = score / 10;
      const x = center + radius * normalizedScore * Math.cos(angle);
      const y = center + radius * normalizedScore * Math.sin(angle);
      return { x, y };
    });

    const gridLines = [0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => {
      const gridPoints = categoryScores.map((_, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = center + radius * scale * Math.cos(angle);
        const y = center + radius * scale * Math.sin(angle);
        return `${x},${y}`;
      });
      return gridPoints.join(' ');
    });

    const axisLines = categoryScores.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return { x1: center, y1: center, x2: x, y2: y };
    });

    const labels = categoryScores.map(([category], index) => {
      const angle = index * angleStep - Math.PI / 2;
      const labelRadius = radius + 25;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);
      return { category, x, y };
    });

    const dataPointsString = points.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <svg width={size} height={size} className="overflow-visible">
        {gridLines.map((pts, index) => (
          <polygon key={index} points={pts} fill="none" stroke="#FEF3C7" strokeWidth="1" />
        ))}
        {axisLines.map((line, index) => (
          <line key={index} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke="#FEF3C7" strokeWidth="1" />
        ))}
        <polygon points={dataPointsString} fill="rgba(245, 158, 11, 0.3)" stroke="#F59E0B" strokeWidth="2" />
        {points.map((point, index) => (
          <circle key={index} cx={point.x} cy={point.y} r="5" fill="#F59E0B" />
        ))}
        {labels.map((label, index) => (
          <text key={index} x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill="#57534E" fontWeight="500">
            {label.category}
          </text>
        ))}
      </svg>
    );
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-text mb-10">면접 결과</h1>

          {/* 종합 점수 */}
          <div className="text-center mb-12">
            <span className="text-lg text-text-muted">종합 점수</span>
            <div className="flex items-baseline justify-center gap-2">
              <span className={`text-7xl sm:text-8xl font-bold ${getScoreColor(summary.overallScore)}`}>
                {summary.overallScore}
              </span>
              <span className="text-2xl text-text-muted">/ 10</span>
            </div>
            {/* 총 소요 시간 */}
            <div className="mt-4 text-text-muted">
              총 소요 시간: <span className="font-semibold text-text">{formatTime(history.reduce((acc, item) => acc + item.answerTimeSeconds, 0))}</span>
            </div>
          </div>

          {/* 레이더 차트 & 분야별 점수 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div>
              <h2 className="text-xl font-semibold text-text mb-6">분야별 점수</h2>
              <div className="flex justify-center">{renderRadarChart()}</div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text mb-6">상세 점수</h2>
              <div className="space-y-4">
                {categoryScores.map(([category, score]) => (
                  <div key={category} className="flex items-center gap-4">
                    <span className="w-32 text-sm text-text-light">{category}</span>
                    <div className="flex-1 h-3 bg-background-dark rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getScoreBgColor(score)} rounded-full transition-all duration-500`}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-semibold text-text">{score}/10</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 종합 평가 */}
          <div className="bg-background rounded-xl p-6 mb-12">
            <h2 className="text-xl font-semibold text-text mb-4">종합 평가</h2>
            <p className="text-text-light leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(summary.summary) }} />
          </div>

          {/* 답변 기록 */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-text mb-6">답변 기록</h2>
            <div className="space-y-6">
              {history.map((item, index) => {
                const isExpanded = expandedAnswers.has(index);
                return (
                  <div key={index} className="border border-background-dark rounded-xl overflow-hidden">
                    {/* 질문 헤더 */}
                    <div
                      className="p-6 cursor-pointer hover:bg-background/50 transition-colors"
                      onClick={() => toggleAnswer(index)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                              Q{item.question.orderNumber}
                            </span>
                            <span className="text-sm text-text-muted">
                              소요 시간: {formatTime(item.answerTimeSeconds)}
                            </span>
                          </div>
                          <p className="text-lg font-medium text-text" dangerouslySetInnerHTML={{ __html: formatMarkdown(item.question.content) }} />
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-2xl font-bold ${getScoreColor(item.evaluation.score)}`}>
                            {item.evaluation.score}/10
                          </span>
                          <svg
                            className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* 상세 내용 (펼쳐졌을 때) */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4 border-t border-background-dark pt-4">
                        {/* 내 답변 */}
                        <div className="bg-background rounded-lg p-4">
                          <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">내 답변</span>
                          <p className="text-text-light mt-2 whitespace-pre-wrap">{item.userAnswer}</p>
                        </div>

                        {/* 피드백 */}
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">AI 피드백</span>
                          <p className="text-text-light mt-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(item.evaluation.feedback) }} />
                        </div>

                        {/* 모범 답안 */}
                        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
                          <span className="text-xs font-semibold text-accent uppercase tracking-wider">모범 답안</span>
                          <p className="text-text-light mt-2 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatMarkdown(item.evaluation.modelAnswer) }} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/interview/start')}
              className="px-8 py-4 text-lg font-bold text-white bg-primary rounded-xl hover:bg-primary-dark transition-all shadow-lg cursor-pointer"
            >
              새 면접 시작
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-8 py-4 text-lg font-semibold text-text-light bg-white border-2 border-background-dark rounded-xl hover:border-primary hover:text-primary transition-all cursor-pointer"
            >
              홈으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
