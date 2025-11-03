package com.example.demo.service;

import com.example.demo.domain.user.entity.User;
import com.example.demo.application.user.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Test
    void testSave() {
        User user = new User();
        user.setUsername("serviceTest");
        user.setPassword("servicePass");

        boolean saved = userService.save(user);
        assertTrue(saved);
        assertNotNull(user.getId());
    }

    @Test
    void testGetById() {
        User user = new User();
        user.setUsername("getTest");
        user.setPassword("getPass");
        userService.save(user);

        User found = userService.getById(user.getId());
        assertNotNull(found);
        assertEquals("getTest", found.getUsername());
    }

    @Test
    void testUpdate() {
        User user = new User();
        user.setUsername("updateTest");
        user.setPassword("updatePass");
        userService.save(user);

        user.setUsername("updatedName");
        boolean updated = userService.updateById(user);
        assertTrue(updated);

        User found = userService.getById(user.getId());
        assertEquals("updatedName", found.getUsername());
    }

    @Test
    void testDelete() {
        User user = new User();
        user.setUsername("deleteTest");
        user.setPassword("deletePass");
        userService.save(user);

        String id = user.getId();
        boolean deleted = userService.removeById(id);
        assertTrue(deleted);

        User found = userService.getById(id);
        assertNull(found);
    }
}

