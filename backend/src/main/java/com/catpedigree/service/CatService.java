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
import java.util.*;

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
        return buildPedigreeTreeBFS(cat, maxGeneration);
    }

    private PedigreeNode buildPedigreeTreeBFS(Cat rootCat, int maxGeneration) {
        Map<String, PedigreeNode> nodeCache = new HashMap<>();
        Set<String> visited = new HashSet<>();
        Set<String> inPath = new HashSet<>();
        List<String> cycleInfos = new ArrayList<>();
        List<String> inbreedingInfos = new ArrayList<>();

        PedigreeNode rootNode = createPedigreeNode(rootCat, 1);
        nodeCache.put(rootCat.getCatNo(), rootNode);

        Queue<BuildContext> queue = new LinkedList<>();
        queue.offer(new BuildContext(rootCat, rootNode, 1, new ArrayList<>()));

        while (!queue.isEmpty()) {
            BuildContext context = queue.poll();
            Cat currentCat = context.cat;
            PedigreeNode currentNode = context.node;
            int currentGen = context.generation;
            List<String> path = context.path;

            if (currentGen >= maxGeneration) continue;

            String catKey = currentCat.getCatNo();
            if (visited.contains(catKey)) {
                continue;
            }

            visited.add(catKey);
            List<String> newPath = new ArrayList<>(path);
            newPath.add(catKey);

            if (currentCat.getFatherId() != null) {
                Optional<Cat> fatherOpt = catRepository.findById(currentCat.getFatherId());
                if (fatherOpt.isPresent()) {
                    Cat father = fatherOpt.get();
                    PedigreeNode fatherNode = processParent(
                            father, currentGen + 1, maxGeneration, nodeCache,
                            visited, inPath, newPath, queue, cycleInfos, inbreedingInfos
                    );
                    currentNode.setFather(fatherNode);
                }
            }

            if (currentCat.getMotherId() != null) {
                Optional<Cat> motherOpt = catRepository.findById(currentCat.getMotherId());
                if (motherOpt.isPresent()) {
                    Cat mother = motherOpt.get();
                    PedigreeNode motherNode = processParent(
                            mother, currentGen + 1, maxGeneration, nodeCache,
                            visited, inPath, newPath, queue, cycleInfos, inbreedingInfos
                    );
                    currentNode.setMother(motherNode);
                }
            }

            detectInbreeding(currentCat, currentNode, nodeCache, inbreedingInfos);
        }

        if (!cycleInfos.isEmpty()) {
            rootNode.setHasCycle(true);
            rootNode.setCycleInfo(String.join("; ", cycleInfos));
        }

        return rootNode;
    }

    private PedigreeNode processParent(
            Cat parentCat, int generation, int maxGeneration,
            Map<String, PedigreeNode> nodeCache,
            Set<String> visited, Set<String> inPath,
            List<String> currentPath, Queue<BuildContext> queue,
            List<String> cycleInfos, List<String> inbreedingInfos) {

        String parentKey = parentCat.getCatNo();

        if (currentPath.contains(parentKey)) {
            int cycleStart = currentPath.indexOf(parentKey);
            List<String> cyclePath = currentPath.subList(cycleStart, currentPath.size());
            String cycleDesc = String.format("检测到环: %s -> %s",
                    String.join(" -> ", cyclePath), parentKey);
            cycleInfos.add(cycleDesc);
            log.warn("Cycle detected in pedigree: {}", cycleDesc);

            PedigreeNode cachedNode = nodeCache.get(parentKey);
            if (cachedNode == null) {
                cachedNode = createPedigreeNode(parentCat, generation);
                cachedNode.setHasCycle(true);
                cachedNode.setCycleInfo(cycleDesc);
                nodeCache.put(parentKey, cachedNode);
            }
            return cachedNode;
        }

        if (nodeCache.containsKey(parentKey)) {
            PedigreeNode cachedNode = nodeCache.get(parentKey);
            cachedNode.setGeneration(Math.min(cachedNode.getGeneration(), generation));
            return cachedNode;
        }

        PedigreeNode parentNode = createPedigreeNode(parentCat, generation);
        nodeCache.put(parentKey, parentNode);

        if (generation < maxGeneration && !visited.contains(parentKey)) {
            queue.offer(new BuildContext(parentCat, parentNode, generation, new ArrayList<>(currentPath)));
        }

        return parentNode;
    }

    private void detectInbreeding(Cat cat, PedigreeNode node,
                                  Map<String, PedigreeNode> nodeCache,
                                  List<String> inbreedingInfos) {
        if (node.getFather() != null && node.getMother() != null) {
            double coefficient = calculateInbreedingCoefficient(node.getFather(), node.getMother());
            if (coefficient > 0) {
                node.setIsInbreeding(true);
                node.setInbreedingCoefficient(coefficient);
                String info = String.format("%s 的父母 (%s 和 %s) 存在血缘关系，近交系数: %.4f",
                        node.getCatNo(),
                        node.getFather().getCatNo(),
                        node.getMother().getCatNo(),
                        coefficient);
                node.setInbreedingInfo(info);
                inbreedingInfos.add(info);
            }
        }
    }

    private double calculateInbreedingCoefficient(PedigreeNode father, PedigreeNode mother) {
        if (father == null || mother == null) return 0;

        Set<String> fatherAncestors = getAncestorCatNos(father);
        Set<String> motherAncestors = getAncestorCatNos(mother);

        fatherAncestors.retainAll(motherAncestors);
        if (fatherAncestors.isEmpty()) return 0;

        return 0.0625 * fatherAncestors.size();
    }

    private Set<String> getAncestorCatNos(PedigreeNode node) {
        Set<String> ancestors = new HashSet<>();
        if (node == null) return ancestors;
        ancestors.add(node.getCatNo());
        if (node.getFather() != null) {
            ancestors.addAll(getAncestorCatNos(node.getFather()));
        }
        if (node.getMother() != null) {
            ancestors.addAll(getAncestorCatNos(node.getMother()));
        }
        return ancestors;
    }

    private PedigreeNode createPedigreeNode(Cat cat, int generation) {
        PedigreeNode node = new PedigreeNode();
        node.setCatNo(cat.getCatNo());
        node.setName(cat.getName());
        node.setBreed(cat.getBreed());
        node.setGender(cat.getGender());
        node.setBirthDate(cat.getBirthDate());
        node.setColor(cat.getColor());
        node.setAwards(cat.getAwards());
        node.setRegistrationNo(cat.getRegistrationNo());
        node.setGeneration(generation);
        node.setHasCycle(false);
        node.setIsInbreeding(false);
        return node;
    }

    private static class BuildContext {
        Cat cat;
        PedigreeNode node;
        int generation;
        List<String> path;

        BuildContext(Cat cat, PedigreeNode node, int generation, List<String> path) {
            this.cat = cat;
            this.node = node;
            this.generation = generation;
            this.path = path;
        }
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
