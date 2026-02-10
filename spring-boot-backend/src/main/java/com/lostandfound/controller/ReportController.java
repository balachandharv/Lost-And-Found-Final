package com.lostandfound.controller;

import com.lostandfound.dto.ReportRequest;
import com.lostandfound.entity.Report;
import com.lostandfound.entity.User;
import com.lostandfound.repository.ReportRepository;
import com.lostandfound.security.JwtUtil;
import com.lostandfound.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    
    @Autowired
    private ReportRepository reportRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof User) {
            return ((User) auth.getPrincipal()).getId();
        }
        return null;
    }
    
    // GET /api/reports - Get all reports
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReports() {
        Map<String, Object> response = new HashMap<>();
        
        List<Report> reports = reportRepository.findAllByOrderByCreatedAtDesc();
        
        response.put("success", true);
        response.put("reports", reports);
        return ResponseEntity.ok(response);
    }
    
    // POST /api/reports - Create new report
    @PostMapping
    public ResponseEntity<Map<String, Object>> createReport(@RequestBody ReportRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getItem() == null || request.getLocation() == null || 
            request.getType() == null || request.getDate() == null) {
            response.put("success", false);
            response.put("message", "Missing required fields");
            return ResponseEntity.badRequest().body(response);
        }
        
        String reporterId = getCurrentUserId();
        String id = "R" + System.currentTimeMillis();
        
        Report newReport = Report.builder()
                .id(id)
                .item(request.getItem())
                .description(request.getDescription() != null ? request.getDescription() : "")
                .location(request.getLocation())
                .type(request.getType())
                .status("Pending")
                .date(request.getDate())
                .image(request.getImage() != null ? request.getImage() : "")
                .contact(request.getContact() != null ? request.getContact() : "")
                .reportedBy(request.getReportedBy() != null ? request.getReportedBy() : "")
                .reporterEmail(request.getReporterEmail() != null ? request.getReporterEmail() : "")
                .reporterId(reporterId)
                .createdAt(LocalDateTime.now())
                .build();
        
        reportRepository.save(newReport);
        
        response.put("success", true);
        response.put("report", newReport);
        
        // Trigger notification broadcast (async)
        String notificationType = request.getType().equals("Lost") ? "lost_posted" : "found_posted";
        try {
            notificationService.broadcastNotification(
                    reporterId, id, notificationType, 
                    request.getItem(), request.getLocation()
            );
        } catch (Exception e) {
            System.err.println("Notification broadcast error: " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    // DELETE /api/reports/:id - Delete report
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        
        if (!reportRepository.existsById(id)) {
            response.put("success", false);
            response.put("message", "Report not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        reportRepository.deleteById(id);
        
        response.put("success", true);
        response.put("message", "Report deleted");
        return ResponseEntity.ok(response);
    }
    
    // PATCH /api/reports/:id/status - Update report status
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateReportStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        String status = request.get("status");
        
        List<String> validStatuses = Arrays.asList("Pending", "Retrieved", "Returned", "Resolved", "Brought Back");
        if (status == null || !validStatuses.contains(status)) {
            response.put("success", false);
            response.put("message", "Invalid status");
            return ResponseEntity.badRequest().body(response);
        }
        
        Optional<Report> reportOpt = reportRepository.findById(id);
        
        if (reportOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Report not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        Report report = reportOpt.get();
        report.setStatus(status);
        reportRepository.save(report);
        
        response.put("success", true);
        response.put("report", report);
        
        // Notify item owner if status changed to retrieved/returned
        List<String> retrievedStatuses = Arrays.asList("Retrieved", "Returned", "Resolved", "Brought Back");
        if (retrievedStatuses.contains(status) && report.getReporterId() != null) {
            try {
                notificationService.notifyUser(
                        report.getReporterId(), id, "item_retrieved",
                        report.getItem(), null, null
                );
            } catch (Exception e) {
                System.err.println("Notification error: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(response);
    }
}
