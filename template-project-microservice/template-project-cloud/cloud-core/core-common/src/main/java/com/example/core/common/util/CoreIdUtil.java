package com.example.core.common.util;

import cn.hutool.core.util.IdUtil;

/**
 * ID 工具类
 * 注意：重命名为 CoreIdUtil 避免与 Hutool 的 IdUtil 冲突
 */
public class CoreIdUtil {
    /**
     * 生成32位随机ID（小写字母和数字）
     */
    public static String generateId() {
        return IdUtil.fastSimpleUUID().replace("-", "");
    }

    /**
     * 生成雪花算法ID
     */
    public static Long generateSnowflakeId() {
        return IdUtil.getSnowflake().nextId();
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
