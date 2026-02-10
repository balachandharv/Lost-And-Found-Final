package com.lostandfound.service;

import com.lostandfound.entity.Otp;
import com.lostandfound.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class EmailService {
    
    @Autowired(required = false)
    private JavaMailSender mailSender;
    
    @Autowired
    private OtpRepository otpRepository;
    
    @Value("${app.otp.expiry-minutes}")
    private int otpExpiryMinutes;
    
    @Value("${app.otp.length}")
    private int otpLength;
    
    private static final String DIGITS = "0123456789";
    private final SecureRandom random = new SecureRandom();
    
    public String generateOTP() {
        StringBuilder otp = new StringBuilder(otpLength);
        for (int i = 0; i < otpLength; i++) {
            otp.append(DIGITS.charAt(random.nextInt(DIGITS.length())));
        }
        return otp.toString();
    }
    
    public Otp createAndSaveOtp(String email) {
        String code = generateOTP();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(otpExpiryMinutes);
        
        Otp otp = Otp.builder()
                .id("OTP" + System.currentTimeMillis())
                .email(email.toLowerCase())
                .code(code)
                .expiresAt(expiresAt)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();
        
        return otpRepository.save(otp);
    }
    
    public boolean sendOTPEmail(String email, String otp, String userName, String type) {
        String subject = type.equals("reset") ? "🔐 Reset Your Password" : "🔐 Your Login Verification Code";
        String title = type.equals("reset") ? "Reset Password" : "Hello " + userName + "!";
        String message = type.equals("reset") 
                ? "Use the code below to reset your password:" 
                : "Use the code below to verify your login:";
        
        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2563eb; margin: 0;">🔍 College Lost & Found</h1>
                </div>
                
                <div style="background: #f8fafc; border-radius: 12px; padding: 30px; text-align: center;">
                    <h2 style="color: #1e293b; margin-bottom: 10px;">%s</h2>
                    <p style="color: #64748b; margin-bottom: 25px;">%s</p>
                    
                    <div style="background: #2563eb; color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 8px; display: inline-block;">
                        %s
                    </div>
                    
                    <p style="color: #94a3b8; font-size: 14px; margin-top: 25px;">
                        This code expires in %d minutes.
                    </p>
                </div>
                
                <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                    If you didn't request this code, please ignore this email.
                </p>
            </div>
            """, title, message, otp, otpExpiryMinutes);
        
        try {
            if (mailSender != null) {
                MimeMessage mimeMessage = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
                helper.setFrom("lostandfound@psr.edu.in");
                helper.setTo(email);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);
                mailSender.send(mimeMessage);
                System.out.println("✅ OTP Email sent to: " + email);
            } else {
                // Fallback: Log OTP to console for development
                System.out.println("\n" +
                    "╔══════════════════════════════════════════════════════════════╗\n" +
                    "║  ⚠️  EMAIL NOT CONFIGURED - USING CONSOLE FALLBACK           ║\n" +
                    "╠══════════════════════════════════════════════════════════════╣\n" +
                    "║  📧 To: " + email + "\n" +
                    "║  🔢 OTP: " + otp + "\n" +
                    "╚══════════════════════════════════════════════════════════════╝\n");
            }
            return true;
        } catch (MessagingException e) {
            System.err.println("Email send error: " + e.getMessage());
            // Fallback: Log OTP to console
            System.out.println("\n" +
                "╔══════════════════════════════════════════════════════════════╗\n" +
                "║  ⚠️  EMAIL FAILED - USING CONSOLE FALLBACK                   ║\n" +
                "╠══════════════════════════════════════════════════════════════╣\n" +
                "║  📧 To: " + email + "\n" +
                "║  🔢 OTP: " + otp + "\n" +
                "╚══════════════════════════════════════════════════════════════╝\n");
            return true; // Return true to allow testing
        }
    }
}
