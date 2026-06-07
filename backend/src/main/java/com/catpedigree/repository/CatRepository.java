package com.catpedigree.repository;

import com.catpedigree.model.Cat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatRepository extends MongoRepository<Cat, String> {

    Optional<Cat> findByCatNo(String catNo);

    List<Cat> findByCatteryId(String catteryId);

    List<Cat> findByOwnerId(String ownerId);

    List<Cat> findByFatherIdOrMotherId(String fatherId, String motherId);

    boolean existsByCatNo(String catNo);

    List<Cat> findByBreed(String breed);

    List<Cat> findByNameContaining(String name);
}
