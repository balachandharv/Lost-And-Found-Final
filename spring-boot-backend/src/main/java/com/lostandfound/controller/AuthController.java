package com.lostandfound.controller;

import com.lostandfound.dto.*;
import com.lostandfound.entity.Otp;
import com.lostandfound.entity.User;
import com.lostandfound.repository.OtpRepository;
import com.lostandfound.repository.UserRepository;
import com.lostandfound.security.JwtUtil;
import com.lostandfound.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OtpRepository otpRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Value("${app.admin.email}")
    private String adminEmail;
    
    private static final Pattern VALID_ID_PATTERN = Pattern.compile("^23it0(0[1-9]|[12][0-9]|30)$");
    
    // POST /api/auth/register - Register new user
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getName() == null || request.getEmail() == null || request.getPassword() == null) {
            response.put("success", false);
            response.put("message", "All fields are required");
            return ResponseEntity.badRequest().body(response);
        }
        
        String emailLower = request.getEmail().toLowerCase().trim();
        
        // Validate email domain
        if (!emailLower.endsWith("@psr.edu.in")) {
            response.put("success", false);
            response.put("message", "Only @psr.edu.in emails are allowed");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Validate ID pattern
        String idPart = emailLower.split("@")[0];
        if (!VALID_ID_PATTERN.matcher(idPart).matches()) {
            response.put("success", false);
            response.put("message", "Invalid ID. Allowed: 23IT001 to 23IT030");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Check if user exists
        if (userRepository.existsByEmail(emailLower)) {
            response.put("success", false);
            response.put("message", "User already exists");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Determine role
        String assignedRole = idPart.equals("23it008") ? "Admin" : "Student";
        
        // Create new user
        User newUser = User.builder()
                .id("U" + System.currentTimeMillis())
                .name(request.getName())
                .email(emailLower)
                .password(request.getPassword())  // In production, hash this!
                .role(assignedRole)
                .status("Active")
                .createdAt(LocalDateTime.now())
                .build();
        
        userRepository.save(newUser);
        
        response.put("success", true);
        response.put("user", UserResponse.fromUser(newUser));
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/login - Password login
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail().toLowerCase());
        
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        User user = userOpt.get();
        
        if ("Blocked".equals(user.getStatus())) {
            response.put("success", false);
            response.put("message", "Your account has been blocked");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        
        response.put("success", true);
        response.put("token", token);
        response.put("user", UserResponse.fromUser(user));
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/request-otp - Request OTP for login
    @PostMapping("/request-otp")
    public ResponseEntity<Map<String, Object>> requestOtp(@RequestBody OtpRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getEmail() == null) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        String emailLower = request.getEmail().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(emailLower);
        
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Email not registered. Please Sign Up first.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();
        
        // Generate and save OTP
        Otp otp = emailService.createAndSaveOtp(emailLower);
        
        // Send OTP email
        String type = request.getType() != null ? request.getType() : "login";
        boolean sent = emailService.sendOTPEmail(emailLower, otp.getCode(), user.getName(), type);
        
        if (!sent) {
            response.put("success", false);
            response.put("message", "Failed to send OTP email. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
        
        response.put("success", true);
        response.put("message", "OTP sent to your email (Check Console/Alert for Dev)");
        response.put("userName", user.getName());
        response.put("debugOtp", otp.getCode());  // TODO: Remove in production!
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/verify-otp - Verify OTP and login
    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody VerifyOtpRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getEmail() == null || request.getOtp() == null) {
            response.put("success", false);
            response.put("message", "Email and OTP are required");
            return ResponseEntity.badRequest().body(response);
        }
        
        String emailLower = request.getEmail().toLowerCase();
        
        // Find valid OTP
        Optional<Otp> otpOpt = otpRepository.findValidOtp(emailLower, request.getOtp(), LocalDateTime.now());
        
        if (otpOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP. Please request a new one.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Mark OTP as used
        Otp otp = otpOpt.get();
        otp.setUsed(true);
        otpRepository.save(otp);
        
        // Find user
        Optional<User> userOpt = userRepository.findByEmail(emailLower);
        
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User account not found.");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();
        
        if ("Blocked".equals(user.getStatus())) {
            response.put("success", false);
            response.put("message", "Your account has been blocked by an Admin.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", UserResponse.fromUser(user));
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/reset-password - Reset password with OTP
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getEmail() == null || request.getOtp() == null || request.getNewPassword() == null) {
            response.put("success", false);
            response.put("message", "All fields are required");
            return ResponseEntity.badRequest().body(response);
        }
        
        String emailLower = request.getEmail().toLowerCase();
        
        // Verify OTP
        Optional<Otp> otpOpt = otpRepository.findValidOtp(emailLower, request.getOtp(), LocalDateTime.now());
        
        if (otpOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "Invalid or expired OTP");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Mark OTP as used
        Otp otp = otpOpt.get();
        otp.setUsed(true);
        otpRepository.save(otp);
        
        // Find and update user
        Optional<User> userOpt = userRepository.findByEmail(emailLower);
        
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        User user = userOpt.get();
        user.setPassword(request.getNewPassword());
        userRepository.save(user);
        
        response.put("success", true);
        response.put("message", "Password reset successfully");
        return ResponseEntity.ok(response);
    }
    
    // GET /api/auth/me - Get current user from token
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        Map<String, Object> response = new HashMap<>();
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.put("success", false);
            response.put("message", "No token provided");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String token = authHeader.substring(7);
        
        if (!jwtUtil.validateToken(token)) {
            response.put("success", false);
            response.put("message", "Invalid token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        String userId = jwtUtil.getUserIdFromToken(token);
        Optional<User> userOpt = userRepository.findById(userId);
        
        if (userOpt.isEmpty()) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
        
        response.put("success", true);
        response.put("user", UserResponse.fromUser(userOpt.get()));
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/google-check - Check if Google user exists
    @PostMapping("/google-check")
    public ResponseEntity<Map<String, Object>> googleCheck(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");
        
        if (email == null) {
            response.put("success", false);
            response.put("message", "Email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email.toLowerCase());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            response.put("success", true);
            response.put("exists", true);
            Map<String, String> userData = new HashMap<>();
            userData.put("name", user.getName());
            userData.put("email", user.getEmail());
            userData.put("role", user.getRole());
            response.put("user", userData);
        } else {
            response.put("success", true);
            response.put("exists", false);
        }
        
        return ResponseEntity.ok(response);
    }
    
    // POST /api/auth/google - Google OAuth login/register
    @PostMapping("/google")
    public ResponseEntity<Map<String, Object>> googleAuth(@RequestBody GoogleAuthRequest request) {
        Map<String, Object> response = new HashMap<>();
        
        if (request.getEmail() == null || request.getGoogleId() == null) {
            response.put("success", false);
            response.put("message", "Email and Google ID are required");
            return ResponseEntity.badRequest().body(response);
        }
        
        String emailLower = request.getEmail().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(emailLower);
        
        User user;
        if (userOpt.isEmpty()) {
            // Create new user from Google auth
            boolean isAdmin = emailLower.equals(adminEmail.toLowerCase());
            
            user = User.builder()
                    .id("U" + System.currentTimeMillis())
                    .name(request.getName() != null ? request.getName() : emailLower.split("@")[0])
                    .email(emailLower)
                    .role(isAdmin ? "Admin" : "Student")
                    .status("Active")
                    .googleId(request.getGoogleId())
                    .profileImage(request.getPicture())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            userRepository.save(user);
            System.out.println("Created new Google user: " + user.getEmail());
        } else {
            user = userOpt.get();
            // Update Google ID if not set
            if (user.getGoogleId() == null) {
                user.setGoogleId(request.getGoogleId());
                user.setProfileImage(request.getPicture());
                userRepository.save(user);
            }
        }
        
        if ("Blocked".equals(user.getStatus())) {
            response.put("success", false);
            response.put("message", "Your account has been blocked by an Admin.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }
        
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole());
        
        response.put("success", true);
        response.put("message", "Login successful");
        response.put("token", token);
        response.put("user", UserResponse.fromUser(user));
        return ResponseEntity.ok(response);
    }
}
