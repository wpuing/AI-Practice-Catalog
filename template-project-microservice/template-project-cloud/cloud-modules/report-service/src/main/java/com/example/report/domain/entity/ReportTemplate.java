package com.example.report.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表模板实体
 */
@Data
@TableName("report_template")
public class ReportTemplate {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String templateName;
    private String templateCode;
    private String templateType;
    private String templateContent;
    private String description;
    private Boolean enabled;
    private LocalDateTime createDate;
    private String createUser;
    private LocalDateTime updateDate;
    private String updateUser;
    private Integer deleted;
    private Integer dbVersion;
}



