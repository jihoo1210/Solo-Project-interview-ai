package com.interviewai.domain.user.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.interviewai.domain.user.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
    
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.dailyInterviewCount = 0 WHERE u.subscriptionType = 'FREE'")
    void resetDailyInterviewCountForFreeUsers();
}
