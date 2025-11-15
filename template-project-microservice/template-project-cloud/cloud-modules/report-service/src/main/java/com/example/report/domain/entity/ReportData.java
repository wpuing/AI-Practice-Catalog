package com.example.report.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 报表数据实体
 */
@Data
@TableName("report_data")
public class ReportData {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    private String templateId;
    private String reportName;
    private String reportData;
    private String reportStatus;
    private LocalDateTime createDate;
    private String createUser;
    private LocalDateTime updateDate;
    private String updateUser;
    private Integer deleted;
    private Integer dbVersion;
}



