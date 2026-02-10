package com.lostandfound;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class LostFoundApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(LostFoundApplication.class, args);
        System.out.println("\n" +
            "  ╔════════════════════════════════════════════╗\n" +
            "  ║   🔍 College Lost & Found Backend          ║\n" +
            "  ║   Spring Boot Server running on port 5000  ║\n" +
            "  ║   API: http://localhost:5000/api           ║\n" +
            "  ║   WebSocket: Enabled                       ║\n" +
            "  ╚════════════════════════════════════════════╝\n");
    }
}
