package com.interviewai.global.common;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;
import com.interviewai.domain.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    
    @Override
    public void run(String... args) throws Exception {
        
        String email = "admin@test.com";
        if (!userRepository.existsByEmail(email)) {
            User admin = User.builder()
                    .email(email)
                    .nickname("Admin")
                    .password(passwordEncoder.encode("Admin123!"))
                    .emailVerified(true)
                    .subscriptionType(SubscriptionType.PREMIUM)
                    .build();
            userRepository.save(admin);
        }
    }
}
