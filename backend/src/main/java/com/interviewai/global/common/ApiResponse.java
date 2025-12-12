package com.interviewai.global.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorResponse error;
    private final LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> success() {
        return ApiResponse.<T>builder()
                .success(true)
                .timestamp(LocalDateTime.now())
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorResponse errorResponse) {
        return ApiResponse.<T>builder()
                .success(false)
                .error(errorResponse)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Getter
    @Builder
    public static class ErrorResponse {
        private final int code;
        private final String name;
        private final String message;
        private final Object details;
        private final LocalDateTime timestamp;

        public static ErrorResponse of(int code, String name, String message) {
            return ErrorResponse.builder()
                    .code(code)
                    .name(name)
                    .message(message)
                    .timestamp(LocalDateTime.now())
                    .build();
        }

        public static ErrorResponse of(int code, String name, String message, Object details) {
            return ErrorResponse.builder()
                    .code(code)
                    .name(name)
                    .message(message)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();
        }
    }
}
