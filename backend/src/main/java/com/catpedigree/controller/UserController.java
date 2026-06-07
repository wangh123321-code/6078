package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.dto.UserDTO;
import com.catpedigree.enums.Role;
import com.catpedigree.model.User;
import com.catpedigree.service.UserService;
import jakarta.annotation.PostConstruct;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@CrossOrigin
public class UserController {

    private final UserService userService;

    @PostConstruct
    public void init() {
        userService.initDefaultUsers();
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<User> createUser(@Valid @RequestBody UserDTO dto) {
        User user = userService.createUser(dto);
        return Result.success("用户创建成功", user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<User> updateUser(@PathVariable String id, @Valid @RequestBody UserDTO dto) {
        User user = userService.updateUser(id, dto);
        return Result.success("用户更新成功", user);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<User> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        return Result.success(user);
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<User> users = userService.getUsers(pageable);
        return Result.success(users);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<List<User>> getUsersByRole(@PathVariable Role role) {
        List<User> users = userService.getUsersByRole(role);
        return Result.success(users);
    }

    @GetMapping("/cattery/{catteryId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<User>> getUsersByCattery(@PathVariable String catteryId) {
        List<User> users = userService.getUsersByCattery(catteryId);
        return Result.success(users);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return Result.success("删除成功", null);
    }
}
