package com.catpedigree.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "blockchain_records")
public class BlockchainRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    private String recordHash;

    private String catId;

    private String catNo;

    private String previousHash;

    private String dataHash;

    private long timestamp;

    private int blockNumber;

    private String merkleRoot;

    private String transactionHash;

    private String operationType;

    private String operatorId;

    private String operatorName;

    private String dataSnapshot;

    @CreatedDate
    private LocalDateTime createdAt;
}
