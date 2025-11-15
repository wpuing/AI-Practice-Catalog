package com.example.user.domain.repository;

import com.example.user.domain.entity.UserInfo;

import java.util.List;

/**
 * 用户信息仓储接口
 */
public interface UserInfoRepository {
    /**
     * 根据ID查询用户
     */
    UserInfo findById(String id);

    /**
     * 根据用户名查询用户
     */
    UserInfo findByUsername(String username);

    /**
     * 分页查询用户列表
     */
    List<UserInfo> findList(int pageNum, int pageSize, String keyword);

    /**
     * 统计用户总数
     */
    long count(String keyword);

    /**
     * 保存用户
     */
    void save(UserInfo user);

    /**
     * 更新用户
     */
    void update(UserInfo user);

    /**
     * 删除用户
     */
    void delete(String id);
}



