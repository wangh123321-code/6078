package com.catpedigree.service;

import com.catpedigree.dto.BreedingDTO;
import com.catpedigree.enums.BreedingStatus;
import com.catpedigree.model.Breeding;
import com.catpedigree.model.Cat;
import com.catpedigree.repository.BreedingRepository;
import com.catpedigree.repository.CatRepository;
import com.catpedigree.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BreedingService {

    private final BreedingRepository breedingRepository;
    private final CatRepository catRepository;
    private final UserRepository userRepository;

    @Transactional
    public Breeding createBreeding(BreedingDTO dto) {
        Cat father = catRepository.findByCatNo(dto.getFatherCatNo())
                .orElseThrow(() -> new IllegalArgumentException("父猫不存在: " + dto.getFatherCatNo()));

        Cat mother = catRepository.findByCatNo(dto.getMotherCatNo())
                .orElseThrow(() -> new IllegalArgumentException("母猫不存在: " + dto.getMotherCatNo()));

        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        var currentUser = userRepository.findById(currentUserId).orElseThrow();

        Breeding breeding = new Breeding();
        breeding.setBreedingNo("BREED-" + System.currentTimeMillis());
        breeding.setFatherId(father.getId());
        breeding.setMotherId(mother.getId());
        breeding.setFatherCatNo(father.getCatNo());
        breeding.setMotherCatNo(mother.getCatNo());
        breeding.setFatherName(father.getName());
        breeding.setMotherName(mother.getName());
        breeding.setMatingDate(dto.getMatingDate());
        breeding.setExpectedDueDate(dto.getMatingDate() != null ? dto.getMatingDate().plusDays(65) : null);
        breeding.setStatus(dto.getStatus() != null ? dto.getStatus() : BreedingStatus.MATED);
        breeding.setNotes(dto.getNotes());
        breeding.setCatteryId(currentUser.getCatteryId());
        breeding.setCatteryName(currentUser.getCatteryName());

        return breedingRepository.save(breeding);
    }

    @Transactional
    public Breeding updateBreeding(String id, BreedingDTO dto) {
        Breeding breeding = breedingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("繁育记录不存在: " + id));

        if (dto.getFatherCatNo() != null && !dto.getFatherCatNo().equals(breeding.getFatherCatNo())) {
            Cat father = catRepository.findByCatNo(dto.getFatherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("父猫不存在: " + dto.getFatherCatNo()));
            breeding.setFatherId(father.getId());
            breeding.setFatherCatNo(father.getCatNo());
            breeding.setFatherName(father.getName());
        }

        if (dto.getMotherCatNo() != null && !dto.getMotherCatNo().equals(breeding.getMotherCatNo())) {
            Cat mother = catRepository.findByCatNo(dto.getMotherCatNo())
                    .orElseThrow(() -> new IllegalArgumentException("母猫不存在: " + dto.getMotherCatNo()));
            breeding.setMotherId(mother.getId());
            breeding.setMotherCatNo(mother.getCatNo());
            breeding.setMotherName(mother.getName());
        }

        if (dto.getMatingDate() != null) {
            breeding.setMatingDate(dto.getMatingDate());
            breeding.setExpectedDueDate(dto.getMatingDate().plusDays(65));
        }

        if (dto.getStatus() != null) {
            breeding.setStatus(dto.getStatus());
        }

        if (dto.getActualBirthDate() != null) {
            breeding.setActualBirthDate(dto.getActualBirthDate());
        }

        if (dto.getLitterSize() != null) {
            breeding.setLitterSize(dto.getLitterSize());
        }

        if (dto.getNotes() != null) {
            breeding.setNotes(dto.getNotes());
        }

        return breedingRepository.save(breeding);
    }

    @Transactional
    public Breeding updateStatus(String id, BreedingStatus status) {
        Breeding breeding = breedingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("繁育记录不存在: " + id));
        breeding.setStatus(status);

        if (status == BreedingStatus.BORN && breeding.getActualBirthDate() == null) {
            breeding.setActualBirthDate(LocalDate.now());
        }

        return breedingRepository.save(breeding);
    }

    @Transactional
    public Breeding addKitten(String breedingId, String kittenCatNo) {
        Breeding breeding = breedingRepository.findById(breedingId)
                .orElseThrow(() -> new IllegalArgumentException("繁育记录不存在: " + breedingId));

        Cat kitten = catRepository.findByCatNo(kittenCatNo)
                .orElseThrow(() -> new IllegalArgumentException("幼猫不存在: " + kittenCatNo));

        kitten.setFatherId(breeding.getFatherId());
        kitten.setMotherId(breeding.getMotherId());
        kitten.setFatherCatNo(breeding.getFatherCatNo());
        kitten.setMotherCatNo(breeding.getMotherCatNo());
        catRepository.save(kitten);

        if (!breeding.getKittenIds().contains(kitten.getId())) {
            breeding.getKittenIds().add(kitten.getId());
        }

        breeding.setLitterSize(breeding.getKittenIds().size());
        breeding.setStatus(BreedingStatus.BORN);

        if (breeding.getActualBirthDate() == null) {
            breeding.setActualBirthDate(LocalDate.now());
        }

        return breedingRepository.save(breeding);
    }

    public Breeding getBreedingById(String id) {
        return breedingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("繁育记录不存在: " + id));
    }

    public Breeding getBreedingByNo(String breedingNo) {
        return breedingRepository.findByBreedingNo(breedingNo)
                .orElseThrow(() -> new IllegalArgumentException("繁育记录不存在: " + breedingNo));
    }

    public Page<Breeding> getBreedings(Pageable pageable) {
        return breedingRepository.findAll(pageable);
    }

    public List<Breeding> getBreedingsByCattery(String catteryId) {
        return breedingRepository.findByCatteryId(catteryId);
    }

    public List<Breeding> getBreedingsByStatus(BreedingStatus status) {
        return breedingRepository.findByStatus(status);
    }

    public List<Breeding> getBreedingsByCat(String catId) {
        return breedingRepository.findByFatherIdOrMotherId(catId, catId);
    }

    public List<Cat> getKittens(String breedingId) {
        Breeding breeding = getBreedingById(breedingId);
        return breeding.getKittenIds().stream()
                .map(catRepository::findById)
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .toList();
    }

    public void deleteBreeding(String id) {
        breedingRepository.deleteById(id);
    }
}
