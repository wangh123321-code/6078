package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.model.Cat;
import com.catpedigree.service.ExcelService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/excel")
@RequiredArgsConstructor
@CrossOrigin
public class ExcelController {

    private final ExcelService excelService;

    @PostMapping("/import")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Cat>> importCats(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return Result.error("请选择要上传的文件");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || (!originalFilename.endsWith(".xlsx") && !originalFilename.endsWith(".xls"))) {
            return Result.error("请上传Excel文件(.xlsx或.xls格式)");
        }

        List<Cat> imported = excelService.importCats(file);
        return Result.success("成功导入 " + imported.size() + " 条猫咪数据", imported);
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public ResponseEntity<byte[]> exportCats(
            @RequestParam(required = false) List<String> catIds) throws IOException {

        byte[] excelData = excelService.exportCats(catIds);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "cats-export.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(excelData);
    }

    @GetMapping("/template")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] templateData = excelService.exportTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "cats-import-template.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .body(templateData);
    }
}
