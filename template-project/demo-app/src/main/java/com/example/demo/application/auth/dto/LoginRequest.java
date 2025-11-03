package com.example.demo.application.auth.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.io.Serializable;

@Data
public class LoginRequest implements Serializable {
    @JsonProperty("username")
    private String username;
    
    @JsonProperty("password")
    private String password;
}

