package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class InterviewStartRequest {

    @NotNull(message = "면접 유형을 선택해주세요.")
    private InterviewType type;

    @NotNull(message = "난이도를 선택해주세요.")
    private InterviewDifficulty difficulty;
}
