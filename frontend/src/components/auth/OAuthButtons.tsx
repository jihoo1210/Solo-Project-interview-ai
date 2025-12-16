const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/oauth/callback/google';

const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const NAVER_REDIRECT_URI = import.meta.env.VITE_NAVER_REDIRECT_URI || 'http://localhost:5173/oauth/callback/naver';

function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export default function OAuthButtons() {
  const handleGoogleLogin = () => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const handleNaverLogin = () => {
    const state = generateState();
    sessionStorage.setItem('naver_oauth_state', state);

    const params = new URLSearchParams({
      client_id: NAVER_CLIENT_ID,
      redirect_uri: NAVER_REDIRECT_URI,
      response_type: 'code',
      state,
    });

    window.location.href = `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  };

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-background-dark rounded-lg shadow-sm bg-white text-sm font-medium text-text hover:bg-background hover:ring-2 hover:ring-offset-2 hover:ring-primary cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google로 계속하기
      </button>

      <button
        type="button"
        onClick={handleNaverLogin}
        className="w-full flex items-center justify-center gap-3 py-2 px-4 border border-transparent rounded-lg shadow-sm bg-[#03C75A] text-sm font-medium text-white hover:bg-[#02b351] hover:ring-2 hover:ring-offset-2 hover:ring-[#03C75A] cursor-pointer"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" />
        </svg>
        네이버로 계속하기
      </button>
    </div>
  );
}
