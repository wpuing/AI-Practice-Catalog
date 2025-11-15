package com.example.dfs;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * 文件服务启动类
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.example.core.feign")
@MapperScan("com.example.dfs.infrastructure.repository.mapper")
public class DfsServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DfsServiceApplication.class, args);
    }
}

