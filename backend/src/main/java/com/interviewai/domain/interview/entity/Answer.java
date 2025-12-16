package com.interviewai.domain.interview.entity;

import com.interviewai.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "answers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Answer extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "model_answer", columnDefinition = "TEXT")
    private String modelAnswer;

    @Builder
    public Answer(Question question, String content) {
        this.question = question;
        this.content = content;
    }

    public void evaluate(int score, String feedback, String modelAnswer) {
        this.score = score;
        this.feedback = feedback;
        this.modelAnswer = modelAnswer;
    }

    public boolean isEvaluated() {
        return this.score != null;
    }
}
