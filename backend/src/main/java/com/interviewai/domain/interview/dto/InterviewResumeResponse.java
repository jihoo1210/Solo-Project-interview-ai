package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;
import com.interviewai.domain.interview.entity.Question;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InterviewResumeResponse {

    private Long interviewId;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private QuestionResponse currentQuestion;
    private int answeredCount;

    public static InterviewResumeResponse of(Interview interview, Question currentQuestion, int answeredCount) {
        return InterviewResumeResponse.builder()
                .interviewId(interview.getId())
                .type(interview.getType())
                .difficulty(interview.getDifficulty())
                .currentQuestion(QuestionResponse.from(currentQuestion))
                .answeredCount(answeredCount)
                .build();
    }
}
