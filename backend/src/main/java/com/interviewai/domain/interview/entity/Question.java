package com.interviewai.domain.interview.entity;

import com.interviewai.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "questions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Question extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "interview_id", nullable = false)
    private Interview interview;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber;

    @Column(length = 100)
    private String category;

    @OneToOne(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private Answer answer;

    @Builder
    public Question(Interview interview, String content, Integer orderNumber, String category) {
        this.interview = interview;
        this.content = content;
        this.orderNumber = orderNumber;
        this.category = category;
    }

    public void setAnswer(Answer answer) {
        this.answer = answer;
    }

    public boolean isAnswered() {
        return this.answer != null;
    }
}
