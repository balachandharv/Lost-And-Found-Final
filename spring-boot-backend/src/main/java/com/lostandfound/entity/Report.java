package com.lostandfound.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Report {
    
    @Id
    @Column(length = 50)
    private String id;
    
    @Column(nullable = false, length = 200)
    private String item;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(nullable = false, length = 200)
    private String location;
    
    @Column(nullable = false, length = 20)
    private String type;  // Lost or Found
    
    @Column(length = 30)
    @Builder.Default
    private String status = "Pending";  // Pending, Retrieved, Returned, Resolved, Brought Back
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(columnDefinition = "TEXT")
    private String image;
    
    @Column(length = 100)
    private String contact;
    
    @Column(name = "reported_by", length = 100)
    private String reportedBy;
    
    @Column(name = "reporter_email", length = 100)
    private String reporterEmail;
    
    @Column(name = "reporter_id", length = 50)
    private String reporterId;
    
    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
