package com.example.demo.common.util;

import java.security.SecureRandom;
import java.util.Random;

/**
 * ID生成工具类
 * 生成32位随机字符ID（小写字母和数字）
 */
public class IdGenerator {

    private static final String CHARACTERS = "0123456789abcdefghijklmnopqrstuvwxyz";
    private static final int ID_LENGTH = 32;
    private static final Random random = new SecureRandom();

    /**
     * 生成32位随机ID（小写字母和数字）
     * 
     * @return 32位随机字符串
     */
    public static String generateId() {
        StringBuilder sb = new StringBuilder(ID_LENGTH);
        for (int i = 0; i < ID_LENGTH; i++) {
            int index = random.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(index));
        }
        return sb.toString();
    }

    /**
     * 生成指定长度的随机ID（小写字母和数字）
     * 
     * @param length ID长度
     * @return 随机字符串
     */
    public static String generateId(int length) {
        if (length <= 0) {
            throw new IllegalArgumentException("ID长度必须大于0");
        }
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = random.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(index));
        }
        return sb.toString();
    }
}

