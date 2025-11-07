package com.example.demo.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.Jackson2ObjectMapperBuilder;

/**
 * Jackson配置类
 * 配置ObjectMapper以支持Java 8时间类型（LocalDateTime等）
 */
@Configuration
public class JacksonConfig {

    /**
     * 自定义Jackson2ObjectMapperBuilder，确保Java 8时间模块被正确注册
     */
    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            // 注册Java 8时间模块
            builder.modules(new JavaTimeModule());
            
            // 禁用将日期写为时间戳，使用ISO-8601格式
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }

    /**
     * 配置ObjectMapper Bean，支持Java 8时间类型
     * 使用@Primary确保这是主要的ObjectMapper Bean
     */
    @Bean
    @org.springframework.context.annotation.Primary
    public ObjectMapper objectMapper(Jackson2ObjectMapperBuilder builder) {
        ObjectMapper objectMapper = builder.build();
        
        // 确保Java 8时间模块已注册
        if (!objectMapper.getRegisteredModuleIds().contains(JavaTimeModule.class.getName())) {
            objectMapper.registerModule(new JavaTimeModule());
        }
        
        // 禁用将日期写为时间戳
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return objectMapper;
    }
}

