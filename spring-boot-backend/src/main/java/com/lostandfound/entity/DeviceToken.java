package com.lostandfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceToken {
    
    @Id 
    @Column(length = 50)
    private String id;
    
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String token;
    
    @Column(length = 50)
    private String device;
    
    @Column(length = 50)
    private String browser;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "last_used")
    private LocalDateTime lastUsed;
}
