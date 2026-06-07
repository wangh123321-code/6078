package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.dto.BreedingDTO;
import com.catpedigree.enums.BreedingStatus;
import com.catpedigree.model.Breeding;
import com.catpedigree.model.Cat;
import com.catpedigree.service.BreedingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/breedings")
@RequiredArgsConstructor
@CrossOrigin
public class BreedingController {

    private final BreedingService breedingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Breeding> createBreeding(@Valid @RequestBody BreedingDTO dto) {
        Breeding breeding = breedingService.createBreeding(dto);
        return Result.success("繁育记录创建成功", breeding);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Breeding> updateBreeding(@PathVariable String id, @Valid @RequestBody BreedingDTO dto) {
        Breeding breeding = breedingService.updateBreeding(id, dto);
        return Result.success("繁育记录更新成功", breeding);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Breeding> updateStatus(@PathVariable String id, @RequestParam BreedingStatus status) {
        Breeding breeding = breedingService.updateStatus(id, status);
        return Result.success("状态更新成功", breeding);
    }

    @PostMapping("/{id}/kittens")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Breeding> addKitten(@PathVariable String id, @RequestParam String kittenCatNo) {
        Breeding breeding = breedingService.addKitten(id, kittenCatNo);
        return Result.success("幼猫关联成功", breeding);
    }

    @GetMapping("/{id}")
    public Result<Breeding> getBreedingById(@PathVariable String id) {
        Breeding breeding = breedingService.getBreedingById(id);
        return Result.success(breeding);
    }

    @GetMapping("/no/{breedingNo}")
    public Result<Breeding> getBreedingByNo(@PathVariable String breedingNo) {
        Breeding breeding = breedingService.getBreedingByNo(breedingNo);
        return Result.success(breeding);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Page<Breeding>> getBreedings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Breeding> breedings = breedingService.getBreedings(pageable);
        return Result.success(breedings);
    }

    @GetMapping("/cattery/{catteryId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Breeding>> getBreedingsByCattery(@PathVariable String catteryId) {
        List<Breeding> breedings = breedingService.getBreedingsByCattery(catteryId);
        return Result.success(breedings);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Breeding>> getBreedingsByStatus(@PathVariable BreedingStatus status) {
        List<Breeding> breedings = breedingService.getBreedingsByStatus(status);
        return Result.success(breedings);
    }

    @GetMapping("/cat/{catId}")
    public Result<List<Breeding>> getBreedingsByCat(@PathVariable String catId) {
        List<Breeding> breedings = breedingService.getBreedingsByCat(catId);
        return Result.success(breedings);
    }

    @GetMapping("/{id}/kittens")
    public Result<List<Cat>> getKittens(@PathVariable String id) {
        List<Cat> kittens = breedingService.getKittens(id);
        return Result.success(kittens);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<Void> deleteBreeding(@PathVariable String id) {
        breedingService.deleteBreeding(id);
        return Result.success("删除成功", null);
    }
}
