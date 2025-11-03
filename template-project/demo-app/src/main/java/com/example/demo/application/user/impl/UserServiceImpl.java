package com.example.demo.application.user.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.example.demo.domain.user.entity.User;
import com.example.demo.domain.user.repository.UserMapper;
import com.example.demo.application.user.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
}

