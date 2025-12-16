package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewDifficulty;
import com.interviewai.domain.interview.entity.InterviewType;
import com.interviewai.domain.interview.entity.Question;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InterviewStartResponse {

    private Long interviewId;
    private InterviewType type;
    private InterviewDifficulty difficulty;
    private QuestionResponse firstQuestion;

    public static InterviewStartResponse of(Interview interview, Question question) {
        return InterviewStartResponse.builder()
                .interviewId(interview.getId())
                .type(interview.getType())
                .difficulty(interview.getDifficulty())
                .firstQuestion(QuestionResponse.from(question))
                .build();
    }
}
