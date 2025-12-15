package com.interviewai.infra.mail;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EmailType {

    VERIFICATION(
        "[INTERVIEW AI] 회원가입 이메일 인증",
        "이메일 인증",
        "안녕하세요! AI 면접 시뮬레이터에 가입해 주셔서 감사합니다.<br>아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.",
        "이메일 인증하기",
        "http://localhost:8080/api/v1/auth/verify-email?token="
    ),

    PASSWORD_RESET(
        "[INTERVIEW AI] 비밀번호 재설정",
        "비밀번호 재설정",
        "안녕하세요! AI 면접 시뮬레이터 비밀번호 재설정 링크입니다.<br>아래 버튼을 클릭하여 비밀번호를 재설정해 주세요.",
        "비밀번호 재설정하기",
        "http://localhost:5173/reset-password?token="
    );

    private final String subject;
    private final String title;
    private final String description;
    private final String buttonText;
    private final String linkPrefix;
}
