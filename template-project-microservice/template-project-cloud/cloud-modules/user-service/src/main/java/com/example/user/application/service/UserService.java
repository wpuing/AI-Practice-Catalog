package com.example.user.application.service;

import com.example.core.common.exception.BusinessException;
import com.example.core.common.result.ResultCode;
import com.example.user.application.dto.CreateUserCommand;
import com.example.user.application.dto.PageResult;
import com.example.user.application.dto.UpdateUserCommand;
import com.example.user.application.dto.UserDTO;
import com.example.user.domain.entity.UserInfo;
import com.example.user.domain.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 用户服务
 */
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserInfoRepository userInfoRepository;

    /**
     * 获取用户列表（分页）
     */
    public PageResult<UserDTO> getUserList(int pageNum, int pageSize, String keyword) {
        List<UserInfo> users = userInfoRepository.findList(pageNum, pageSize, keyword);
        long total = userInfoRepository.count(keyword);

        List<UserDTO> userDTOs = users.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new PageResult<>(userDTOs, total, pageNum, pageSize);
    }

    /**
     * 根据ID获取用户
     */
    public UserDTO getUserById(String id) {
        UserInfo user = userInfoRepository.findById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        return convertToDTO(user);
    }

    /**
     * 创建用户
     */
    @Transactional
    public UserDTO createUser(CreateUserCommand command) {
        // 检查用户名是否已存在
        UserInfo existingUser = userInfoRepository.findByUsername(command.getUsername());
        if (existingUser != null) {
            throw new BusinessException(ResultCode.PARAM_ERROR, "用户名已存在");
        }

        UserInfo user = new UserInfo();
        user.setUsername(command.getUsername());
        user.setEmail(command.getEmail());
        user.setPhone(command.getPhone());
        user.setCreateDate(LocalDateTime.now());
        user.setCreateUser("system");
        user.setDeleted(0);
        user.setDbVersion(1);

        userInfoRepository.save(user);
        return convertToDTO(user);
    }

    /**
     * 更新用户
     */
    @Transactional
    public UserDTO updateUser(String id, UpdateUserCommand command) {
        UserInfo user = userInfoRepository.findById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }

        if (StringUtils.hasText(command.getEmail())) {
            user.setEmail(command.getEmail());
        }
        if (StringUtils.hasText(command.getPhone())) {
            user.setPhone(command.getPhone());
        }
        if (command.getStatus() != null) {
            // 注意：这里假设UserInfo有status字段，如果没有需要从auth_user表关联查询
            // 暂时先不处理status
        }

        user.setUpdateDate(LocalDateTime.now());
        user.setUpdateUser("system");
        user.setDbVersion(user.getDbVersion() + 1);

        userInfoRepository.update(user);
        return convertToDTO(user);
    }

    /**
     * 删除用户
     */
    @Transactional
    public void deleteUser(String id) {
        UserInfo user = userInfoRepository.findById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在");
        }
        userInfoRepository.delete(id);
    }

    /**
     * 转换为DTO
     */
    private UserDTO convertToDTO(UserInfo user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNickname(user.getNickname());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAvatar(user.getAvatar());
        dto.setGender(user.getGender());
        dto.setBirthday(user.getBirthday());
        dto.setAddress(user.getAddress());
        dto.setCreateDate(user.getCreateDate());
        dto.setUpdateDate(user.getUpdateDate());
        // status需要从auth_user表查询，这里暂时设为1
        dto.setStatus(1);
        return dto;
    }
}



