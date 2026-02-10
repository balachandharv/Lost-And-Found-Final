package com.lostandfound.dto;

import lombok.Data;

@Data
public class OtpRequest {
    private String email;
    private String type;  // login or reset
}
