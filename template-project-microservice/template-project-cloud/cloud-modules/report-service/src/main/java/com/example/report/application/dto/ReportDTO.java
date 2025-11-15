package com.example.report.application.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表DTO
 */
@Data
public class ReportDTO {
    private String id;
    private String reportName;
    private String reportType;
    private String templateId;
    private String templateName;
    private String status;
    private String description;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}



