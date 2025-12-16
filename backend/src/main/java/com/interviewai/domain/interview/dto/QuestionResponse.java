package com.interviewai.domain.interview.dto;

import com.interviewai.domain.interview.entity.Question;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuestionResponse {

    private Long id;
    private String content;
    private Integer orderNumber;
    private String category;

    public static QuestionResponse from(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .content(question.getContent())
                .orderNumber(question.getOrderNumber())
                .category(question.getCategory())
                .build();
    }
}
