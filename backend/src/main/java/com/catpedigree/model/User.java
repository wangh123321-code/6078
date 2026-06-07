package com.catpedigree.model;

import com.catpedigree.enums.Role;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true, sparse = true)
    private String username;

    private String password;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String phone;

    private String realName;

    private Role role;

    private String catteryId;

    private String catteryName;

    private Boolean enabled = true;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
