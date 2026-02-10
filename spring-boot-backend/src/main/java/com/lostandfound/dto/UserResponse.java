package com.lostandfound.dto;

import com.lostandfound.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String status;
    private String phone;
    private String bio;
    private String profileImage;
    
    public static UserResponse fromUser(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .phone(user.getPhone())
                .bio(user.getBio())
                .profileImage(user.getProfileImage())
                .build();
    }
}
