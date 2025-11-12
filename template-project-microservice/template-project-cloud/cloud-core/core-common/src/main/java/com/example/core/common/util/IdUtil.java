package com.example.core.common.util;

import cn.hutool.core.util.IdUtil;

/**
 * ID 工具类
 */
public class IdUtil {
    /**
     * 生成32位随机ID（小写字母和数字）
     */
    public static String generateId() {
        return cn.hutool.core.util.IdUtil.fastSimpleUUID().replace("-", "");
    }

    /**
     * 生成雪花算法ID
     */
    public static Long generateSnowflakeId() {
        return cn.hutool.core.util.IdUtil.getSnowflake().nextId();
    }

    /**
     * 生成UUID（带横线）
     */
    public static String generateUUID() {
        return java.util.UUID.randomUUID().toString();
    }

    /**
     * 生成UUID（不带横线）
     */
    public static String generateUUIDWithoutDash() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }
}

