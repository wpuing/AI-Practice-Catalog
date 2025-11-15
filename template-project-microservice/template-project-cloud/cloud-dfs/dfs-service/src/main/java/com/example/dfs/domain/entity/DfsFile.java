package com.example.dfs.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 文件信息实体
 */
@Data
@TableName("dfs_file")
public class DfsFile {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String fileName;
    private String filePath;
    private Long fileSize;
    private String fileType;
    private String fileExt;
    private String uploadUserId;
    private LocalDateTime uploadTime;
    private String accessUrl;
    private LocalDateTime createDate;
    private String createUser;
    private LocalDateTime updateDate;
    private String updateUser;
    private Integer deleted;
    private Integer dbVersion;
}



