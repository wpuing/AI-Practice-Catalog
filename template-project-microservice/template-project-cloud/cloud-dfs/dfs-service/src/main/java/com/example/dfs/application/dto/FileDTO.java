package com.example.dfs.application.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件DTO
 */
@Data
public class FileDTO {
    private String id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String uploadUser;
    private String uploadUserId;
    private LocalDateTime uploadDate;
    private LocalDateTime uploadTime;
    private String accessUrl;
}



