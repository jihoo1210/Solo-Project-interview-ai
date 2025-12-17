import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import { authApi } from '../api/auth';
import DashboardTab from '../components/dashboard/DashboardTab';
import type { ApiError } from '../types';

export default function MyPage() {
  const { user } = useAuth();
  const { setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'profile' | 'password'>('dashboard');

  // Profile form state
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,}).*$/;

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);

    try {
      const updatedUser = await userApi.updateProfile({ nickname, profileImage: profileImage || undefined });
      setUser(updatedUser);
      setProfileSuccess('프로필이 업데이트되었습니다.');
    } catch (err) {
      const apiError = err as ApiError;
      setProfileError(apiError.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!passwordRegex.test(passwordData.newPassword)) {
      setPasswordError('비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await userApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      // Update tokens and user
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);

      setPasswordSuccess('비밀번호가 변경되었습니다.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const apiError = err as ApiError;
      setPasswordError(apiError.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const isOAuthUser = user?.provider !== 'LOCAL';

  const handleDeleteAccount = async () => {
    if (!user?.email) return;

    setDeleteError(null);
    setDeleteLoading(true);

    try {
      await authApi.requestDeleteAccount(user.email);
      setDeleteSuccess(true);
    } catch (err) {
      const apiError = err as ApiError;
      setDeleteError(apiError.message || '회원 탈퇴 요청에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full" style={{ maxWidth: '896px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 className="text-2xl font-bold text-text mb-6">마이페이지</h1>

      {/* User Info Card */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
            {user?.nickname?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-text">{user?.nickname}</h2>
            <p className="text-text-muted">{user?.email}</p>
            <div className="flex gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/20 text-primary">
                {user?.subscriptionType}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                user?.emailVerified ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
              }`}>
                {user?.emailVerified ? '이메일 인증 완료' : '이메일 미인증'}
              </span>
              {isOAuthUser && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-background-dark text-text-light">
                  {user?.provider} 계정
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Subscription Card */}
      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-text">구독 플랜</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                user?.subscriptionType === 'PREMIUM'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                  : 'bg-background-dark text-text-muted'
              }`}>
                {user?.subscriptionType}
              </span>
            </div>
            {user?.subscriptionType === 'FREE' ? (
              <p className="text-sm text-text-muted">
                일일 면접 3회 제한 | 질문 5개 고정 | 꼬리질문 비활성화
              </p>
            ) : (
              <p className="text-sm text-text-muted">
                무제한 면접 | 질문 개수 설정 | 꼬리질문 활성화
                {user?.subscriptionExpiresAt && (
                  <span className="ml-2">
                    (만료: {new Date(user.subscriptionExpiresAt).toLocaleDateString()})
                  </span>
                )}
              </p>
            )}
          </div>

          {user?.subscriptionType === 'FREE' && (
            <button
              onClick={() => alert('결제 시스템 준비 중입니다.')}
              className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg cursor-pointer"
            >
              Upgrade Premium
            </button>
          )}
        </div>

        {user?.subscriptionType === 'FREE' && (
          <div className="mt-4 pt-4 border-t border-background-dark">
            <h4 className="text-sm font-medium text-text mb-3">Premium 혜택</h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">1</span>
                무제한 면접 진행
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">2</span>
                질문 개수 자유 설정
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">3</span>
                답변 기반 꼬리질문
              </div>
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs">4</span>
                귀여운 노란색 토끼
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white shadow rounded-xl">
        <div className="border-b border-background-dark">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-background-dark'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-background-dark'
              }`}
            >
              프로필 수정
            </button>
            <button
              onClick={() => setActiveTab('password')}
              disabled={isOAuthUser}
              className={`flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm cursor-pointer ${
                activeTab === 'password'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text hover:border-background-dark'
              } ${isOAuthUser ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              비밀번호 변경
              {isOAuthUser && <span className="ml-1 text-xs">(불가)</span>}
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'dashboard' && <DashboardTab />}

          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileError && (
                <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
                  {profileError}
                </div>
              )}
              {profileSuccess && (
                <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-sm">
                  {profileSuccess}
                </div>
              )}

              <div>
                <label htmlFor="nickname" className="block text-sm font-medium text-text">
                  닉네임
                </label>
                <input
                  id="nickname"
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  minLength={2}
                  maxLength={20}
                  required
                  className="mt-1 block w-full px-3 py-2 bg-white border border-background-dark rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                <p className="mt-1 text-xs text-text-muted">2~20자</p>
              </div>

              <div className="opacity-50">
                <label htmlFor="profileImage" className="block text-sm font-medium text-text">
                  프로필 이미지 URL
                  <span className="ml-2 text-xs text-text-muted">(준비 중)</span>
                </label>
                <input
                  id="profileImage"
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  placeholder="https://example.com/image.png"
                  disabled
                  className="mt-1 block w-full px-3 py-2 bg-background border border-background-dark rounded-lg shadow-sm cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-text-muted">프로필 이미지 기능은 추후 업데이트 예정입니다.</p>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {profileLoading ? '저장 중...' : '프로필 저장'}
              </button>
            </form>
          )}

          {activeTab === 'password' && !isOAuthUser && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordError && (
                <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-text">
                  현재 비밀번호
                </label>
                <div className="relative mt-1">
                  <input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="block w-full px-3 py-2 pr-10 bg-white border border-background-dark rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                  >
                    {showCurrentPassword ? '🙈' : '🙊'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-text">
                  새 비밀번호
                </label>
                <div className="relative mt-1">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                    className="block w-full px-3 py-2 pr-10 bg-white border border-background-dark rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                  >
                    {showNewPassword ? '🙈' : '🙊'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  8자 이상, 대문자, 소문자, 숫자, 특수문자(!@#$%^&*) 포함
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text">
                  새 비밀번호 확인
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    required
                    className="block w-full px-3 py-2 pr-10 bg-white border border-background-dark rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-text-muted hover:text-text cursor-pointer"
                  >
                    {showConfirmPassword ? '🙈' : '🙊'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {passwordLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="mt-6 bg-white shadow rounded-xl p-6">
        <h3 className="text-lg font-medium text-text mb-2">계정 삭제</h3>
        <p className="text-sm text-text-muted mb-4">
          계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 text-sm font-medium text-error bg-error/10 border border-error/30 rounded-lg hover:bg-error/20 cursor-pointer"
        >
          회원 탈퇴
        </button>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-text/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            {deleteSuccess ? (
              <>
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-success rounded-full" />
                </div>
                <h3 className="text-lg font-medium text-text text-center mb-2">이메일을 확인해주세요</h3>
                <p className="text-sm text-text-muted text-center mb-4">
                  {user?.email}로 탈퇴 확인 링크를 발송했습니다.<br />
                  이메일을 확인하고 링크를 클릭하면 탈퇴가 완료됩니다.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSuccess(false);
                  }}
                  className="w-full py-2 px-4 border border-background-dark rounded-lg shadow-sm text-sm font-medium text-text bg-white hover:bg-background cursor-pointer"
                >
                  닫기
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-error rounded-full" />
                </div>
                <h3 className="text-lg font-medium text-text text-center mb-2">정말 탈퇴하시겠습니까?</h3>
                <p className="text-sm text-text-muted text-center mb-4">
                  탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.<br />
                  탈퇴를 진행하시려면 아래 버튼을 클릭하세요.
                </p>

                {deleteError && (
                  <div className="bg-error/10 border border-error/30 text-error px-4 py-3 rounded-lg text-sm mb-4">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError(null);
                    }}
                    className="flex-1 py-2 px-4 border border-background-dark rounded-lg shadow-sm text-sm font-medium text-text bg-white hover:bg-background cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-error hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {deleteLoading ? '요청 중...' : '탈퇴 진행'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
