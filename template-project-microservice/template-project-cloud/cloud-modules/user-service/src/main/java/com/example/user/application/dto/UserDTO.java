package com.example.user.application.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 用户DTO
 */
@Data
public class UserDTO {
    private String id;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String avatar;
    private Integer gender;
    private LocalDate birthday;
    private String address;
    private Integer status;
    private LocalDateTime createDate;
    private LocalDateTime updateDate;
}



