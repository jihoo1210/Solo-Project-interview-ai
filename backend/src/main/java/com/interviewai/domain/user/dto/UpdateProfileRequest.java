package com.interviewai.domain.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UpdateProfileRequest {
    
    @Size(min = 2, max = 20)
    private String nickname;

    private String profileImage;
}
