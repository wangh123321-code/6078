package com.catpedigree.dto;

import com.catpedigree.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserDTO {

    private String id;

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @Email(message = "邮箱格式不正确")
    private String email;

    private String phone;

    private String realName;

    @NotNull(message = "角色不能为空")
    private Role role;

    private String catteryId;

    private String catteryName;
}
