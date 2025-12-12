package com.interviewai.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // Common Errors (1xxx)
    INTERNAL_SERVER_ERROR(1000, HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    INVALID_REQUEST(1001, HttpStatus.BAD_REQUEST, "잘못된 요청 형식입니다."),
    VALIDATION_ERROR(1002, HttpStatus.BAD_REQUEST, "유효성 검증에 실패했습니다."),
    RESOURCE_NOT_FOUND(1003, HttpStatus.NOT_FOUND, "리소스를 찾을 수 없습니다."),
    METHOD_NOT_ALLOWED(1004, HttpStatus.METHOD_NOT_ALLOWED, "허용되지 않은 메서드입니다."),
    RATE_LIMIT_EXCEEDED(1005, HttpStatus.TOO_MANY_REQUESTS, "요청 한도를 초과했습니다."),

    // Auth Errors (2xxx)
    UNAUTHORIZED(2000, HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    INVALID_TOKEN(2001, HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED(2002, HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    INVALID_CREDENTIALS(2003, HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호가 일치하지 않습니다."),
    EMAIL_NOT_VERIFIED(2004, HttpStatus.FORBIDDEN, "이메일 인증이 필요합니다."),
    DUPLICATE_EMAIL(2005, HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),
    INVALID_VERIFICATION_TOKEN(2006, HttpStatus.BAD_REQUEST, "유효하지 않은 인증 토큰입니다."),
    VERIFICATION_TOKEN_EXPIRED(2007, HttpStatus.BAD_REQUEST, "만료된 인증 토큰입니다."),
    OAUTH_AUTHENTICATION_FAILED(2008, HttpStatus.UNAUTHORIZED, "소셜 로그인에 실패했습니다."),
    ACCOUNT_DISABLED(2009, HttpStatus.FORBIDDEN, "비활성화된 계정입니다."),

    // Interview Errors (3xxx)
    INTERVIEW_NOT_FOUND(3000, HttpStatus.NOT_FOUND, "면접 세션을 찾을 수 없습니다."),
    INTERVIEW_ALREADY_COMPLETED(3001, HttpStatus.BAD_REQUEST, "이미 완료된 면접입니다."),
    INTERVIEW_LIMIT_EXCEEDED(3002, HttpStatus.FORBIDDEN, "일일 면접 횟수를 초과했습니다."),
    INVALID_INTERVIEW_STATUS(3003, HttpStatus.BAD_REQUEST, "잘못된 면접 상태입니다."),
    QUESTION_NOT_FOUND(3004, HttpStatus.NOT_FOUND, "질문을 찾을 수 없습니다."),
    ANSWER_ALREADY_SUBMITTED(3005, HttpStatus.BAD_REQUEST, "이미 제출된 답변입니다."),
    NO_MORE_QUESTIONS(3006, HttpStatus.BAD_REQUEST, "더 이상 질문이 없습니다."),

    // Premium Errors (4xxx)
    PREMIUM_REQUIRED(4000, HttpStatus.FORBIDDEN, "Premium 구독이 필요합니다."),
    FOLLOW_UP_LIMIT_EXCEEDED(4001, HttpStatus.FORBIDDEN, "꼬리질문 횟수를 초과했습니다."),
    SUBSCRIPTION_EXPIRED(4002, HttpStatus.FORBIDDEN, "구독이 만료되었습니다."),

    // Payment Errors (5xxx)
    PAYMENT_FAILED(5000, HttpStatus.BAD_REQUEST, "결제에 실패했습니다."),
    PAYMENT_NOT_FOUND(5001, HttpStatus.NOT_FOUND, "결제 정보를 찾을 수 없습니다."),
    INVALID_PAYMENT_AMOUNT(5002, HttpStatus.BAD_REQUEST, "잘못된 결제 금액입니다."),
    PAYMENT_ALREADY_PROCESSED(5003, HttpStatus.BAD_REQUEST, "이미 처리된 결제입니다."),
    REFUND_FAILED(5004, HttpStatus.BAD_REQUEST, "환불에 실패했습니다."),
    REFUND_PERIOD_EXCEEDED(5005, HttpStatus.BAD_REQUEST, "환불 가능 기간을 초과했습니다."),

    // AI Service Errors (6xxx)
    AI_SERVICE_UNAVAILABLE(6000, HttpStatus.SERVICE_UNAVAILABLE, "AI 서비스를 일시적으로 사용할 수 없습니다."),
    AI_RESPONSE_TIMEOUT(6001, HttpStatus.GATEWAY_TIMEOUT, "AI 응답 시간이 초과되었습니다."),
    AI_RESPONSE_PARSE_ERROR(6002, HttpStatus.INTERNAL_SERVER_ERROR, "AI 응답 파싱에 실패했습니다."),
    AI_QUOTA_EXCEEDED(6003, HttpStatus.SERVICE_UNAVAILABLE, "AI API 할당량을 초과했습니다.");

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
