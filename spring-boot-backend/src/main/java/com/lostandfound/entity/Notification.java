package com.lostandfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(name = "user_id", nullable = false, length = 50)
    private String userId;
    
    @Column(name = "item_id", length = 50)
    private String itemId;
    
    @Column(length = 50)
    private String type;
    
    @Column(length = 200)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String body;
    
    @Column(length = 200)
    private String icon;
    
    @Column(name = "click_action", length = 200)
    private String clickAction;
    
    @Column(name = "is_read")
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "is_sent")
    @Builder.Default
    private Boolean isSent = false;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
