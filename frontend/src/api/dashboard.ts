import apiClient from './client';
import type {
  ApiResponse,
  DashboardStatsResponse,
  ScoreTrendResponse,
  CategoryAnalysisResponse,
  RecentInterviewResponse,
} from '../types';

// 대시보드 통계 조회
export const getDashboardStats = async (): Promise<DashboardStatsResponse> => {
  const response = await apiClient.get<ApiResponse<DashboardStatsResponse>>(
    '/api/v1/dashboard/stats'
  );
  return response.data.data!;
};

// 점수 추이 조회
export const getScoreTrend = async (limit: number = 10): Promise<ScoreTrendResponse[]> => {
  const response = await apiClient.get<ApiResponse<ScoreTrendResponse[]>>(
    '/api/v1/dashboard/score-trend',
    { params: { limit } }
  );
  return response.data.data!;
};

// 카테고리별 분석 조회
export const getCategoryAnalysis = async (): Promise<CategoryAnalysisResponse> => {
  const response = await apiClient.get<ApiResponse<CategoryAnalysisResponse>>(
    '/api/v1/dashboard/category-analysis'
  );
  return response.data.data!;
};

// 최근 면접 목록 조회
export const getRecentInterviews = async (limit: number = 5): Promise<RecentInterviewResponse[]> => {
  const response = await apiClient.get<ApiResponse<RecentInterviewResponse[]>>(
    '/api/v1/dashboard/recent',
    { params: { limit } }
  );
  return response.data.data!;
};
