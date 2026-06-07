package com.catpedigree.service;

import com.catpedigree.enums.Gender;
import com.catpedigree.model.AwardRecord;
import com.catpedigree.model.Cat;
import com.catpedigree.repository.CatRepository;
import com.catpedigree.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExcelService {

    private final CatRepository catRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional
    public List<Cat> importCats(MultipartFile file) throws IOException {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findById(currentUserId).orElseThrow();

        List<Cat> importedCats = new ArrayList<>();

        try (InputStream is = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);

            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    Cat cat = parseCatRow(row);
                    cat.setOwnerId(currentUserId);
                    cat.setOwnerName(currentUser.getRealName());
                    cat.setCatteryId(currentUser.getCatteryId());
                    cat.setCatteryName(currentUser.getCatteryName());

                    if (!catRepository.existsByCatNo(cat.getCatNo())) {
                        Cat saved = catRepository.save(cat);
                        blockchainService.recordOnChain(saved, currentUserId, currentUser.getRealName());
                        importedCats.add(saved);
                    } else {
                        log.warn("猫咪编号已存在，跳过: {}", cat.getCatNo());
                    }
                } catch (Exception e) {
                    log.error("解析第{}行数据失败: {}", i + 1, e.getMessage());
                }
            }
        }

        return importedCats;
    }

    private Cat parseCatRow(Row row) {
        Cat cat = new Cat();

        cat.setCatNo(getCellStringValue(row.getCell(0)));
        cat.setName(getCellStringValue(row.getCell(1)));
        cat.setBreed(getCellStringValue(row.getCell(2)));

        String genderStr = getCellStringValue(row.getCell(3));
        if ("公".equals(genderStr) || "MALE".equals(genderStr)) {
            cat.setGender(Gender.MALE);
        } else if ("母".equals(genderStr) || "FEMALE".equals(genderStr)) {
            cat.setGender(Gender.FEMALE);
        }

        String birthDateStr = getCellStringValue(row.getCell(4));
        if (birthDateStr != null && !birthDateStr.isEmpty()) {
            cat.setBirthDate(LocalDate.parse(birthDateStr, DATE_FORMATTER));
        }

        cat.setColor(getCellStringValue(row.getCell(5)));
        cat.setEyeColor(getCellStringValue(row.getCell(6)));
        cat.setCoatPattern(getCellStringValue(row.getCell(7)));
        cat.setMicrochipNo(getCellStringValue(row.getCell(8)));
        cat.setFatherCatNo(getCellStringValue(row.getCell(9)));
        cat.setMotherCatNo(getCellStringValue(row.getCell(10)));
        cat.setRegistrationNo(getCellStringValue(row.getCell(11)));

        String regDateStr = getCellStringValue(row.getCell(12));
        if (regDateStr != null && !regDateStr.isEmpty()) {
            cat.setRegistrationDate(LocalDate.parse(regDateStr, DATE_FORMATTER));
        }

        cat.setNotes(getCellStringValue(row.getCell(13)));

        return cat;
    }

    private String getCellStringValue(Cell cell) {
        if (cell == null) return null;
        cell.setCellType(CellType.STRING);
        return cell.getStringCellValue().trim();
    }

    public byte[] exportCats(List<String> catIds) throws IOException {
        List<Cat> cats;
        if (catIds == null || catIds.isEmpty()) {
            cats = catRepository.findAll();
        } else {
            cats = catRepository.findAllById(catIds);
        }

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("猫咪信息");

            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"猫咪编号", "名称", "品种", "性别", "出生日期", "毛色", "眼色",
                    "被毛图案", "芯片号", "父亲编号", "母亲编号", "注册编号", "注册日期", "备注", "区块链哈希"};

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowNum = 1;
            for (Cat cat : cats) {
                Row row = sheet.createRow(rowNum++);

                row.createCell(0).setCellValue(cat.getCatNo() != null ? cat.getCatNo() : "");
                row.createCell(1).setCellValue(cat.getName() != null ? cat.getName() : "");
                row.createCell(2).setCellValue(cat.getBreed() != null ? cat.getBreed() : "");
                row.createCell(3).setCellValue(cat.getGender() != null ? (cat.getGender() == Gender.MALE ? "公" : "母") : "");
                row.createCell(4).setCellValue(cat.getBirthDate() != null ? cat.getBirthDate().format(DATE_FORMATTER) : "");
                row.createCell(5).setCellValue(cat.getColor() != null ? cat.getColor() : "");
                row.createCell(6).setCellValue(cat.getEyeColor() != null ? cat.getEyeColor() : "");
                row.createCell(7).setCellValue(cat.getCoatPattern() != null ? cat.getCoatPattern() : "");
                row.createCell(8).setCellValue(cat.getMicrochipNo() != null ? cat.getMicrochipNo() : "");
                row.createCell(9).setCellValue(cat.getFatherCatNo() != null ? cat.getFatherCatNo() : "");
                row.createCell(10).setCellValue(cat.getMotherCatNo() != null ? cat.getMotherCatNo() : "");
                row.createCell(11).setCellValue(cat.getRegistrationNo() != null ? cat.getRegistrationNo() : "");
                row.createCell(12).setCellValue(cat.getRegistrationDate() != null ? cat.getRegistrationDate().format(DATE_FORMATTER) : "");
                row.createCell(13).setCellValue(cat.getNotes() != null ? cat.getNotes() : "");
                row.createCell(14).setCellValue(cat.getBlockchainHash() != null ? cat.getBlockchainHash() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    public byte[] exportTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {

            Sheet sheet = workbook.createSheet("猫咪信息导入模板");

            CellStyle headerStyle = createHeaderStyle(workbook);
            String[] headers = {"猫咪编号*", "名称*", "品种*", "性别(公/母)*", "出生日期(yyyy-MM-dd)*",
                    "毛色", "眼色", "被毛图案", "芯片号", "父亲编号", "母亲编号",
                    "注册编号", "注册日期(yyyy-MM-dd)", "备注"};

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.setColumnWidth(i, 20 * 256);
            }

            Row exampleRow = sheet.createRow(1);
            exampleRow.createCell(0).setCellValue("CAT001");
            exampleRow.createCell(1).setCellValue("小白");
            exampleRow.createCell(2).setCellValue("英国短毛猫");
            exampleRow.createCell(3).setCellValue("公");
            exampleRow.createCell(4).setCellValue("2023-01-15");
            exampleRow.createCell(5).setCellValue("白色");
            exampleRow.createCell(6).setCellValue("蓝色");
            exampleRow.createCell(7).setCellValue("纯色");
            exampleRow.createCell(8).setCellValue("156000123456789");
            exampleRow.createCell(9).setCellValue("CAT000");
            exampleRow.createCell(10).setCellValue("CAT002");
            exampleRow.createCell(11).setCellValue("REG2023001");
            exampleRow.createCell(12).setCellValue("2023-03-01");
            exampleRow.createCell(13).setCellValue("示例数据");

            CellStyle exampleStyle = workbook.createCellStyle();
            Font exampleFont = workbook.createFont();
            exampleFont.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            exampleStyle.setFont(exampleFont);
            for (int i = 0; i < headers.length; i++) {
                exampleRow.getCell(i).setCellStyle(exampleStyle);
            }

            workbook.write(baos);
            return baos.toByteArray();
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}
