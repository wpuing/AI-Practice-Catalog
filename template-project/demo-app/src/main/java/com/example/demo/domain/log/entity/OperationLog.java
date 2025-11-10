package com.example.demo.domain.log.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.example.demo.domain.common.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 操作日志实体类
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("\"operation_log\"")
public class OperationLog extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @TableField("user_id")
    private String userId;

    @TableField("username")
    private String username;

    @TableField("operation_type")
    private String operationType;

    @TableField("module")
    private String module;

    @TableField("operation_desc")
    private String operationDesc;

    @TableField("request_method")
    private String requestMethod;

    @TableField("request_url")
    private String requestUrl;

    @TableField("request_params")
    private String requestParams;

    @TableField("response_result")
    private String responseResult;

    @TableField("ip_address")
    private String ipAddress;

    @TableField("user_agent")
    private String userAgent;

    @TableField("operation_time")
    private LocalDateTime operationTime;
}

