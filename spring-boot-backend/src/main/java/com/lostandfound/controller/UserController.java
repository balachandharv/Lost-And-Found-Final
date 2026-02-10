package com.lostandfound.controller;

import com.lostandfound.dto.UserResponse;
import com.lostandfound.entity.User;
import com.lostandfound.repository.UserRepository;
import com.lostandfound.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    // Verify admin middleware
    private boolean verifyAdmin(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        if (!jwtUtil.validateToken(token)) {
            return false;
        }
        String role = jwtUtil.getRoleFromToken(token);
        return "Admin".equals(role);
    }
    
    // GET /api/users - Get all users (Admin only)
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllUsers(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        if (!verifyAdmin(authHeader)) {
            response.put("success", false);
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        List<Map<String, Object>> users = userRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> userData = new HashMap<>();
                    userData.put("id", u.getId());
                    userData.put("name", u.getName());
                    userData.put("email", u.getEmail());
                    userData.put("role", u.getRole());
                    userData.put("status", u.getStatus());
                    userData.put("createdAt", u.getCreatedAt());
                    return userData;
                })
                .collect(Collectors.toList());
        
        response.put("success", true);
        response.put("users", users);
        return ResponseEntity.ok(response);
    }
    
    // PATCH /api/users/:id/status - Update user status (Admin only)
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateUserStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        Map<String, Object> response = new HashMap<>();
        
        if (!verifyAdmin(authHeader)) {
            response.put("success", false);
            response.put("message", "Admin access required");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        String status = request.get("status");
        
        if (status == null || (!status.equals("Active") && !status.equals("Blocked"))) {
            response.put("success", false);
            response.put("message", "Invalid status");
            return ResponseEntity.badRequest().body(response);
        }
        
        Optional<User> userOpt = userRepository.findById(id);
        
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();
        user.setStatus(status);
        userRepository.save(user);
        
        response.put("success", true);
        response.put("message", status.equals("Blocked") ? "User blocked" : "User activated");
        return ResponseEntity.ok(response);
    }
}
