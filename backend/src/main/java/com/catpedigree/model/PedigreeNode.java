package com.catpedigree.model;

import com.catpedigree.enums.Gender;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedigreeNode {

    private String catNo;

    private String name;

    private String breed;

    private Gender gender;

    private LocalDate birthDate;

    private String color;

    private List<AwardRecord> awards;

    private String registrationNo;

    private Integer generation;

    private PedigreeNode father;

    private PedigreeNode mother;

    private Boolean hasCycle = false;

    private Boolean isInbreeding = false;

    private String cycleInfo;

    private String inbreedingInfo;

    private Integer x;

    private Integer y;

    private Double inbreedingCoefficient;
}
