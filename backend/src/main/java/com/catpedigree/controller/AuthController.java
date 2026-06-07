package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.dto.LoginDTO;
import com.catpedigree.dto.UserDTO;
import com.catpedigree.model.User;
import com.catpedigree.security.JwtTokenUtil;
import com.catpedigree.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;
    private final UserService userService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody LoginDTO dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String token = jwtTokenUtil.generateToken(userDetails);

        User user = userService.getUserById(userDetails.getUsername());

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        return Result.success("登录成功", data);
    }

    @PostMapping("/register")
    public Result<User> register(@Valid @RequestBody UserDTO dto) {
        User user = userService.createUser(dto);
        return Result.success("注册成功", user);
    }

    @GetMapping("/me")
    public Result<User> getCurrentUser() {
        String userId = (String) org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getPrincipal();
        User user = userService.getUserById(userId);
        return Result.success(user);
    }
}
