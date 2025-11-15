package com.example.user.application.dto;

import lombok.Data;

/**
 * 更新用户命令
 */
@Data
public class UpdateUserCommand {
    private String email;
    private String phone;
    private Integer status;
}



