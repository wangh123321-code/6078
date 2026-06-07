package com.catpedigree.dto;

import com.catpedigree.enums.Gender;
import com.catpedigree.model.AwardRecord;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class CatDTO {

    private String id;

    @NotBlank(message = "猫咪编号不能为空")
    private String catNo;

    @NotBlank(message = "猫咪名称不能为空")
    private String name;

    @NotBlank(message = "品种不能为空")
    private String breed;

    @NotNull(message = "性别不能为空")
    private Gender gender;

    @NotNull(message = "出生日期不能为空")
    private LocalDate birthDate;

    private String color;

    private String eyeColor;

    private String coatPattern;

    private String microchipNo;

    private String fatherCatNo;

    private String motherCatNo;

    private String registrationNo;

    private LocalDate registrationDate;

    private String notes;

    private List<AwardRecord> awards = new ArrayList<>();
}
