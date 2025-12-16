import apiClient from './client';
import type { ApiResponse, User, LoginResponse } from '../types';

export interface UpdateProfileRequest {
  nickname?: string;
  profileImage?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export const userApi = {
  getMyProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/api/v1/users/me');
    return response.data.data!;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/api/v1/users/me', data);
    return response.data.data!;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<LoginResponse> => {
    const response = await apiClient.patch<ApiResponse<LoginResponse>>('/api/v1/users/me/password', data);
    return response.data.data!;
  },
};
