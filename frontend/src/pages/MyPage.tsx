import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../store/authStore';
import { userApi } from '../api/user';
import { authApi } from '../api/auth';
import type { ApiError } from '../types';

export default function MyPage() {
  const { user, logout } = useAuth();
  const { setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
            >
              홈으로
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* User Info Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600">
              {user?.nickname?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{user?.nickname}</h2>
              <p className="text-gray-500">{user?.email}</p>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.subscriptionType}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  user?.emailVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {user?.emailVerified ? '이메일 인증 완료' : '이메일 미인증'}
                </span>
                {isOAuthUser && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {user?.provider} 계정
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                프로필 수정
              </button>
              <button
                onClick={() => setActiveTab('password')}
                disabled={isOAuthUser}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'password'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${isOAuthUser ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                비밀번호 변경
                {isOAuthUser && <span className="ml-1 text-xs">(소셜 로그인 불가)</span>}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                {profileError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {profileError}
                  </div>
                )}
                {profileSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {profileSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">2~20자</p>
                </div>

                <div>
                  <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700">
                    프로필 이미지 URL
                  </label>
                  <input
                    id="profileImage"
                    type="url"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://example.com/image.png"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={profileLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {profileLoading ? '저장 중...' : '프로필 저장'}
                </button>
              </form>
            )}

            {activeTab === 'password' && !isOAuthUser && (
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                    현재 비밀번호
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg cursor-pointer"
                    >
                      {showCurrentPassword ? '🙉' : '🙈'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    새 비밀번호
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg cursor-pointer"
                    >
                      {showNewPassword ? '🙉' : '🙈'}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    8자 이상, 대문자, 소문자, 숫자, 특수문자(!@#$%^&*) 포함
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    새 비밀번호 확인
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-lg cursor-pointer"
                    >
                      {showConfirmPassword ? '🙉' : '🙈'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {passwordLoading ? '변경 중...' : '비밀번호 변경'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">계정 삭제</h3>
          <p className="text-sm text-gray-500 mb-4">
            계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 cursor-pointer"
          >
            회원 탈퇴
          </button>
        </div>
      </main>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {deleteSuccess ? (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">이메일을 확인해주세요</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  {user?.email}로 탈퇴 확인 링크를 발송했습니다.<br />
                  이메일을 확인하고 링크를 클릭하면 탈퇴가 완료됩니다.
                </p>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteSuccess(false);
                  }}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  닫기
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 text-center mb-2">정말 탈퇴하시겠습니까?</h3>
                <p className="text-sm text-gray-500 text-center mb-4">
                  탈퇴 시 모든 데이터가 삭제되며 복구할 수 없습니다.<br />
                  탈퇴를 진행하시려면 아래 버튼을 클릭하세요.
                </p>

                {deleteError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-4">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteError(null);
                    }}
                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
