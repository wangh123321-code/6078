package com.catpedigree.service;

import com.catpedigree.dto.UserDTO;
import com.catpedigree.enums.Role;
import com.catpedigree.model.User;
import com.catpedigree.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User createUser(UserDTO dto) {
        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("用户名已存在: " + dto.getUsername());
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("邮箱已存在: " + dto.getEmail());
        }

        User user = new User();
        BeanUtils.copyProperties(dto, user);
        user.setPassword(passwordEncoder.encode(dto.getPassword()));

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(String id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));

        if (!user.getUsername().equals(dto.getUsername())
                && userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("用户名已存在: " + dto.getUsername());
        }

        BeanUtils.copyProperties(dto, user, "id", "password");

        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + id));
    }

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("用户不存在: " + username));
    }

    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    public List<User> getUsersByCattery(String catteryId) {
        return userRepository.findByCatteryId(catteryId);
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    @Transactional
    public void initDefaultUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setEmail("admin@catpedigree.com");
            admin.setRealName("系统管理员");
            admin.setRole(Role.SUPER_ADMIN);
            admin.setEnabled(true);
            userRepository.save(admin);
            System.out.println("默认超级管理员已创建: admin/admin123");
        }

        if (!userRepository.existsByUsername("cattery")) {
            User cattery = new User();
            cattery.setUsername("cattery");
            cattery.setPassword(passwordEncoder.encode("cattery123"));
            cattery.setEmail("cattery@catpedigree.com");
            cattery.setRealName("猫舍管理员");
            cattery.setRole(Role.CATTERY_ADMIN);
            cattery.setCatteryId("CATTERY001");
            cattery.setCatteryName("示范猫舍");
            cattery.setEnabled(true);
            userRepository.save(cattery);
            System.out.println("默认猫舍管理员已创建: cattery/cattery123");
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("user123"));
            user.setEmail("user@catpedigree.com");
            user.setRealName("普通用户");
            user.setRole(Role.USER);
            user.setEnabled(true);
            userRepository.save(user);
            System.out.println("默认普通用户已创建: user/user123");
        }
    }
}
