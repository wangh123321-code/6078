package com.catpedigree.service;

import com.catpedigree.dto.CatDTO;
import com.catpedigree.model.AwardRecord;
import com.catpedigree.model.Cat;
import com.catpedigree.model.PedigreeNode;
import com.catpedigree.repository.CatRepository;
import com.catpedigree.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatService {

    private final CatRepository catRepository;
    private final UserRepository userRepository;
    private final BlockchainService blockchainService;

    @Transactional
    public Cat createCat(CatDTO dto) throws JsonProcessingException {
        if (catRepository.existsByCatNo(dto.getCatNo())) {
            throw new IllegalArgumentException("猫咪编号已存在: " + dto.getCatNo());
        }

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("用户信息不存在，请重新登录"));

        Cat cat = new Cat();
        BeanUtils.copyProperties(dto, cat);

        if (dto.getFatherCatNo() != null && !dto.getFatherCatNo().isEmpty()) {
            Cat father = catRepository.findByCatNo(dto.getFatherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("父猫编号不存在: " + dto.getFatherCatNo()));
            cat.setFatherId(father.getId());
        }

        if (dto.getMotherCatNo() != null && !dto.getMotherCatNo().isEmpty()) {
            Cat mother = catRepository.findByCatNo(dto.getMotherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("母猫编号不存在: " + dto.getMotherCatNo()));
            cat.setMotherId(mother.getId());
        }

        cat.setOwnerId(currentUserId);
        cat.setOwnerName(currentUser.getRealName());
        cat.setCatteryId(currentUser.getCatteryId());
        cat.setCatteryName(currentUser.getCatteryName());
        cat.setRegistrationNo("REG-" + System.currentTimeMillis());

        Cat saved = catRepository.save(cat);

        blockchainService.recordOnChain(saved, currentUserId, currentUser.getRealName());

        return saved;
    }

    @Transactional
    public Cat updateCat(String id, CatDTO dto) throws JsonProcessingException {
        Cat cat = catRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("猫咪不存在: " + id));

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("用户信息不存在，请重新登录"));

        BeanUtils.copyProperties(dto, cat, "id", "catNo");

        if (dto.getFatherCatNo() != null && !dto.getFatherCatNo().isEmpty()) {
            Cat father = catRepository.findByCatNo(dto.getFatherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("父猫编号不存在: " + dto.getFatherCatNo()));
            cat.setFatherId(father.getId());
        }

        if (dto.getMotherCatNo() != null && !dto.getMotherCatNo().isEmpty()) {
            Cat mother = catRepository.findByCatNo(dto.getMotherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("母猫编号不存在: " + dto.getMotherCatNo()));
            cat.setMotherId(mother.getId());
        }

        Cat updated = catRepository.save(cat);

        blockchainService.recordOnChain(updated, currentUserId, currentUser.getRealName());

        return updated;
    }

    public Cat getCatById(String id) {
        return catRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("猫咪不存在: " + id));
    }

    public Cat getCatByCatNo(String catNo) {
        return catRepository.findByCatNo(catNo)
                .orElseThrow(() -> new IllegalArgumentException("猫咪不存在: " + catNo));
    }

    public Page<Cat> getCats(Pageable pageable) {
        return catRepository.findAll(pageable);
    }

    public List<Cat> getCatsByCattery(String catteryId) {
        return catRepository.findByCatteryId(catteryId);
    }

    public List<Cat> getCatsByOwner(String ownerId) {
        return catRepository.findByOwnerId(ownerId);
    }

    public List<Cat> getOffspring(String catId) {
        return catRepository.findByFatherIdOrMotherId(catId, catId);
    }

    public PedigreeNode getPedigreeTree(String catNo, int maxGeneration) {
        Cat cat = getCatByCatNo(catNo);
        return buildPedigreeTree(cat, 1, maxGeneration);
    }

    private PedigreeNode buildPedigreeTree(Cat cat, int currentGen, int maxGen) {
        PedigreeNode node = new PedigreeNode();
        node.setCatNo(cat.getCatNo());
        node.setName(cat.getName());
        node.setBreed(cat.getBreed());
        node.setGender(cat.getGender());
        node.setBirthDate(cat.getBirthDate());
        node.setColor(cat.getColor());
        node.setAwards(cat.getAwards());
        node.setRegistrationNo(cat.getRegistrationNo());
        node.setGeneration(currentGen);

        if (currentGen < maxGen) {
            if (cat.getFatherId() != null) {
                catRepository.findById(cat.getFatherId()).ifPresent(father ->
                        node.setFather(buildPedigreeTree(father, currentGen + 1, maxGen))
                );
            }
            if (cat.getMotherId() != null) {
                catRepository.findById(cat.getMotherId()).ifPresent(mother ->
                        node.setMother(buildPedigreeTree(mother, currentGen + 1, maxGen))
                );
            }
        }

        return node;
    }

    @Transactional
    public Cat addAward(String catId, AwardRecord award) {
        Cat cat = getCatById(catId);
        cat.getAwards().add(award);
        return catRepository.save(cat);
    }

    public void deleteCat(String id) {
        catRepository.deleteById(id);
    }

    public List<Cat> searchCats(String keyword) {
        return catRepository.findByNameContaining(keyword);
    }
}
