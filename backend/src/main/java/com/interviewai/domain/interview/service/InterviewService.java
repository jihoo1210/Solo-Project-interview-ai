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
            if(request.getQuestionLimit() != 5 || request.isFollowUpEnabled()) throw new CustomException(ErrorCode.PREMIUM_REQUIRED);
        }

        Interview interview = Interview.builder()
                .user(user)
                .type(request.getType())
                .customType(request.getCustomType())
                .difficulty(request.getDifficulty())
                .questionLimit(request.getQuestionLimit())
                .followUpEnabled(request.isFollowUpEnabled())
                .build();

        interviewRepository.save(interview);

        // AI로 첫 번째 질문 생성
        String questionContent = aiService.generateQuestion(interview, null);

        // 카테고리: OTHER인 경우 customType 사용
        String category = interview.getTypeDisplayName();

        Question firstQuestion = Question.builder()
                .interview(interview)
                .content(questionContent)
                .orderNumber(1)
                .category(category)
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

        // 답변 저장 (소요 시간 포함)
        Answer answer = Answer.builder()
                .question(question)
                .content(request.getContent())
                .answerTimeSeconds(request.getAnswerTimeSeconds())
                .build();

        answerRepository.save(answer);
        question.setAnswer(answer);

        // AI로 답변 평가
        EvaluationResult evaluation = aiService.evaluateAnswer(question, answer);
        answer.evaluate(evaluation.getScore(), evaluation.getFeedback(), evaluation.getModelAnswer());

        // 다음 질문 생성
        QuestionResponse nextQuestion = null;
        if (interview.getQuestionCount() < interview.getQuestionLimit()) {
            String nextQuestionContent = aiService.generateQuestion(interview, answer);
            int nextOrderNumber = interview.getQuestionCount() + 1;

            Question newQuestion = Question.builder()
                    .interview(interview)
                    .content(nextQuestionContent)
                    .orderNumber(nextOrderNumber)
                    .category(interview.getTypeDisplayName())
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

        // AI로 종합 평가 (먼저 생성하여 categoryScores 획득)
        SummaryResult summary = aiService.generateSummary(interview);

        // 평균 점수 계산
        Double avgScore = answerRepository.calculateAverageScoreByInterview(interview);
        int totalScore = avgScore != null ? avgScore.intValue() : 0;

        // 면접 완료 처리 (categoryScores 포함)
        interview.complete(totalScore, summary.getCategoryScores());

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

    /**
     * 진행 중인 면접 계속하기
     * - 답변하지 않은 질문이 있으면 해당 질문 반환
     * - 모든 질문에 답변했으면 새 질문 생성 (최대 5개까지)
     */
    @Transactional
    public InterviewResumeResponse resumeInterview(String email, Long interviewId) {
        Interview interview = interviewRepository.findByIdWithQuestionsAndAnswers(interviewId)
                .orElseThrow(() -> new CustomException(ErrorCode.INTERVIEW_NOT_FOUND));

        validateInterviewOwner(interview, email);
        validateInterviewInProgress(interview);

        // 답변하지 않은 질문 찾기
        Question unansweredQuestion = interview.getQuestions().stream()
                .filter(q -> q.getAnswer() == null)
                .findFirst()
                .orElse(null);

        // 답변한 질문 수 계산
        int answeredCount = (int) interview.getQuestions().stream()
                .filter(q -> q.getAnswer() != null)
                .count();

        if (unansweredQuestion != null) {
            // 답변하지 않은 질문이 있으면 반환
            return InterviewResumeResponse.of(interview, unansweredQuestion, answeredCount);
        }

        if (interview.getQuestionCount() < interview.getQuestionLimit()) {
            Answer lastAnswer = interview.getQuestions().get(interview.getQuestionCount() - 1).getAnswer();
            String newQuestionContent = aiService.generateQuestion(interview, lastAnswer);

            Question newQuestion = Question.builder()
                    .interview(interview)
                    .content(newQuestionContent)
                    .orderNumber(interview.getQuestionCount() + 1)
                    .category(interview.getTypeDisplayName())
                    .build();

            questionRepository.save(newQuestion);
            interview.addQuestion(newQuestion);

            return InterviewResumeResponse.of(interview, newQuestion, answeredCount);
        }

        // 모두 답변 완료 - 마지막 질문 반환 (프론트에서 면접 종료 유도)
        Question lastQuestion = interview.getQuestions().get(interview.getQuestionCount() - 1);
        return InterviewResumeResponse.of(interview, lastQuestion, answeredCount);
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
        return interviewRepository.countByUserAndCreatedAtGreaterThanEqual(user, startOfDay);
    }

}
