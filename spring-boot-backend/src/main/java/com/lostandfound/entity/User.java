package com.lostandfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(nullable = false, unique = true, length = 100)
    private String email;
    
    @Column(length = 255)
    private String password;
    
    @Column(length = 20)
    @Builder.Default
    private String role = "Student";  // Student or Admin
    
    @Column(length = 20)
    @Builder.Default
    private String status = "Active";  // Active or Blocked
    
    @Column(length = 20)
    private String phone;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @Column(name = "profile_image", columnDefinition = "TEXT")
    private String profileImage;
    
    @Column(name = "google_id", length = 100)
    private String googleId;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
