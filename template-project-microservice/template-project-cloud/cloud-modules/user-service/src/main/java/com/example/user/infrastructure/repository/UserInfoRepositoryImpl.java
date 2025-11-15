package com.example.user.infrastructure.repository;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.user.domain.entity.UserInfo;
import com.example.user.domain.repository.UserInfoRepository;
import com.example.user.infrastructure.repository.mapper.UserInfoMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 用户信息仓储实现
 */
@Repository
@RequiredArgsConstructor
public class UserInfoRepositoryImpl implements UserInfoRepository {
    private final UserInfoMapper userInfoMapper;

    @Override
    public UserInfo findById(String id) {
        return userInfoMapper.selectOne(
                new LambdaQueryWrapper<UserInfo>()
                        .eq(UserInfo::getId, id)
                        .eq(UserInfo::getDeleted, 0)
        );
    }

    @Override
    public UserInfo findByUsername(String username) {
        return userInfoMapper.selectOne(
                new LambdaQueryWrapper<UserInfo>()
                        .eq(UserInfo::getUsername, username)
                        .eq(UserInfo::getDeleted, 0)
        );
    }

    @Override
    public List<UserInfo> findList(int pageNum, int pageSize, String keyword) {
        LambdaQueryWrapper<UserInfo> wrapper = new LambdaQueryWrapper<UserInfo>()
                .eq(UserInfo::getDeleted, 0)
                .orderByDesc(UserInfo::getCreateDate);

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                    .like(UserInfo::getUsername, keyword)
                    .or()
                    .like(UserInfo::getEmail, keyword)
                    .or()
                    .like(UserInfo::getPhone, keyword)
            );
        }

        Page<UserInfo> page = new Page<>(pageNum, pageSize);
        Page<UserInfo> result = userInfoMapper.selectPage(page, wrapper);
        return result.getRecords();
    }

    @Override
    public long count(String keyword) {
        LambdaQueryWrapper<UserInfo> wrapper = new LambdaQueryWrapper<UserInfo>()
                .eq(UserInfo::getDeleted, 0);

        if (StringUtils.hasText(keyword)) {
            wrapper.and(w -> w
                    .like(UserInfo::getUsername, keyword)
                    .or()
                    .like(UserInfo::getEmail, keyword)
                    .or()
                    .like(UserInfo::getPhone, keyword)
            );
        }

        return userInfoMapper.selectCount(wrapper);
    }

    @Override
    public void save(UserInfo user) {
        userInfoMapper.insert(user);
    }

    @Override
    public void update(UserInfo user) {
        userInfoMapper.updateById(user);
    }

    @Override
    public void delete(String id) {
        userInfoMapper.update(null,
                new LambdaUpdateWrapper<UserInfo>()
                        .eq(UserInfo::getId, id)
                        .set(UserInfo::getDeleted, 1)
        );
    }
}



