package com.catpedigree.repository;

import com.catpedigree.model.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificateRepository extends MongoRepository<Certificate, String> {

    Optional<Certificate> findByCertificateNo(String certificateNo);

    Optional<Certificate> findByCatId(String catId);

    List<Certificate> findByOwnerId(String ownerId);

    Optional<Certificate> findByVerificationCode(String verificationCode);

    boolean existsByCatId(String catId);
}
