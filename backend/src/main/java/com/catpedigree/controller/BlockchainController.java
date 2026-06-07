package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.model.BlockchainRecord;
import com.catpedigree.service.BlockchainService;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/blockchain")
@RequiredArgsConstructor
@CrossOrigin
public class BlockchainController {

    private final BlockchainService blockchainService;

    @GetMapping("/verify/{catNo}")
    public Result<Map<String, Object>> verifyCat(@PathVariable String catNo) throws JsonProcessingException {
        boolean valid = blockchainService.verifyCatIntegrity(catNo);
        List<BlockchainRecord> records = blockchainService.getCatChainRecords(catNo);

        return Result.success(Map.of(
                "valid", valid,
                "catNo", catNo,
                "records", records
        ));
    }

    @GetMapping("/cat/{catNo}")
    public Result<List<BlockchainRecord>> getCatChainRecords(@PathVariable String catNo) {
        List<BlockchainRecord> records = blockchainService.getCatChainRecords(catNo);
        return Result.success(records);
    }

    @GetMapping("/latest")
    public Result<BlockchainRecord> getLatestBlock() {
        BlockchainRecord latest = blockchainService.getLatestBlock();
        return Result.success(latest);
    }

    @GetMapping("/hash/{data}")
    public Result<Map<String, String>> calculateHash(@PathVariable String data) {
        String hash = org.apache.commons.codec.digest.DigestUtils.sha256Hex(data);
        return Result.success(Map.of(
                "data", data,
                "sha256", hash
        ));
    }
}
