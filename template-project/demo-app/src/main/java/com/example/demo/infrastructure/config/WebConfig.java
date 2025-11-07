package com.example.demo.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*") // 使用allowedOriginPatterns支持credentials
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true) // 允许携带凭证（如Authorization header）
                .maxAge(3600);
    }

    /**
     * 扩展HTTP消息转换器，确保Jackson正确序列化Java 8时间类型
     * 使用extendMessageConverters而不是configureMessageConverters，避免覆盖默认转换器
     */
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 查找Jackson消息转换器并配置
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter) {
                MappingJackson2HttpMessageConverter jacksonConverter = (MappingJackson2HttpMessageConverter) converter;
                ObjectMapper objectMapper = jacksonConverter.getObjectMapper();
                
                // 注册Java 8时间模块（如果尚未注册）
                if (objectMapper != null && !objectMapper.getRegisteredModuleIds().contains(JavaTimeModule.class.getName())) {
                    objectMapper.registerModule(new JavaTimeModule());
                }
                
                // 禁用将日期写为时间戳，使用ISO-8601格式
                if (objectMapper != null) {
                    objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
                }
            }
        }
    }
}

