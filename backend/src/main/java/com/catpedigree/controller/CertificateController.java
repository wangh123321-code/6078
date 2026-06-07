package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.model.Certificate;
import com.catpedigree.service.CertificateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/certificates")
@RequiredArgsConstructor
@CrossOrigin
public class CertificateController {

    private final CertificateService certificateService;

    @PostMapping("/cat/{catId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Certificate> generateCertificate(@PathVariable String catId) {
        Certificate certificate = certificateService.generateCertificate(catId);
        return Result.success("证书生成成功", certificate);
    }

    @GetMapping("/{certificateNo}")
    public Result<Certificate> getCertificateByNo(@PathVariable String certificateNo) {
        Certificate certificate = certificateService.getCertificateByNo(certificateNo);
        return Result.success(certificate);
    }

    @GetMapping("/cat/{catId}")
    public Result<Certificate> getCertificateByCatId(@PathVariable String catId) {
        Certificate certificate = certificateService.getCertificateByCatId(catId);
        return Result.success(certificate);
    }

    @GetMapping("/verify")
    public Result<Map<String, Object>> verifyCertificate(@RequestParam String code) {
        boolean valid = certificateService.verifyCertificate(code);
        Certificate cert = null;
        if (valid) {
            cert = certificateService.getCertificateByNo(
                    certificateService.getCertificateByNo("CERT-000")
                            .getCertificateNo()
            );
        }
        return Result.success(Map.of(
                "valid", valid,
                "code", code
        ));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Certificate>> getCertificatesByOwner(@PathVariable String ownerId) {
        List<Certificate> certificates = certificateService.getCertificatesByOwner(ownerId);
        return Result.success(certificates);
    }

    @GetMapping("/{certificateNo}/download")
    public ResponseEntity<byte[]> downloadCertificate(@PathVariable String certificateNo) {
        byte[] pdfContent = certificateService.getCertificatePdf(certificateNo);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "certificate-" + certificateNo + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}
