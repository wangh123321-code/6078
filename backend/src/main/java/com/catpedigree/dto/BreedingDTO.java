package com.catpedigree.dto;

import com.catpedigree.enums.BreedingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BreedingDTO {

    private String id;

    @NotBlank(message = "父猫咪编号不能为空")
    private String fatherCatNo;

    @NotBlank(message = "母猫咪编号不能为空")
    private String motherCatNo;

    @NotNull(message = "交配日期不能为空")
    private LocalDate matingDate;

    private LocalDate expectedDueDate;

    private LocalDate actualBirthDate;

    private BreedingStatus status;

    private Integer litterSize;

    private String notes;
}
