package com.catpedigree.repository;

import com.catpedigree.model.BlockchainRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlockchainRecordRepository extends MongoRepository<BlockchainRecord, String> {

    Optional<BlockchainRecord> findByRecordHash(String recordHash);

    List<BlockchainRecord> findByCatId(String catId);

    List<BlockchainRecord> findByCatNo(String catNo);

    Optional<BlockchainRecord> findTopByOrderByBlockNumberDesc();

    boolean existsByRecordHash(String recordHash);

    boolean existsByDataHash(String dataHash);
}
