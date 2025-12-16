package com.interviewai.domain.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AnswerSubmitRequest {

    @NotNull(message = "질문 ID가 필요합니다.")
    private Long questionId;

    @NotBlank(message = "답변 내용을 입력해주세요.")
    private String content;

    /** 답변 소요 시간 (초) */
    private Integer answerTimeSeconds;
}
