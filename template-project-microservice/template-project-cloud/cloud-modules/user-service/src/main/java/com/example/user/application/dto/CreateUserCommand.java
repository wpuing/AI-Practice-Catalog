package com.example.user.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 创建用户命令
 */
@Data
public class CreateUserCommand {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    private String email;
    private String phone;
    private Integer status = 1;
}



