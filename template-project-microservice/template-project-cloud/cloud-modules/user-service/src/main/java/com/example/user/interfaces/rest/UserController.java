package com.example.user.interfaces.rest;

import com.example.core.common.result.Result;
import com.example.user.application.dto.CreateUserCommand;
import com.example.user.application.dto.PageResult;
import com.example.user.application.dto.UpdateUserCommand;
import com.example.user.application.dto.UserDTO;
import com.example.user.application.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    /**
     * 获取用户列表（分页）
     */
    @GetMapping
    public Result<PageResult<UserDTO>> getUserList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword) {
        PageResult<UserDTO> result = userService.getUserList(pageNum, pageSize, keyword);
        return Result.success(result);
    }

    /**
     * 根据ID获取用户
     */
    @GetMapping("/{id}")
    public Result<UserDTO> getUserById(@PathVariable String id) {
        UserDTO user = userService.getUserById(id);
        return Result.success(user);
    }

    /**
     * 创建用户
     */
    @PostMapping
    public Result<UserDTO> createUser(@RequestBody @Valid CreateUserCommand command) {
        UserDTO user = userService.createUser(command);
        return Result.success(user);
    }

    /**
     * 更新用户
     */
    @PutMapping("/{id}")
    public Result<UserDTO> updateUser(@PathVariable String id, @RequestBody @Valid UpdateUserCommand command) {
        UserDTO user = userService.updateUser(id, command);
        return Result.success(user);
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return Result.success();
    }

    /**
     * 批量删除用户
     */
    @PostMapping("/batch-delete")
    public Result<Void> batchDeleteUsers(@RequestBody java.util.List<String> ids) {
        for (String id : ids) {
            userService.deleteUser(id);
        }
        return Result.success();
    }
}



