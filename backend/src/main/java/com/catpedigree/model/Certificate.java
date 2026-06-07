package com.catpedigree.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "certificates")
public class Certificate {

    @Id
    private String id;

    @Indexed(unique = true)
    private String certificateNo;

    private String catId;

    private String catNo;

    private String catName;

    private String ownerId;

    private String ownerName;

    private String issueDate;

    private String qrCodeUrl;

    private String watermark;

    private String verificationCode;

    private byte[] pdfContent;

    private Boolean verified = true;

    @CreatedDate
    private LocalDateTime createdAt;
}
