package com.interviewai.global.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.interviewai.domain.payment.service.PaymentService;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Component
public class DailyResetScheduler {

    private final UserRepository userRepository;
    private final PaymentService paymentService;

    /**
     * 매일 자정에 FREE 사용자의 일일 면접 횟수 초기화 (한국 시간 기준)
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void resetDailyInterviewCount() {
        log.info("일일 면접 횟수 초기화 시작");
        userRepository.resetDailyInterviewCountForFreeUsers();
        log.info("일일 면접 횟수 초기화 완료");
    }

    /**
     * 매일 자정에 구독 취소된 만료 사용자를 FREE로 다운그레이드 (한국 시간 기준)
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "Asia/Seoul")
    @Transactional
    public void processExpiredCancelledSubscriptions() {
        log.info("만료된 취소 구독 처리 시작");
        int count = userRepository.downgradeExpiredCancelledUsers();
        log.info("만료된 취소 구독 처리 완료 - {} 명 다운그레이드", count);
    }

    /**
     * 매일 오전 9시에 구독 갱신이 필요한 사용자 정기결제 실행 (한국 시간 기준)
     * (만료 24시간 전 ~ 만료 시점 사이의 사용자 대상)
     */
    @Scheduled(cron = "0 0 9 * * *", zone = "Asia/Seoul")
    @Transactional
    public void processRecurringPayments() {
        log.info("정기결제 처리 시작");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tomorrow = now.plusDays(1);

        List<User> usersToRenew = userRepository.findUsersForRecurringPayment(now, tomorrow);
        log.info("정기결제 대상 사용자 수: {}", usersToRenew.size());

        for (User user : usersToRenew) {
            try {
                paymentService.processRecurringPayment(user);
            } catch (Exception e) {
                log.error("정기결제 실패 - userId: {}, error: {}", user.getId(), e.getMessage());
            }
        }

        log.info("정기결제 처리 완료");
    }
}
