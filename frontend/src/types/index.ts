// User Types
export interface User {
  id: number;
  email: string;
  nickname: string;
  profileImage?: string;
  subscriptionType: 'FREE' | 'PREMIUM';
  subscriptionExpiresAt?: string;
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
export type JobType = 'BACKEND' | 'FRONTEND' | 'FULLSTACK' | 'DEVOPS' | 'DATA';
export type Difficulty = 'JUNIOR' | 'MIDDLE' | 'SENIOR';
export type InterviewStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface InterviewCreateRequest {
  jobType: JobType;
  techStacks: string[];
  difficulty: Difficulty;
  interviewType: string[];
  questionCount: number;
}

export interface Interview {
  id: number;
  jobType: JobType;
  techStacks: string[];
  difficulty: Difficulty;
  interviewType: string[];
  status: InterviewStatus;
  totalScore?: number;
  startedAt: string;
  completedAt?: string;
}

// Question Types
export interface Question {
  id: number;
  content: string;
  category: string;
  orderNum: number;
  referenceAnswer?: string;
  keywords?: string[];
}

export interface Answer {
  id: number;
  questionId: number;
  userAnswer: string;
  accuracyScore: number;
  specificityScore: number;
  logicScore: number;
  feedback: string;
  mentionedKeywords: string[];
  missedKeywords: string[];
  createdAt: string;
}

// Dashboard Types
export interface DashboardSummary {
  totalInterviews: number;
  avgScore: number;
  streakDays: number;
  weakAreas: string[];
}

export interface WeaknessAnalysis {
  categories: string[];
  scores: number[];
  recommendations: string[];
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
