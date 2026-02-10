package com.lostandfound.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class WebSocketController {
    
    private final AtomicInteger connectedUsers = new AtomicInteger(0);
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        int count = connectedUsers.incrementAndGet();
        System.out.println("User connected. Total: " + count);
        messagingTemplate.convertAndSend("/topic/activeUsers", count);
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        int count = connectedUsers.decrementAndGet();
        if (count < 0) {
            connectedUsers.set(0);
            count = 0;
        }
        System.out.println("User disconnected. Total: " + count);
        messagingTemplate.convertAndSend("/topic/activeUsers", count);
    }
    
    @MessageMapping("/getActiveUsers")
    @SendTo("/topic/activeUsers")
    public int getActiveUsers() {
        return connectedUsers.get();
    }
}
