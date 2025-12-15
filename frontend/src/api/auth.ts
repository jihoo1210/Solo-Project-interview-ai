import apiClient from './client';
import type { ApiResponse, LoginRequest, SignupRequest, LoginResponse } from '../types';

export const authApi = {
  signup: async (data: SignupRequest): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/api/v1/auth/signup', data);
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/auth/login', data);
    return response.data.data!;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    await apiClient.post<ApiResponse<void>>('/api/v1/auth/logout', { refreshToken });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/api/v1/auth/refresh', {
      refreshToken,
    });
    return response.data.data!;
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post<ApiResponse<void>>('/api/v1/auth/resend-verification', { email });
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.get<ApiResponse<void>>(`/api/v1/auth/verify-email?token=${token}`);
  },

  googleLogin: async (code: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/oauth/google', { code });
    return response.data.data!;
  },

  naverLogin: async (code: string, state: string): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/api/v1/oauth/naver', { code, state });
    return response.data.data!;
  },
};
