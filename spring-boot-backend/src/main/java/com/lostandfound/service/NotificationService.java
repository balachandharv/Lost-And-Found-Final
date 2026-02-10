package com.lostandfound.service;

import com.lostandfound.entity.DeviceToken;
import com.lostandfound.entity.Notification;
import com.lostandfound.entity.User;
import com.lostandfound.repository.DeviceTokenRepository;
import com.lostandfound.repository.NotificationRepository;
import com.lostandfound.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    @Autowired
    private DeviceTokenRepository deviceTokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    private String generateId() {
        return "N" + System.currentTimeMillis() + 
               Long.toString(ThreadLocalRandom.current().nextLong(0, 10000), 36);
    }
    
    private Map<String, String> getNotificationContent(String type, String itemName, String location, String newStatus) {
        return switch (type) {
            case "lost_posted" -> Map.of(
                    "title", "Lost Item Alert",
                    "body", "A " + itemName + " was reported lost near " + location
            );
            case "found_posted" -> Map.of(
                    "title", "Found Item Update",
                    "body", "Someone found a " + itemName + " near " + location
            );
            case "item_retrieved" -> Map.of(
                    "title", "Item Retrieved",
                    "body", "Great news! The " + itemName + " has been successfully returned"
            );
            case "status_update" -> Map.of(
                    "title", "Status Update",
                    "body", "Your reported " + itemName + " status changed to: " + newStatus
            );
            default -> Map.of(
                    "title", "Notification",
                    "body", "You have a new update"
            );
        };
    }
    
    public Notification saveNotification(String userId, String itemId, String type, String title, String body, String clickAction) {
        Notification notification = Notification.builder()
                .id(generateId())
                .userId(userId)
                .itemId(itemId)
                .type(type)
                .title(title)
                .body(body)
                .icon("/logo_icon.png")
                .clickAction(clickAction != null ? clickAction : "/item/" + itemId)
                .isRead(false)
                .isSent(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        return notificationRepository.save(notification);
    }
    
    public Notification notifyUser(String userId, String itemId, String type, String itemName, String location, String newStatus) {
        Map<String, String> content = getNotificationContent(type, itemName, location, newStatus);
        String clickAction = "/item/" + itemId;
        
        Notification notification = saveNotification(
                userId, itemId, type, 
                content.get("title"), content.get("body"), 
                clickAction
        );
        
        // Try to send push notification (simplified - would need Firebase integration)
        // For now, just mark as saved
        System.out.println("Notification created for user " + userId + ": " + content.get("title"));
        
        return notification;
    }
    
    public void broadcastNotification(String excludeUserId, String itemId, String type, String itemName, String location) {
        List<User> allUsers = userRepository.findAll();
        
        System.out.println("Broadcasting " + type + " notification to " + allUsers.size() + " users");
        
        for (User user : allUsers) {
            try {
                notifyUser(user.getId(), itemId, type, itemName, location, null);
            } catch (Exception e) {
                System.err.println("Failed to notify user " + user.getId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Broadcast complete");
    }
    
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    public List<Notification> getUserNotifications(String userId, int limit) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (notifications.size() > limit) {
            return notifications.subList(0, limit);
        }
        return notifications;
    }
    
    public Notification markAsRead(String notificationId) {
        return notificationRepository.findById(notificationId)
                .map(notification -> {
                    notification.setIsRead(true);
                    return notificationRepository.save(notification);
                })
                .orElse(null);
    }
    
    public int markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
        return unreadNotifications.size();
    }
    
    @Transactional
    public int clearAllNotifications(String userId) {
        List<Notification> userNotifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        int count = userNotifications.size();
        notificationRepository.deleteAll(userNotifications);
        return count;
    }
    
    // Device Token Operations
    public DeviceToken registerToken(String userId, String token, String device, String browser) {
        // Check if token already exists
        return deviceTokenRepository.findByToken(token)
                .map(existing -> {
                    if (!existing.getUserId().equals(userId)) {
                        existing.setUserId(userId);
                        existing.setLastUsed(LocalDateTime.now());
                        return deviceTokenRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    DeviceToken newToken = DeviceToken.builder()
                            .id("DT" + System.currentTimeMillis())
                            .userId(userId)
                            .token(token)
                            .device(device != null ? device : "desktop")
                            .browser(browser != null ? browser : "unknown")
                            .createdAt(LocalDateTime.now())
                            .lastUsed(LocalDateTime.now())
                            .build();
                    return deviceTokenRepository.save(newToken);
                });
    }
    
    @Transactional
    public void unregisterToken(String userId, String token) {
        if (token != null) {
            deviceTokenRepository.deleteByToken(token);
        } else {
            deviceTokenRepository.deleteByUserId(userId);
        }
    }
}
