import { useSearchParams } from 'react-router-dom';
import { StatusPage } from '../../components/common';

export default function EmailVerifyPage() {
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success') === 'true';
  const errorParam = searchParams.get('error');

  if (success) {
    return (
      <StatusPage
        type="success"
        title="이메일 인증 완료"
        message="이메일 인증이 완료되었습니다. 이제 로그인하실 수 있습니다."
        linkTo="/login"
        linkText="로그인 하기"
      />
    );
  }

  return (
    <StatusPage
      type="error"
      title="인증 실패"
      message={errorParam || '이메일 인증에 실패했습니다.'}
      subMessage="인증 링크가 만료되었거나 유효하지 않습니다. 다시 회원가입하거나 인증 메일을 재발송 받으세요."
      linkTo="/signup"
      linkText="회원가입 페이지로"
    />
  );
}
