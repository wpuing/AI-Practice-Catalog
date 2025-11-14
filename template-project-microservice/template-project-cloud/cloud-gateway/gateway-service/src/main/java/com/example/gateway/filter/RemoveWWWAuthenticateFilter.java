package com.example.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * 移除响应中的 WWW-Authenticate 头，避免浏览器弹出基本认证框
 */
@Component
public class RemoveWWWAuthenticateFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(exchange.getResponse()) {
            @Override
            public HttpHeaders getHeaders() {
                HttpHeaders headers = super.getHeaders();
                // 移除 WWW-Authenticate 头，避免浏览器弹出基本认证框
                headers.remove(HttpHeaders.WWW_AUTHENTICATE);
                return headers;
            }
        };
        
        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }

    @Override
    public int getOrder() {
        // 设置较低的优先级，确保在其他过滤器之后执行
        return Ordered.LOWEST_PRECEDENCE;
    }
}

