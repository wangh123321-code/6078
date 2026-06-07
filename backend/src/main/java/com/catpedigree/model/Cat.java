package com.catpedigree.model;

import com.catpedigree.enums.Gender;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "cats")
public class Cat {

    @Id
    private String id;

    @Indexed(unique = true)
    private String catNo;

    private String name;

    private String breed;

    private Gender gender;

    private LocalDate birthDate;

    private String color;

    private String eyeColor;

    private String coatPattern;

    private String microchipNo;

    private String fatherId;

    private String motherId;

    private String fatherCatNo;

    private String motherCatNo;

    private String ownerId;

    private String ownerName;

    private String catteryId;

    private String catteryName;

    private String registrationNo;

    private LocalDate registrationDate;

    private String notes;

    private String blockchainHash;

    private String transactionHash;

    private Boolean onChain = false;

    private LocalDateTime onChainTime;

    private List<AwardRecord> awards = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
