package com.catpedigree.service;

import com.catpedigree.model.Certificate;
import com.catpedigree.repository.CertificateRepository;
import com.catpedigree.repository.CatRepository;
import com.catpedigree.model.Cat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CatRepository catRepository;
    private final PdfService pdfService;

    @Transactional
    public Certificate generateCertificate(String catId) {
        Cat cat = catRepository.findById(catId)
                .orElseThrow(() -> new IllegalArgumentException("猫咪不存在: " + catId));

        if (certificateRepository.existsByCatId(catId)) {
            return certificateRepository.findByCatId(catId).orElseThrow();
        }

        String certificateNo = "CERT-" + System.currentTimeMillis();
        String verificationCode = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        byte[] pdfContent = pdfService.generateCertificate(cat, certificateNo, verificationCode);

        Certificate certificate = new Certificate();
        certificate.setCertificateNo(certificateNo);
        certificate.setCatId(catId);
        certificate.setCatNo(cat.getCatNo());
        certificate.setCatName(cat.getName());
        certificate.setOwnerId(cat.getOwnerId());
        certificate.setOwnerName(cat.getOwnerName());
        certificate.setIssueDate(LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")));
        certificate.setVerificationCode(verificationCode);
        certificate.setQrCodeUrl("/api/certificates/verify?code=" + verificationCode);
        certificate.setWatermark("纯种猫血统管理系统 - 区块链存证");
        certificate.setPdfContent(pdfContent);
        certificate.setVerified(true);

        return certificateRepository.save(certificate);
    }

    public Certificate getCertificateById(String id) {
        return certificateRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("证书不存在: " + id));
    }

    public Certificate getCertificateByNo(String certificateNo) {
        return certificateRepository.findByCertificateNo(certificateNo)
                .orElseThrow(() -> new IllegalArgumentException("证书不存在: " + certificateNo));
    }

    public Certificate getCertificateByCatId(String catId) {
        return certificateRepository.findByCatId(catId)
                .orElseThrow(() -> new IllegalArgumentException("该猫咪暂无证书: " + catId));
    }

    public boolean verifyCertificate(String verificationCode) {
        Certificate cert = certificateRepository.findByVerificationCode(verificationCode)
                .orElse(null);
        return cert != null && cert.getVerified();
    }

    public List<Certificate> getCertificatesByOwner(String ownerId) {
        return certificateRepository.findByOwnerId(ownerId);
    }

    public byte[] getCertificatePdf(String certificateNo) {
        Certificate cert = getCertificateByNo(certificateNo);
        return cert.getPdfContent();
    }
}
