import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import type { LoginRequest, SignupRequest, LoginResponse } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, setUser, setLoading, logout: clearAuth } = useAuthStore();

  const handleAuthSuccess = useCallback(
    (response: LoginResponse) => {
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
    },
    [setUser]
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      setLoading(true);
      try {
        const response = await authApi.login(data);
        handleAuthSuccess(response);
        navigate('/');
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading, handleAuthSuccess]
  );

  const signup = useCallback(
    async (data: SignupRequest) => {
      setLoading(true);
      try {
        await authApi.signup(data);
        navigate('/signup-success', { state: { email: data.email } });
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // 로그아웃 API 실패해도 로컬 상태는 정리
    } finally {
      clearAuth();
      navigate('/login');
    }
  }, [clearAuth, navigate]);

  const googleLogin = useCallback(
    async (code: string) => {
      setLoading(true);
      try {
        const response = await authApi.googleLogin(code);
        handleAuthSuccess(response);
        navigate('/');
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading, handleAuthSuccess]
  );

  const naverLogin = useCallback(
    async (code: string, state: string) => {
      setLoading(true);
      try {
        const response = await authApi.naverLogin(code, state);
        handleAuthSuccess(response);
        navigate('/');
      } finally {
        setLoading(false);
      }
    },
    [navigate, setLoading, handleAuthSuccess]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    googleLogin,
    naverLogin,
  };
}
