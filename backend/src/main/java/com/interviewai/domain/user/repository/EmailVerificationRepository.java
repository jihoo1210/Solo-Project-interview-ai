package com.interviewai.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.interviewai.domain.user.entity.EmailVerification;
import com.interviewai.domain.user.entity.User;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long>{

    Optional<EmailVerification> findByToken(String token);
    Optional<EmailVerification> findByUserAndUsedFalse(User user);

    boolean existsByToken(String token);

    void deleteByUser(User user);
}
