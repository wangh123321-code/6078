package com.catpedigree.repository;

import com.catpedigree.enums.BreedingStatus;
import com.catpedigree.model.Breeding;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BreedingRepository extends MongoRepository<Breeding, String> {

    Optional<Breeding> findByBreedingNo(String breedingNo);

    List<Breeding> findByCatteryId(String catteryId);

    List<Breeding> findByStatus(BreedingStatus status);

    List<Breeding> findByFatherIdOrMotherId(String fatherId, String motherId);

    List<Breeding> findByCatteryIdAndStatus(String catteryId, BreedingStatus status);
}
