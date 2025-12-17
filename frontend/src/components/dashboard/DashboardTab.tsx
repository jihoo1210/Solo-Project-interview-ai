import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import * as dashboardApi from '../../api/dashboard';
import type {
  DashboardStatsResponse,
  ScoreTrendResponse,
  CategoryAnalysisResponse,
  RecentInterviewResponse,
} from '../../types';
import { INTERVIEW_TYPE_LABELS, INTERVIEW_DIFFICULTY_LABELS } from '../../types';

export default function DashboardTab() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [scoreTrend, setScoreTrend] = useState<ScoreTrendResponse[]>([]);
  const [categoryAnalysis, setCategoryAnalysis] = useState<CategoryAnalysisResponse | null>(null);
  const [recentInterviews, setRecentInterviews] = useState<RecentInterviewResponse[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, trendData, analysisData, recentData] = await Promise.all([
          dashboardApi.getDashboardStats(),
          dashboardApi.getScoreTrend(10),
          dashboardApi.getCategoryAnalysis(),
          dashboardApi.getRecentInterviews(5),
        ]);
        setStats(statsData);
        setScoreTrend(trendData);
        setCategoryAnalysis(analysisData);
        setRecentInterviews(recentData);
      } catch (err) {
        setError('대시보드 데이터를 불러오는데 실패했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#22C55E';
    if (score >= 6) return '#F59E0B';
    return '#EF4444';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!stats || stats.completedInterviews === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-background-dark rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-text mb-2">아직 완료된 면접이 없습니다</h3>
        <p className="text-text-muted mb-6">면접을 완료하면 통계를 확인할 수 있습니다.</p>
        <button
          onClick={() => navigate('/interview/start')}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark cursor-pointer"
        >
          면접 시작하기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-background rounded-xl p-4">
          <p className="text-text-muted text-sm">총 면접</p>
          <p className="text-2xl font-bold text-text">{stats.totalInterviews}회</p>
        </div>
        <div className="bg-background rounded-xl p-4">
          <p className="text-text-muted text-sm">완료된 면접</p>
          <p className="text-2xl font-bold text-text">{stats.completedInterviews}회</p>
        </div>
        <div className="bg-background rounded-xl p-4">
          <p className="text-text-muted text-sm">평균 점수</p>
          <p className="text-2xl font-bold" style={{ color: getScoreColor(stats.averageScore || 0) }}>
            {stats.averageScore ?? '-'}점
          </p>
        </div>
        <div className="bg-background rounded-xl p-4">
          <p className="text-text-muted text-sm">이번 달</p>
          <p className="text-2xl font-bold text-text">{stats.thisMonthCount}회</p>
        </div>
      </div>

      {/* Score Range */}
      <div className="bg-background rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-text-muted text-sm">최고 점수</p>
            <p className="text-xl font-bold text-success">{stats.highestScore ?? '-'}점</p>
          </div>
          <div className="h-12 w-px bg-background-dark" />
          <div>
            <p className="text-text-muted text-sm">최저 점수</p>
            <p className="text-xl font-bold text-error">{stats.lowestScore ?? '-'}점</p>
          </div>
        </div>
      </div>

      {/* Score Trend Chart */}
      {scoreTrend.length > 0 && (
        <div className="bg-background rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text mb-4">점수 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  stroke="#78716C"
                  fontSize={12}
                />
                <YAxis domain={[0, 10]} stroke="#78716C" fontSize={12} />
                <Tooltip
                  formatter={(value) => [`${value}점`, '점수']}
                  labelFormatter={(label) => formatDate(label)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Analysis */}
      {categoryAnalysis && categoryAnalysis.byType.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* By Type */}
          <div className="bg-background rounded-xl p-4">
            <h3 className="text-lg font-semibold text-text mb-4">유형별 평균 점수</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalysis.byType} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" domain={[0, 10]} stroke="#78716C" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="type"
                    tickFormatter={(type) => INTERVIEW_TYPE_LABELS[type as keyof typeof INTERVIEW_TYPE_LABELS] || type}
                    stroke="#78716C"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, _, props) => [
                      `${value}점 (${props.payload.count}회)`,
                      '평균 점수'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                    {categoryAnalysis.byType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.avgScore)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* By Difficulty */}
          <div className="bg-background rounded-xl p-4">
            <h3 className="text-lg font-semibold text-text mb-4">난이도별 평균 점수</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryAnalysis.byDifficulty} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" domain={[0, 10]} stroke="#78716C" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="difficulty"
                    tickFormatter={(diff) => INTERVIEW_DIFFICULTY_LABELS[diff as keyof typeof INTERVIEW_DIFFICULTY_LABELS]?.label || diff}
                    stroke="#78716C"
                    fontSize={12}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value, _, props) => [
                      `${value}점 (${props.payload.count}회)`,
                      '평균 점수'
                    ]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="avgScore" radius={[0, 4, 4, 0]}>
                    {categoryAnalysis.byDifficulty.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getScoreColor(entry.avgScore)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Strength/Weakness */}
      {categoryAnalysis && (categoryAnalysis.strongCategories.length > 0 || categoryAnalysis.weakCategories.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categoryAnalysis.strongCategories.length > 0 && (
            <div className="bg-success/10 border border-success/30 rounded-xl p-4">
              <h3 className="text-success font-semibold mb-2">강점 분야</h3>
              <div className="flex flex-wrap gap-2">
                {categoryAnalysis.strongCategories.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-success/20 text-success rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
          {categoryAnalysis.weakCategories.length > 0 && (
            <div className="bg-error/10 border border-error/30 rounded-xl p-4">
              <h3 className="text-error font-semibold mb-2">보완이 필요한 분야</h3>
              <div className="flex flex-wrap gap-2">
                {categoryAnalysis.weakCategories.map((cat) => (
                  <span key={cat} className="px-3 py-1 bg-error/20 text-error rounded-full text-sm">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Interviews */}
      {recentInterviews.length > 0 && (
        <div className="bg-background rounded-xl p-4">
          <h3 className="text-lg font-semibold text-text mb-4">최근 면접</h3>
          <div className="space-y-3">
            {recentInterviews.map((interview) => (
              <div
                key={interview.id}
                onClick={() => navigate(`/interview/${interview.id}`)}
                className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: getScoreColor(interview.totalScore) }}
                  >
                    {interview.totalScore}
                  </div>
                  <div>
                    <p className="font-medium text-text">
                      {INTERVIEW_TYPE_LABELS[interview.type]} - {INTERVIEW_DIFFICULTY_LABELS[interview.difficulty]?.label}
                    </p>
                    <p className="text-sm text-text-muted">
                      {new Date(interview.createdAt).toLocaleDateString('ko-KR')} | {interview.questionCount}문제
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
