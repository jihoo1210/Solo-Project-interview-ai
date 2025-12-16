import apiClient from './client';
import type {
  ApiResponse,
  InterviewStartRequest,
  InterviewStartResponse,
  AnswerSubmitRequest,
  AnswerSubmitResponse,
  InterviewEndResponse,
  InterviewResumeResponse,
  InterviewListItem,
  InterviewDetailResponse,
} from '../types';

// 면접 시작
export const startInterview = async (
  request: InterviewStartRequest
): Promise<InterviewStartResponse> => {
  const response = await apiClient.post<ApiResponse<InterviewStartResponse>>(
    '/api/interviews',
    request
  );
  return response.data.data!;
};

// 답변 제출
export const submitAnswer = async (
  interviewId: number,
  request: AnswerSubmitRequest
): Promise<AnswerSubmitResponse> => {
  const response = await apiClient.post<ApiResponse<AnswerSubmitResponse>>(
    `/api/interviews/${interviewId}/answers`,
    request
  );
  return response.data.data!;
};

// 면접 종료
export const endInterview = async (
  interviewId: number
): Promise<InterviewEndResponse> => {
  const response = await apiClient.post<ApiResponse<InterviewEndResponse>>(
    `/api/interviews/${interviewId}/end`
  );
  return response.data.data!;
};

// 면접 목록 조회
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const getInterviewList = async (
  page: number = 0,
  size: number = 10
): Promise<PageResponse<InterviewListItem>> => {
  const response = await apiClient.get<ApiResponse<PageResponse<InterviewListItem>>>(
    '/api/interviews',
    { params: { page, size } }
  );
  return response.data.data!;
};

// 면접 상세 조회
export const getInterviewDetail = async (
  interviewId: number
): Promise<InterviewDetailResponse> => {
  const response = await apiClient.get<ApiResponse<InterviewDetailResponse>>(
    `/api/interviews/${interviewId}`
  );
  return response.data.data!;
};

// 오늘 면접 횟수 조회
export const getTodayInterviewCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponse<number>>(
    '/api/interviews/today-count'
  );
  return response.data.data!;
};

// 면접 계속하기
export const resumeInterview = async (
  interviewId: number
): Promise<InterviewResumeResponse> => {
  const response = await apiClient.post<ApiResponse<InterviewResumeResponse>>(
    `/api/interviews/${interviewId}/resume`
  );
  return response.data.data!;
};
