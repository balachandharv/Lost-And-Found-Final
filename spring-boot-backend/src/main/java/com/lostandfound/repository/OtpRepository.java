package com.lostandfound.repository;

import com.lostandfound.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpRepository extends JpaRepository<Otp, String> {
    
    @Query("SELECT o FROM Otp o WHERE o.email = :email AND o.code = :code AND o.used = false AND o.expiresAt > :now")
    Optional<Otp> findValidOtp(@Param("email") String email, @Param("code") String code, @Param("now") LocalDateTime now);
    
    void deleteByEmail(String email);
}
