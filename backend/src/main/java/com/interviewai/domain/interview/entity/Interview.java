package com.interviewai.domain.interview.entity;

import com.interviewai.domain.user.entity.User;
import com.interviewai.global.common.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interviews")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Interview extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewType type;

    @Column(name = "custom_type")
    private String customType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewDifficulty difficulty;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InterviewStatus status;

    @Column(name = "total_score")
    private Integer totalScore;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "ended_at")
    private LocalDateTime endedAt;

    @OneToMany(mappedBy = "interview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    @Builder
    public Interview(User user, InterviewType type, String customType, InterviewDifficulty difficulty) {
        this.user = user;
        this.type = type;
        this.customType = customType;
        this.difficulty = difficulty;
        this.status = InterviewStatus.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
    }

    /**
     * 면접 유형 표시명 (OTHER인 경우 customType 반환)
     */
    public String getTypeDisplayName() {
        if (type == InterviewType.OTHER && customType != null) {
            return customType;
        }
        return type.getDescription();
    }

    public void complete(int totalScore) {
        this.status = InterviewStatus.COMPLETED;
        this.totalScore = totalScore;
        this.endedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = InterviewStatus.CANCELLED;
        this.endedAt = LocalDateTime.now();
    }

    public void addQuestion(Question question) {
        this.questions.add(question);
    }

    public int getQuestionCount() {
        return this.questions.size();
    }
}
