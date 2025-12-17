package com.interviewai.domain.user.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.interviewai.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{

    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.dailyInterviewCount = 0 WHERE u.subscriptionType = 'FREE'")
    void resetDailyInterviewCountForFreeUsers();

    @Modifying
    @Query("UPDATE User u SET u.subscriptionType = 'FREE', u.subscriptionExpiresAt = null, " +
           "u.billingKey = null, u.subscriptionCancelled = false " +
           "WHERE u.subscriptionType = 'PREMIUM' AND u.subscriptionCancelled = true " +
           "AND u.subscriptionExpiresAt < CURRENT_TIMESTAMP")
    int downgradeExpiredCancelledUsers();

    // 구독 갱신이 필요한 사용자 조회 (만료 예정 + 취소 안함 + 빌링키 있음)
    @Query("SELECT u FROM User u WHERE u.subscriptionType = 'PREMIUM' " +
           "AND u.subscriptionCancelled = false " +
           "AND u.billingKey IS NOT NULL " +
           "AND u.subscriptionExpiresAt BETWEEN :now AND :tomorrow")
    List<User> findUsersForRecurringPayment(@Param("now") LocalDateTime now, @Param("tomorrow") LocalDateTime tomorrow);
}
