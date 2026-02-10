package com.lostandfound.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReportRequest {
    private String item;
    private String description;
    private String location;
    private String type;  // Lost or Found
    private LocalDate date;
    private String image;
    private String contact;
    private String reportedBy;
    private String reporterEmail;
}
