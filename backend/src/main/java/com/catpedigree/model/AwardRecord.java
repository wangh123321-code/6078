package com.catpedigree.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwardRecord {

    private String awardName;

    private String competitionName;

    private LocalDate awardDate;

    private String rank;

    private String notes;
}
