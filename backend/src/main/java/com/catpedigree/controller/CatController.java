package com.catpedigree.controller;

import com.catpedigree.common.Result;
import com.catpedigree.dto.CatDTO;
import com.catpedigree.model.AwardRecord;
import com.catpedigree.model.Cat;
import com.catpedigree.model.PedigreeNode;
import com.catpedigree.service.CatService;
import com.fasterxml.jackson.core.JsonProcessingException;
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
@RequestMapping("/cats")
@RequiredArgsConstructor
@CrossOrigin
public class CatController {

    private final CatService catService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Cat> createCat(@Valid @RequestBody CatDTO dto) throws JsonProcessingException {
        Cat cat = catService.createCat(dto);
        return Result.success("猫咪注册成功", cat);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Cat> updateCat(@PathVariable String id, @Valid @RequestBody CatDTO dto) throws JsonProcessingException {
        Cat cat = catService.updateCat(id, dto);
        return Result.success("猫咪信息更新成功", cat);
    }

    @GetMapping("/{catNo}")
    public Result<Cat> getCatByNo(@PathVariable String catNo) {
        Cat cat = catService.getCatByCatNo(catNo);
        return Result.success(cat);
    }

    @GetMapping("/id/{id}")
    public Result<Cat> getCatById(@PathVariable String id) {
        Cat cat = catService.getCatById(id);
        return Result.success(cat);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Page<Cat>> getCats(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Cat> cats = catService.getCats(pageable);
        return Result.success(cats);
    }

    @GetMapping("/search")
    public Result<List<Cat>> searchCats(@RequestParam String keyword) {
        List<Cat> cats = catService.searchCats(keyword);
        return Result.success(cats);
    }

    @GetMapping("/pedigree/{catNo}")
    public Result<PedigreeNode> getPedigreeTree(
            @PathVariable String catNo,
            @RequestParam(defaultValue = "5") int generations) {
        PedigreeNode pedigree = catService.getPedigreeTree(catNo, generations);
        return Result.success(pedigree);
    }

    @GetMapping("/cattery/{catteryId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Cat>> getCatsByCattery(@PathVariable String catteryId) {
        List<Cat> cats = catService.getCatsByCattery(catteryId);
        return Result.success(cats);
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<List<Cat>> getCatsByOwner(@PathVariable String ownerId) {
        List<Cat> cats = catService.getCatsByOwner(ownerId);
        return Result.success(cats);
    }

    @GetMapping("/{id}/offspring")
    public Result<List<Cat>> getOffspring(@PathVariable String id) {
        List<Cat> offspring = catService.getOffspring(id);
        return Result.success(offspring);
    }

    @PostMapping("/{id}/awards")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CATTERY_ADMIN')")
    public Result<Cat> addAward(@PathVariable String id, @RequestBody AwardRecord award) {
        Cat cat = catService.addAward(id, award);
        return Result.success("获奖记录添加成功", cat);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public Result<Void> deleteCat(@PathVariable String id) {
        catService.deleteCat(id);
        return Result.success("删除成功", null);
    }
}
