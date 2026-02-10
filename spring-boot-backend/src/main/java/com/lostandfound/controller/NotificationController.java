package com.lostandfound.controller;

import com.lostandfound.entity.Notification;
import com.lostandfound.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    // Middleware to check authentication via x-user-id header
    private String getUserId(String userId) {
        return userId;
    }
    
    // POST /api/notifications/register-token - Register device token
    @PostMapping("/register-token")
    public ResponseEntity<Map<String, Object>> registerToken(
            @RequestHeader(value = "x-user-id", required = false) String userId,
            @RequestBody Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String token = request.get("token");
        if (token == null) {
            response.put("error", "Token is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        notificationService.registerToken(userId, token, request.get("device"), request.get("browser"));
        
        response.put("success", true);
        response.put("message", "Token registered");
        return ResponseEntity.ok(response);
    }
    
    // DELETE /api/notifications/unregister-token - Unregister device token
    @DeleteMapping("/unregister-token")
    public ResponseEntity<Map<String, Object>> unregisterToken(
            @RequestHeader(value = "x-user-id", required = false) String userId,
            @RequestBody(required = false) Map<String, String> request) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String token = request != null ? request.get("token") : null;
        notificationService.unregisterToken(userId, token);
        
        response.put("success", true);
        response.put("message", "Token(s) removed");
        return ResponseEntity.ok(response);
    }
    
    // GET /api/notifications - Get user notifications
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(
            @RequestHeader(value = "x-user-id", required = false) String userId,
            @RequestParam(value = "limit", defaultValue = "50") int limit) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        List<Notification> notifications = notificationService.getUserNotifications(userId, limit);
        
        response.put("notifications", notifications);
        return ResponseEntity.ok(response);
    }
    
    // GET /api/notifications/unread-count - Get unread count
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount(
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        long count = notificationService.getUnreadCount(userId);
        
        response.put("count", count);
        return ResponseEntity.ok(response);
    }
    
    // PATCH /api/notifications/:id/read - Mark as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable String id,
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        Notification notification = notificationService.markAsRead(id);
        
        if (notification != null) {
            response.put("success", true);
        } else {
            response.put("error", "Notification not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    // PATCH /api/notifications/read-all - Mark all as read
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        int count = notificationService.markAllAsRead(userId);
        
        response.put("success", true);
        response.put("markedCount", count);
        return ResponseEntity.ok(response);
    }
    
    // DELETE /api/notifications/clear-all - Clear all notifications
    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAll(
            @RequestHeader(value = "x-user-id", required = false) String userId) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (userId == null) {
            response.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        int count = notificationService.clearAllNotifications(userId);
        
        response.put("success", true);
        response.put("deletedCount", count);
        return ResponseEntity.ok(response);
    }
}
