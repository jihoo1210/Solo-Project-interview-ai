package com.interviewai.domain.interview.service;

import com.interviewai.domain.interview.dto.*;
import com.interviewai.domain.interview.entity.*;
import com.interviewai.domain.interview.repository.AnswerRepository;
import com.interviewai.domain.interview.repository.InterviewRepository;
import com.interviewai.domain.interview.repository.QuestionRepository;
import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;
import com.interviewai.global.exception.CustomException;
import com.interviewai.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    @Transactional
    public InterviewStartResponse startInterview(String email, InterviewStartRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if(user.getSubscriptionType().equals(SubscriptionType.FREE)) {
            user.increaseAndCheckInterviewCount();
        }

        Interview interview = Interview.builder()
                .user(user)
                .type(request.getType())
                .difficulty(request.getDifficulty())
                .build();

        interviewRepository.save(interview);

        // AI로 첫 번째 질문 생성
        String questionContent = aiService.generateQuestion(interview, null);

        Question firstQuestion = Question.builder()
                .interview(interview)
                .content(questionContent)
                .orderNumber(1)
                .category(request.getType().getDescription())
                .build();

        questionRepository.save(firstQuestion);
        interview.addQuestion(firstQuestion);

        return InterviewStartResponse.of(interview, firstQuestion);
    }

    @Transactional
    public AnswerSubmitResponse submitAnswer(String email, Long interviewId, AnswerSubmitRequest request) {
        Interview interview = interviewRepository.findByIdWithQuestions(interviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.INTERVIEW_NOT_FOUND));

        validateInterviewOwner(interview, email);
        validateInterviewInProgress(interview);

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new CustomException(ErrorCode.QUESTION_NOT_FOUND));

        // 답변 저장
        Answer answer = Answer.builder()
                .question(question)
                .content(request.getContent())
                .build();

        answerRepository.save(answer);
        question.setAnswer(answer);

        // AI로 답변 평가
        EvaluationResult evaluation = aiService.evaluateAnswer(question, answer);
        answer.evaluate(evaluation.getScore(), evaluation.getFeedback(), evaluation.getModelAnswer());

        // 다음 질문 생성 (최대 5개)
        QuestionResponse nextQuestion = null;
        if (interview.getQuestionCount() < 5) {
            String nextQuestionContent = aiService.generateQuestion(interview, answer);
            int nextOrderNumber = interview.getQuestionCount() + 1;

            Question newQuestion = Question.builder()
                    .interview(interview)
                    .content(nextQuestionContent)
                    .orderNumber(nextOrderNumber)
                    .category(interview.getType().getDescription())
                    .build();

            questionRepository.save(newQuestion);
            interview.addQuestion(newQuestion);
            nextQuestion = QuestionResponse.from(newQuestion);
        }

        return AnswerSubmitResponse.of(evaluation, nextQuestion);
    }

    @Transactional
    public InterviewEndResponse endInterview(String email, Long interviewId) {
        Interview interview = interviewRepository.findByIdWithQuestionsAndAnswers(interviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.INTERVIEW_NOT_FOUND));

        validateInterviewOwner(interview, email);
        validateInterviewInProgress(interview);

        // 평균 점수 계산
        Double avgScore = answerRepository.calculateAverageScoreByInterview(interview);
        int totalScore = avgScore != null ? avgScore.intValue() : 0;

        interview.complete(totalScore);

        // AI로 종합 평가
        SummaryResult summary = aiService.generateSummary(interview);

        return InterviewEndResponse.of(interview, summary);
    }

    public Page<InterviewListResponse> getInterviewList(String email, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return interviewRepository.findByUserOrderByCreatedAtDesc(user, pageable)
                .map(InterviewListResponse::from);
    }

    public InterviewDetailResponse getInterviewDetail(String email, Long interviewId) {
        Interview interview = interviewRepository.findByIdWithQuestionsAndAnswers(interviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.INTERVIEW_NOT_FOUND));

        validateInterviewOwner(interview, email);

        return InterviewDetailResponse.from(interview);
    }

    private void validateInterviewOwner(Interview interview, String email) {
        if (!interview.getUser().getEmail().equals(email)) {
            throw new CustomException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateInterviewInProgress(Interview interview) {
        if (interview.getStatus() != InterviewStatus.IN_PROGRESS) {
            throw new CustomException(ErrorCode.INTERVIEW_ALREADY_ENDED);
        }
    }

    public long getTodayInterviewCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return interviewRepository.countByUserAndCreatedAtAfter(user, startOfDay);
    }
}
