import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import PrivateRoute from './components/auth/PrivateRoute';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import SignupSuccessPage from './pages/auth/SignupSuccessPage';
import EmailVerifyPage from './pages/auth/EmailVerifyPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DeleteAccountPage from './pages/auth/DeleteAccountPage';
import DeleteAccountConfirmPage from './pages/auth/DeleteAccountConfirmPage';
import GoogleCallbackPage from './pages/auth/GoogleCallbackPage';
import NaverCallbackPage from './pages/auth/NaverCallbackPage';
import HomePage from './pages/HomePage';
import MyPage from './pages/MyPage';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignupPage />
            </PublicRoute>
          }
        />
        <Route path="/signup-success" element={<SignupSuccessPage />} />
        <Route path="/verify-email" element={<EmailVerifyPage />} />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/delete-account"
          element={
            <PublicRoute>
              <DeleteAccountPage />
            </PublicRoute>
          }
        />
        <Route path="/confirm-delete-account" element={<DeleteAccountConfirmPage />} />

        {/* OAuth Callback Routes */}
        <Route path="/oauth/callback/google" element={<GoogleCallbackPage />} />
        <Route path="/oauth/callback/naver" element={<NaverCallbackPage />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/mypage"
          element={
            <PrivateRoute>
              <MyPage />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
