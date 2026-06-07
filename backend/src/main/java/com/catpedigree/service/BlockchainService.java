package com.catpedigree.service;

import com.catpedigree.model.BlockchainRecord;
import com.catpedigree.model.Cat;
import com.catpedigree.repository.BlockchainRecordRepository;
import com.catpedigree.repository.CatRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BlockchainService {

    private final BlockchainRecordRepository blockchainRecordRepository;
    private final CatRepository catRepository;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .setDateFormat(new java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss"));

    public String calculateDataHash(Object data) throws JsonProcessingException {
        String json = objectMapper.writeValueAsString(data);
        return DigestUtils.sha256Hex(json);
    }

    public String calculateBlockHash(String previousHash, String dataHash, long timestamp) {
        String input = previousHash + dataHash + timestamp;
        return DigestUtils.sha256Hex(input);
    }

    @Async
    public void recordOnChain(Cat cat, String operatorId, String operatorName) throws JsonProcessingException {
        String dataHash = calculateDataHash(cat);

        BlockchainRecord lastRecord = blockchainRecordRepository.findTopByOrderByBlockNumberDesc()
                .orElse(null);

        String previousHash = lastRecord != null ? lastRecord.getRecordHash() : "0";
        int blockNumber = lastRecord != null ? lastRecord.getBlockNumber() + 1 : 1;
        long timestamp = System.currentTimeMillis();

        String recordHash = calculateBlockHash(previousHash, dataHash, timestamp);
        String transactionHash = generateTransactionHash(cat.getCatNo(), timestamp);

        BlockchainRecord record = new BlockchainRecord();
        record.setRecordHash(recordHash);
        record.setCatId(cat.getId());
        record.setCatNo(cat.getCatNo());
        record.setPreviousHash(previousHash);
        record.setDataHash(dataHash);
        record.setTimestamp(timestamp);
        record.setBlockNumber(blockNumber);
        record.setMerkleRoot(dataHash);
        record.setTransactionHash(transactionHash);
        record.setOperationType("CREATE/UPDATE");
        record.setOperatorId(operatorId);
        record.setOperatorName(operatorName);
        record.setDataSnapshot(objectMapper.writeValueAsString(cat));

        blockchainRecordRepository.save(record);

        cat.setBlockchainHash(recordHash);
        cat.setTransactionHash(transactionHash);
        cat.setOnChain(true);
        cat.setOnChainTime(LocalDateTime.now());
        catRepository.save(cat);

        log.info("猫咪 {} 已上链，区块号: {}, 哈希: {}", cat.getCatNo(), blockNumber, recordHash);
    }

    private String generateTransactionHash(String catNo, long timestamp) {
        String input = catNo + timestamp + Math.random();
        return DigestUtils.sha256Hex(input).substring(0, 16);
    }

    public boolean verifyCatIntegrity(String catNo) throws JsonProcessingException {
        Cat cat = catRepository.findByCatNo(catNo)
                .orElseThrow(() -> new IllegalArgumentException("猫咪不存在: " + catNo));

        if (!cat.getOnChain()) {
            return false;
        }

        String currentDataHash = calculateDataHash(cat);
        List<BlockchainRecord> records = blockchainRecordRepository.findByCatNo(catNo);

        for (BlockchainRecord record : records) {
            if (record.getDataHash().equals(currentDataHash)) {
                return verifyBlockchain(record);
            }
        }

        return false;
    }

    private boolean verifyBlockchain(BlockchainRecord record) {
        if (record.getBlockNumber() == 1) {
            return record.getPreviousHash().equals("0");
        }

        BlockchainRecord prevRecord = blockchainRecordRepository
                .findByRecordHash(record.getPreviousHash())
                .orElse(null);

        if (prevRecord == null) {
            return false;
        }

        String recalculatedHash = calculateBlockHash(
                record.getPreviousHash(),
                record.getDataHash(),
                record.getTimestamp()
        );

        return recalculatedHash.equals(record.getRecordHash());
    }

    public List<BlockchainRecord> getCatChainRecords(String catNo) {
        return blockchainRecordRepository.findByCatNo(catNo);
    }

    public BlockchainRecord getLatestBlock() {
        return blockchainRecordRepository.findTopByOrderByBlockNumberDesc().orElse(null);
    }
}
