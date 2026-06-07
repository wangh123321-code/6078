package com.catpedigree.repository;

import com.catpedigree.model.User;
import com.catpedigree.enums.Role;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    List<User> findByCatteryId(String catteryId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
