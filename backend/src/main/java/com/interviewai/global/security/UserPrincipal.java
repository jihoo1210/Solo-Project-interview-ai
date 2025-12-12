package com.interviewai.global.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.interviewai.domain.user.entity.SubscriptionType;
import com.interviewai.domain.user.entity.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class UserPrincipal implements UserDetails{

    private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        if(user.getSubscriptionType().equals(SubscriptionType.FREE)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_FREE"));
        } else if(user.getSubscriptionType().equals(SubscriptionType.PREMIUM)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_PREMIUM"));
            authorities.add(new SimpleGrantedAuthority("ROLE_FREE"));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }
    
}
