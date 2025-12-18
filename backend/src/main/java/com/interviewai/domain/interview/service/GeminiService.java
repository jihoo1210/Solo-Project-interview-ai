package com.interviewai.domain.interview.service;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.interviewai.domain.interview.dto.EvaluationResult;
import com.interviewai.domain.interview.dto.SummaryResult;
import com.interviewai.domain.interview.entity.Answer;
import com.interviewai.domain.interview.entity.Interview;
import com.interviewai.domain.interview.entity.InterviewType;
import com.interviewai.domain.interview.entity.Question;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class GeminiService implements AiService {

    private final ChatClient chatClient;

    /**
     * 면접 질문 생성
     *
     * @param interview      면접 세션 (유형, 난이도 정보 포함)
     * @param previousAnswer 이전 답변 (첫 질문일 경우 null)
     * @return 생성된 질문 문자열
     */
    @Override
    public String generateQuestion(Interview interview, Answer previousAnswer) {
        String systemPrompt = buildQuestionSystemPrompt(interview);
        String userPrompt;

        if (previousAnswer == null) {
            // 첫 질문
            userPrompt = buildFirstQuestionUserPrompt(interview);
        } else if (interview.isFollowUpEnabled()) {
            // 꼬리질문 활성화: 이전 답변 기반 질문
            userPrompt = buildFollowUpQuestionUserPrompt(interview, previousAnswer);
        } else {
            // 꼬리질문 비활성화: 새로운 주제 질문
            userPrompt = buildNewTopicQuestionUserPrompt(interview, previousAnswer);
        }

        log.debug("질문 생성 요청 - 유형: {}, 난이도: {}, 꼬리질문: {}",
                interview.getType(), interview.getDifficulty(), interview.isFollowUpEnabled());

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        log.debug("생성된 질문: {}", response);
        return response.trim();
    }

    /**
     * 답변 평가
     *
     * @param question 질문 엔티티
     * @param answer   답변 엔티티
     * @return 평가 결과 (점수, 피드백, 모범답안)
     */
    @Override
    public EvaluationResult evaluateAnswer(Question question, Answer answer) {
        // 무응답(빈 답변)인 경우 0점 처리
        if (answer.getContent() == null || answer.getContent().trim().isEmpty()) {
            log.debug("무응답 감지 - 질문 ID: {}, 0점 처리", question.getId());
            return EvaluationResult.builder()
                    .score(0)
                    .feedback("답변이 제출되지 않았습니다.")
                    .modelAnswer("질문에 대한 답변을 작성해주세요.")
                    .build();
        }

        String systemPrompt = buildEvaluationSystemPrompt();
        String userPrompt = buildEvaluationUserPrompt(question, answer);

        log.debug("답변 평가 요청 - 질문 ID: {}", question.getId());

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        log.debug("평가 응답: {}", response);
        return parseEvaluationResponse(response);
    }

    /**
     * 면접 종합 평가 생성 (레이더 차트용 카테고리별 점수 포함)
     *
     * @param interview 면접 세션 (전체 질문/답변 포함)
     * @return 종합 평가 결과 (요약, 전체 점수, 카테고리별 점수)
     */
    @Override
    public SummaryResult generateSummary(Interview interview) {
        List<String> categories = getCategoriesForType(interview.getType());
        String systemPrompt = buildSummarySystemPrompt(categories);
        String userPrompt = buildSummaryUserPrompt(interview, categories);

        log.debug("종합 평가 요청 - 면접 ID: {}, 카테고리: {}", interview.getId(), categories);

        String response = chatClient.prompt()
                .system(systemPrompt)
                .user(userPrompt)
                .call()
                .content();

        log.debug("종합 평가 응답: {}", response);
        return parseSummaryResponse(response, categories);
    }

    /**
     * 면접 유형별 평가 카테고리 반환
     */
    private List<String> getCategoriesForType(InterviewType type) {
        return switch (type) {
            case BACKEND -> Arrays.asList(
                    "기본 지식",      // 언어, 프레임워크 기초
                    "설계/아키텍처",  // 시스템 설계, 디자인 패턴
                    "데이터베이스",   // SQL, ORM, 최적화
                    "문제 해결",      // 디버깅, 트러블슈팅
                    "커뮤니케이션"    // 답변의 명확성, 논리성
            );
            case FRONTEND -> Arrays.asList(
                    "기본 지식",      // HTML, CSS, JS 기초
                    "프레임워크",     // React, Vue 등
                    "UI/UX 이해",     // 사용자 경험, 접근성
                    "성능 최적화",    // 렌더링, 번들 최적화
                    "커뮤니케이션"
            );
            case FULLSTACK -> Arrays.asList(
                    "프론트엔드",
                    "백엔드",
                    "데이터베이스",
                    "시스템 통합",    // API 설계, 전체 아키텍처
                    "커뮤니케이션"
            );
            case DEVOPS -> Arrays.asList(
                    "CI/CD",
                    "클라우드/인프라",
                    "컨테이너/오케스트레이션",
                    "모니터링/로깅",
                    "보안"
            );
            case DATA -> Arrays.asList(
                    "데이터 처리",    // ETL, 파이프라인
                    "SQL/쿼리",
                    "분산 시스템",    // Spark, Hadoop
                    "데이터 모델링",
                    "커뮤니케이션"
            );
            case MOBILE -> Arrays.asList(
                    "기본 지식",      // 플랫폼별 기초
                    "UI/UX",
                    "성능 최적화",
                    "네이티브 API",
                    "커뮤니케이션"
            );
            case OTHER -> Arrays.asList(
                    "기본 지식",      // 직무 관련 기초
                    "실무 역량",      // 실제 업무 수행 능력
                    "문제 해결",      // 트러블슈팅, 논리적 사고
                    "도구/기술",      // 관련 도구 및 기술 스택
                    "커뮤니케이션"    // 답변의 명확성, 논리성
            );
        };
    }

    /**
     * 종합 평가를 위한 시스템 프롬프트 구성
     */
    private String buildSummarySystemPrompt(List<String> categories) {
        StringBuilder sb = new StringBuilder();
        sb.append("당신은 기술 면접 종합 평가자입니다.\n\n");
        sb.append("면접 내용을 분석하고 반드시 아래 형식으로만 응답하세요:\n\n");
        sb.append("=== 종합 평가 ===\n");
        sb.append("[면접 전체에 대한 종합적인 평가를 작성. 강점, 약점, 개선점, 학습 추천 포함]\n\n");
        sb.append("=== 전체 점수 ===\n");
        sb.append("[1-10 사이 정수]\n\n");
        sb.append("=== 카테고리별 점수 ===\n");

        for (String category : categories) {
            sb.append(String.format("%s: [1-10 사이 정수]\n", category));
        }

        sb.append("\n점수 기준:\n");
        sb.append("- 1-3점: 기초 부족\n");
        sb.append("- 4-6점: 기본 이해\n");
        sb.append("- 7-8점: 충분한 역량\n");
        sb.append("- 9-10점: 우수한 역량\n\n");
        sb.append("작성 형식 규칙:\n");
        sb.append("- 종합 평가는 마크다운 형식으로 작성\n");
        sb.append("- 여러 항목이 있으면 번호 리스트(1. 2. 3.)를 사용하고 각 항목은 반드시 줄바꿈으로 구분\n");
        sb.append("- 하위 항목이 있으면 들여쓰기와 함께 글머리 기호(-)를 사용\n");
        sb.append("- 중요한 키워드는 **볼드**로 강조\n");
        sb.append("- 코드나 기술 용어는 `백틱`으로 감싸기");

        return sb.toString();
    }

    /**
     * 종합 평가를 위한 사용자 프롬프트 구성
     */
    private String buildSummaryUserPrompt(Interview interview, List<String> categories) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("면접 유형: %s\n", interview.getType().getDescription()));
        sb.append(String.format("난이도: %s (%s)\n",
                interview.getDifficulty().getLabel(),
                interview.getDifficulty().getExperience()));
        sb.append(String.format("평가 카테고리: %s\n\n", String.join(", ", categories)));
        sb.append("=== 면접 내용 ===\n\n");

        for (Question q : interview.getQuestions()) {
            sb.append(String.format("Q%d: %s\n", q.getOrderNumber(), q.getContent()));
            if (q.getAnswer() != null) {
                Answer a = q.getAnswer();
                sb.append(String.format("A: %s\n", a.getContent()));
                if (a.getScore() != null) {
                    sb.append(String.format("개별 점수: %d/10\n", a.getScore()));
                }
            }
            sb.append("\n");
        }

        sb.append("위 면접 내용을 바탕으로 종합 평가와 카테고리별 점수를 작성해주세요. 응답이 제공되지 않았다면 해당 응답에 대한 모든 점수를 0점으로 해주세요.");
        return sb.toString();
    }

    /**
     * AI 응답을 파싱하여 SummaryResult로 변환
     */
    private SummaryResult parseSummaryResponse(String response, List<String> categories) {
        StringBuilder summaryBuilder = new StringBuilder();
        int overallScore = 0;
        Map<String, Integer> categoryScores = new LinkedHashMap<>();

        // 기본값으로 카테고리 초기화 (무응답 시 0점)
        for (String category : categories) {
            categoryScores.put(category, 0);
        }

        String currentSection = null;
        String[] lines = response.split("\n");

        for (String line : lines) {
            String trimmedLine = line.trim();

            // 섹션 헤더 감지
            if (trimmedLine.contains("종합 평가") && trimmedLine.contains("===")) {
                currentSection = "summary";
                continue;
            } else if (trimmedLine.contains("전체 점수") && trimmedLine.contains("===")) {
                currentSection = "overall";
                continue;
            } else if (trimmedLine.contains("카테고리별 점수") && trimmedLine.contains("===")) {
                currentSection = "categories";
                continue;
            } else if (trimmedLine.startsWith("===")) {
                continue; // 다른 섹션 헤더 무시
            }

            // 섹션별 파싱
            if ("summary".equals(currentSection) && !trimmedLine.isEmpty()) {
                if (summaryBuilder.length() > 0) {
                    summaryBuilder.append("\n");
                }
                summaryBuilder.append(trimmedLine);
            } else if ("overall".equals(currentSection) && !trimmedLine.isEmpty()) {
                overallScore = extractScore(trimmedLine);
                currentSection = null; // 전체 점수는 한 줄
            } else if ("categories".equals(currentSection) && !trimmedLine.isEmpty()) {
                // 카테고리: 점수 형식 파싱
                for (String category : categories) {
                    if (trimmedLine.startsWith(category)) {
                        int score = extractScore(trimmedLine);
                        categoryScores.put(category, score);
                        break;
                    }
                }
            }
        }

        String summary = summaryBuilder.toString().trim();

        // 파싱 실패 시 전체 응답을 요약으로
        if (summary.isEmpty()) {
            log.warn("종합 평가 파싱 실패, 원본 응답을 요약으로 사용");
            summary = response;
        }

        return SummaryResult.of(summary, overallScore, categoryScores);
    }

    // ==================== Private Helper Methods ====================

    /**
     * 질문 생성을 위한 시스템 프롬프트 구성
     */
    private String buildQuestionSystemPrompt(Interview interview) {
        return String.format(
                "당신은 %s 분야의 기술 면접관입니다.\n" +
                "대상: %s 수준 (%s 경력)\n\n" +
                "규칙:\n" +
                "1. 질문은 한국어로 작성\n" +
                "2. 한 번에 하나의 질문만 생성\n" +
                "3. 실무에서 중요한 개념을 질문\n" +
                "4. 난이도에 맞는 깊이로 질문",
                interview.getType().getDescription(),
                interview.getDifficulty().getLabel(),
                interview.getDifficulty().getExperience()
        );
    }

    /**
     * 첫 번째 질문 생성을 위한 사용자 프롬프트
     */
    private String buildFirstQuestionUserPrompt(Interview interview) {
        return String.format(
                "면접을 시작합니다. %s 개발자 면접의 첫 번째 기술 질문을 해주세요. "
                + "새롭고 특이한 질문을 다수 생성한 후 무작위적으로 하나를 선택해주세요. "
                + "질문은 오늘 신문 또는 기사에서 가장 조회수가 높거나 인기가 많은 주제 기반으로 생성해주세요.",
                interview.getType().getDescription()
        );
    }

    /**
     * 꼬리질문 활성화 시: 이전 답변 기반 후속 질문 프롬프트
     */
    private String buildFollowUpQuestionUserPrompt(Interview interview, Answer previousAnswer) {
        return String.format(
                "이전 질문: %s\n\n" +
                "지원자 답변: %s\n\n" +
                "위 답변을 참고하여 꼬리질문을 해주세요.\n" +
                "- 답변이 부족했다면 같은 주제에서 더 깊이 파고드는 질문\n" +
                "- 답변에서 언급된 개념에 대한 심화 질문\n" +
                "- 신입 개발자가 아니라면 실무 적용 사례를 묻는 질문",
                previousAnswer.getQuestion().getContent(),
                previousAnswer.getContent()
        );
    }

    /**
     * 꼬리질문 비활성화 시: 새로운 주제 질문 프롬프트
     */
    private String buildNewTopicQuestionUserPrompt(Interview interview, Answer previousAnswer) {
        return String.format(
                "현재 %d번째 질문까지 완료했습니다.\n\n" +
                "이전에 다룬 주제와 완전히 다른 새로운 기술 영역에서 질문해주세요.\n" +
                "- %s 분야의 다양한 주제를 고르게 다루세요\n" +
                "- 이전 질문: %s (이 주제는 피해주세요)\n" +
                "- 새롭고 흥미로운 주제로 질문해주세요.",
                interview.getQuestionCount(),
                interview.getType().getDescription(),
                previousAnswer.getQuestion().getContent()
        );
    }

    /**
     * 답변 평가를 위한 시스템 프롬프트 구성
     */
    private String buildEvaluationSystemPrompt() {
        return "당신은 한국 테크 기업의 기술 면접 평가자입니다.\n\n" +
                "답변을 평가하고 반드시 아래 형식으로만 응답하세요:\n\n" +
                "점수: [1-10 사이 정수]\n" +
                "피드백: [답변의 좋은 점과 부족한 점을 구체적으로 설명]\n" +
                "모범답안: [이 질문에 대한 이상적인 답변 예시]\n\n" +
                "점수 기준:\n" +
                "- 1-3점: 핵심 개념 이해 부족\n" +
                "- 4-6점: 기본 개념 이해, 세부사항 부족\n" +
                "- 7-8점: 개념 이해 충분, 실무 적용 가능\n" +
                "- 9-10점: 깊은 이해 또는 실무 경험 반영\n\n" +
                "작성 형식 규칙:\n" +
                "- 피드백과 모범답안은 마크다운 형식으로 작성\n" +
                "- 여러 항목이 있으면 번호 리스트(1. 2. 3.)를 사용하고 각 항목은 반드시 줄바꿈으로 구분\n" +
                "- 하위 항목이 있으면 들여쓰기와 함께 글머리 기호(-)를 사용\n" +
                "- 중요한 키워드는 **볼드**로 강조\n" +
                "- 코드나 기술 용어는 `백틱`으로 감싸기";
    }

    /**
     * 답변 평가를 위한 사용자 프롬프트 구성
     */
    private String buildEvaluationUserPrompt(Question question, Answer answer) {
        return String.format(
                "질문: %s\n\n" +
                "지원자 답변: %s\n\n" +
                "위 답변을 평가해주세요.",
                question.getContent(),
                answer.getContent()
        );
    }

    /**
     * AI 응답을 파싱하여 EvaluationResult로 변환
     */
    private EvaluationResult parseEvaluationResponse(String response) {
        int score = 0; // 기본값 (파싱 실패 시 0점)
        StringBuilder feedbackBuilder = new StringBuilder();
        StringBuilder modelAnswerBuilder = new StringBuilder();

        // 현재 파싱 중인 섹션 (null, "feedback", "modelAnswer")
        String currentSection = null;

        String[] lines = response.split("\n");
        for (String line : lines) {
            String trimmedLine = line.trim();

            if (trimmedLine.startsWith("점수:") || trimmedLine.startsWith("점수 :")) {
                // 점수 추출
                score = extractScore(trimmedLine);
                currentSection = null;
            } else if (trimmedLine.startsWith("피드백:") || trimmedLine.startsWith("피드백 :")) {
                // 피드백 시작
                String content = trimmedLine.replaceFirst("피드백\\s*:", "").trim();
                feedbackBuilder.append(content);
                currentSection = "feedback";
            } else if (trimmedLine.startsWith("모범답안:") || trimmedLine.startsWith("모범답안 :") ||
                       trimmedLine.startsWith("모범 답안:") || trimmedLine.startsWith("모범 답안 :")) {
                // 모범답안 시작
                String content = trimmedLine.replaceFirst("모범\\s*답안\\s*:", "").trim();
                modelAnswerBuilder.append(content);
                currentSection = "modelAnswer";
            } else if (!trimmedLine.isEmpty() && currentSection != null) {
                // 여러 줄에 걸친 내용 처리
                if ("feedback".equals(currentSection)) {
                    feedbackBuilder.append(" ").append(trimmedLine);
                } else if ("modelAnswer".equals(currentSection)) {
                    modelAnswerBuilder.append(" ").append(trimmedLine);
                }
            }
        }

        String feedback = feedbackBuilder.toString().trim();
        String modelAnswer = modelAnswerBuilder.toString().trim();

        // 파싱 실패 시 전체 응답을 피드백으로
        if (feedback.isEmpty() && modelAnswer.isEmpty()) {
            log.warn("평가 응답 파싱 실패, 원본 응답을 피드백으로 사용");
            feedback = response;
        }

        return EvaluationResult.of(score, feedback, modelAnswer);
    }

    /**
     * 문자열에서 점수(1-10) 추출
     */
    private int extractScore(String line) {
        // 정규식으로 숫자 추출
        Pattern pattern = Pattern.compile("\\d+");
        Matcher matcher = pattern.matcher(line);

        if (matcher.find()) {
            int score = Integer.parseInt(matcher.group());
            // 1-10 범위로 제한
            return Math.max(1, Math.min(10, score));
        }

        return 5; // 기본값
    }
}
