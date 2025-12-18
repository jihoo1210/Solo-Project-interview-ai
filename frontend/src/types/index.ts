// User Types
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  subscriptionType: 'FREE' | 'PREMIUM';
  subscriptionExpiresAt?: string;
  subscriptionCancelled?: boolean;
  emailVerified: boolean;
  provider: 'LOCAL' | 'GOOGLE' | 'NAVER';
  createdAt: string;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

// Interview Types
export type InterviewType = 'FRONTEND' | 'BACKEND' | 'FULLSTACK' | 'DEVOPS' | 'DATA' | 'MOBILE' | 'OTHER';
export type InterviewDifficulty = 'JUNIOR' | 'MID' | 'SENIOR';
export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED';

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  FRONTEND: '프론트엔드',
  BACKEND: '백엔드',
  FULLSTACK: '풀스택',
  DEVOPS: '데브옵스',
  DATA: '데이터',
  MOBILE: '모바일',
  OTHER: '기타',
};

export const INTERVIEW_DIFFICULTY_LABELS: Record<InterviewDifficulty, { label: string; experience: string }> = {
  JUNIOR: { label: '주니어', experience: '0-2년차' },
  MID: { label: '미드레벨', experience: '3-5년차' },
  SENIOR: { label: '시니어', experience: '6년차 이상' },
};

// Interview Request/Response Types
export interface InterviewStartRequest {
  type: InterviewType;
  difficulty: InterviewDifficulty;
  customType?: string;
  questionLimit: number;
  followUpEnabled: boolean;
}

export interface QuestionResponse {
  id: number;
  content: string;
  orderNumber: number;
  category: string;
}

export interface InterviewStartResponse {
  interviewId: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  firstQuestion: QuestionResponse;
}

export interface AnswerSubmitRequest {
  questionId: number;
  content: string;
  answerTimeSeconds?: number;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  modelAnswer: string;
}

export interface AnswerSubmitResponse {
  evaluation: EvaluationResult;
  nextQuestion: QuestionResponse | null;
}

export interface SummaryResult {
  summary: string;
  overallScore: number;
  categoryScores: Record<string, number>;
}

export interface InterviewEndResponse {
  interviewId: number;
  totalScore: number;
  questionCount: number;
  summary: SummaryResult;
}

export interface InterviewResumeResponse {
  interviewId: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  currentQuestion: QuestionResponse;
  answeredCount: number;
}

// Interview List Response
export interface InterviewListItem {
  id: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  totalScore: number | null;
  questionCount: number;
  createdAt: string;
}

// Interview Detail Response
export interface InterviewDetailAnswer {
  id: number;
  content: string;
  score: number;
  feedback: string;
  modelAnswer: string;
  answerTimeSeconds?: number;
}

export interface InterviewDetailQuestion {
  id: number;
  content: string;
  orderNumber: number;
  category: string;
  answer: InterviewDetailAnswer | null;
}

export interface InterviewDetailResponse {
  id: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  status: InterviewStatus;
  totalScore: number | null;
  startedAt: string;
  endedAt: string | null;
  questions: InterviewDetailQuestion[];
}

// Dashboard Types
export interface DashboardStatsResponse {
  totalInterviews: number;
  completedInterviews: number;
  averageScore: number | null;
  highestScore: number | null;
  lowestScore: number | null;
  thisMonthCount: number;
}

export interface ScoreTrendResponse {
  interviewId: number;
  score: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  date: string;
}

export interface TypeScore {
  type: InterviewType;
  avgScore: number;
  count: number;
}

export interface DifficultyScore {
  difficulty: InterviewDifficulty;
  avgScore: number;
  count: number;
}

export interface CategoryAnalysisResponse {
  byType: TypeScore[];
  byDifficulty: DifficultyScore[];
  weakCategories: string[];
  strongCategories: string[];
}

export interface RecentInterviewResponse {
  id: number;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  totalScore: number;
  questionCount: number;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: number;
  name: string;
  message: string;
  details?: Record<string, string>;
  timestamp: string;
}

// Pagination
export interface PageRequest {
  page: number;
  size: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Payment Types
export type PlanType = 'PREMIUM_MONTHLY' | 'PREMIUM_YEARLY';
export type PaymentStatus = 'COMPLETED' | 'CANCELLED' | 'FAILED';

export interface PaymentPrepareResponse {
  customerKey: string;
  amount: number;
  orderName: string;
  customerEmail: string;
  customerName: string;
}

export interface BillingKeyIssueRequest {
  authKey: string;
  planType: PlanType;
}

export interface BillingKeyIssueResponse {
  paymentId: number;
  cardNumber: string | null;
  subscriptionExpiresAt: string;
}

export interface SubscriptionCancelResponse {
  message: string;
  subscriptionExpiresAt: string;
}

export interface PaymentResponse {
  id: number;
  orderId: string;
  planType: PlanType;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  approvedAt: string | null;
  createdAt: string;
}

export const PLAN_TYPE_LABELS: Record<PlanType, { name: string; price: number; originalPrice?: number; duration: string; discount?: string }> = {
  PREMIUM_MONTHLY: { name: 'Premium 월간 구독', price: 9900, duration: '30일' },
  PREMIUM_YEARLY: { name: 'Premium 연간 구독', price: 99000, originalPrice: 118800, duration: '365일', discount: '16% 할인' },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
  COMPLETED: { label: '완료', color: 'text-green-600' },
  CANCELLED: { label: '취소', color: 'text-gray-600' },
  FAILED: { label: '실패', color: 'text-red-600' },
};
