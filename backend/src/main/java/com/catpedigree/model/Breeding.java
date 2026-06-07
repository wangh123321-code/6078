package com.catpedigree.model;

import com.catpedigree.enums.BreedingStatus;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Document(collection = "breedings")
public class Breeding {

    @Id
    private String id;

    private String breedingNo;

    private String fatherId;

    private String motherId;

    private String fatherCatNo;

    private String motherCatNo;

    private String fatherName;

    private String motherName;

    private LocalDate matingDate;

    private LocalDate expectedDueDate;

    private LocalDate actualBirthDate;

    private BreedingStatus status;

    private Integer litterSize;

    private List<String> kittenIds = new ArrayList<>();

    private String catteryId;

    private String catteryName;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
