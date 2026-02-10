package com.lostandfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Otp {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 10)
    private String code;
    
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(name = "used")
    @Builder.Default
    private Boolean used = false;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
