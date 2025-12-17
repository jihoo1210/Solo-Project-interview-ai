import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import PrivateRoute from './components/auth/PrivateRoute';
import MainLayout from './components/layout/MainLayout';
import PublicLayout from './components/layout/PublicLayout';
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
import ErrorPage from './pages/ErrorPage';
import InterviewStartPage from './pages/interview/InterviewStartPage';
import InterviewPage from './pages/interview/InterviewPage';
import InterviewResultPage from './pages/interview/InterviewResultPage';
import InterviewListPage from './pages/interview/InterviewListPage';
import InterviewDetailPage from './pages/interview/InterviewDetailPage';
import PaymentPage from './pages/payment/PaymentPage';
import PaymentSuccessPage from './pages/payment/PaymentSuccessPage';
import PaymentFailPage from './pages/payment/PaymentFailPage';

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
        {/* Auth Routes (No Layout) */}
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

        {/* Error Page */}
        <Route path="/error" element={<ErrorPage />} />

        {/* Public Home with PublicLayout (비로그인 사용자용) */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        {/* Protected Routes with MainLayout */}
        <Route
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/interviews" element={<InterviewListPage />} />
          <Route path="/interviews/:id" element={<InterviewDetailPage />} />
          <Route path="/interview/start" element={<InterviewStartPage />} />
          <Route path="/interview/:id" element={<InterviewPage />} />
          <Route path="/interview/:id/result" element={<InterviewResultPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/fail" element={<PaymentFailPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
