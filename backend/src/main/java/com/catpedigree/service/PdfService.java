package com.catpedigree.service;

import com.catpedigree.model.Cat;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.EncodeHintType;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

import javax.imageio.ImageIO;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfService {

    public byte[] generateCertificate(Cat cat, String certificateNo, String verificationCode) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter writer = PdfWriter.getInstance(document, baos);

            document.open();

            addWatermark(writer);

            Font titleFont = new Font(Font.FontFamily.HELVETICA, 24, Font.BOLD, BaseColor.BLACK);
            Font subtitleFont = new Font(Font.FontFamily.HELVETICA, 14, Font.NORMAL, BaseColor.DARK_GRAY);
            Font normalFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, BaseColor.BLACK);
            Font labelFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.BLACK);

            Paragraph title = new Paragraph("纯种猫血统证书", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Paragraph certNo = new Paragraph("证书编号: " + certificateNo, subtitleFont);
            certNo.setAlignment(Element.ALIGN_CENTER);
            certNo.setSpacingAfter(30);
            document.add(certNo);

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingAfter(20);

            addTableRow(table, "猫咪编号", cat.getCatNo(), labelFont, normalFont);
            addTableRow(table, "猫咪名称", cat.getName(), labelFont, normalFont);
            addTableRow(table, "品种", cat.getBreed(), labelFont, normalFont);
            addTableRow(table, "性别", cat.getGender() == null ? "" : (cat.getGender().name().equals("MALE") ? "公" : "母"), labelFont, normalFont);
            addTableRow(table, "出生日期", cat.getBirthDate() != null ? cat.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日")) : "", labelFont, normalFont);
            addTableRow(table, "毛色", cat.getColor() != null ? cat.getColor() : "", labelFont, normalFont);
            addTableRow(table, "眼色", cat.getEyeColor() != null ? cat.getEyeColor() : "", labelFont, normalFont);
            addTableRow(table, "芯片编号", cat.getMicrochipNo() != null ? cat.getMicrochipNo() : "", labelFont, normalFont);
            addTableRow(table, "注册编号", cat.getRegistrationNo() != null ? cat.getRegistrationNo() : "", labelFont, normalFont);
            addTableRow(table, "猫主人", cat.getOwnerName() != null ? cat.getOwnerName() : "", labelFont, normalFont);
            addTableRow(table, "所属猫舍", cat.getCatteryName() != null ? cat.getCatteryName() : "", labelFont, normalFont);

            if (cat.getFatherCatNo() != null || cat.getMotherCatNo() != null) {
                addTableRow(table, "父亲编号", cat.getFatherCatNo() != null ? cat.getFatherCatNo() : "", labelFont, normalFont);
                addTableRow(table, "母亲编号", cat.getMotherCatNo() != null ? cat.getMotherCatNo() : "", labelFont, normalFont);
            }

            document.add(table);

            if (cat.getAwards() != null && !cat.getAwards().isEmpty()) {
                Paragraph awardTitle = new Paragraph("获奖记录", labelFont);
                awardTitle.setSpacingBefore(10);
                awardTitle.setSpacingAfter(10);
                document.add(awardTitle);

                PdfPTable awardTable = new PdfPTable(4);
                awardTable.setWidthPercentage(100);
                awardTable.addCell(new Phrase("赛事名称", labelFont));
                awardTable.addCell(new Phrase("奖项名称", labelFont));
                awardTable.addCell(new Phrase("获奖日期", labelFont));
                awardTable.addCell(new Phrase("名次", labelFont));

                for (var award : cat.getAwards()) {
                    awardTable.addCell(new Phrase(award.getCompetitionName() != null ? award.getCompetitionName() : "", normalFont));
                    awardTable.addCell(new Phrase(award.getAwardName() != null ? award.getAwardName() : "", normalFont));
                    awardTable.addCell(new Phrase(award.getAwardDate() != null ? award.getAwardDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) : "", normalFont));
                    awardTable.addCell(new Phrase(award.getRank() != null ? award.getRank() : "", normalFont));
                }
                document.add(awardTable);
            }

            if (cat.getBlockchainHash() != null) {
                Paragraph chainTitle = new Paragraph("区块链存证信息", labelFont);
                chainTitle.setSpacingBefore(20);
                chainTitle.setSpacingAfter(10);
                document.add(chainTitle);

                Paragraph hashPara = new Paragraph("区块哈希: " + cat.getBlockchainHash(), normalFont);
                hashPara.setSpacingAfter(5);
                document.add(hashPara);

                if (cat.getTransactionHash() != null) {
                    Paragraph txPara = new Paragraph("交易哈希: " + cat.getTransactionHash(), normalFont);
                    txPara.setSpacingAfter(5);
                    document.add(txPara);
                }

                if (cat.getOnChainTime() != null) {
                    Paragraph timePara = new Paragraph("上链时间: " + cat.getOnChainTime().format(DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss")), normalFont);
                    timePara.setSpacingAfter(10);
                    document.add(timePara);
                }
            }

            Image qrCode = generateQRCode(verificationCode, 100, 100);
            if (qrCode != null) {
                qrCode.setAbsolutePosition(400, 100);
                document.add(qrCode);

                Paragraph qrText = new Paragraph("扫码验证真伪", subtitleFont);
                qrText.setAlignment(Element.ALIGN_RIGHT);
                qrText.setSpacingBefore(5);
                document.add(qrText);
            }

            Paragraph verifyCode = new Paragraph("验证码: " + verificationCode, subtitleFont);
            verifyCode.setAlignment(Element.ALIGN_RIGHT);
            verifyCode.setSpacingBefore(5);
            document.add(verifyCode);

            Paragraph footer = new Paragraph("本证书由纯种猫协会区块链存证系统自动生成，数据不可篡改。", subtitleFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            footer.setSpacingBefore(30);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("生成证书失败", e);
            throw new RuntimeException("生成证书失败: " + e.getMessage());
        }
    }

    private void addWatermark(PdfWriter writer) {
        try {
            PdfContentByte canvas = writer.getDirectContentUnder();
            Phrase watermark = new Phrase("纯种猫血统管理系统 区块链存证",
                    new Font(Font.FontFamily.HELVETICA, 40, Font.BOLD, new BaseColor(200, 200, 200, 50)));

            for (int i = 0; i < 5; i++) {
                for (int j = 0; j < 4; j++) {
                    ColumnText.showTextAligned(canvas, Element.ALIGN_CENTER, watermark,
                            100 + i * 150, 100 + j * 200, 30);
                }
            }
        } catch (Exception e) {
            log.warn("添加水印失败", e);
        }
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(8);
        labelCell.setBackgroundColor(new BaseColor(245, 245, 245));
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(8);
        table.addCell(valueCell);
    }

    private Image generateQRCode(String content, int width, int height) {
        try {
            Map<EncodeHintType, Object> hints = new HashMap<>();
            hints.put(EncodeHintType.CHARACTER_SET, "UTF-8");
            hints.put(EncodeHintType.MARGIN, 1);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(content, BarcodeFormat.QR_CODE, width, height, hints);

            BufferedImage bufferedImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(bufferedImage, "png", baos);

            return Image.getInstance(baos.toByteArray());
        } catch (Exception e) {
            log.error("生成二维码失败", e);
            return null;
        }
    }
}
