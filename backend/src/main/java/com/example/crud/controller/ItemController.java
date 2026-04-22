package com.example.crud.controller;

import com.example.crud.model.Item;
import com.example.crud.model.Category;
import com.example.crud.repository.ItemRepository;
import com.example.crud.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepo;
    private final CategoryRepository categoryRepo;

    public ItemController(ItemRepository itemRepo, CategoryRepository categoryRepo) {
        this.itemRepo = itemRepo;
        this.categoryRepo = categoryRepo;
    }

    @GetMapping
    public List<Item> getAll() { return itemRepo.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Item> getOne(@PathVariable Long id) {
        return itemRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Item> create(@Valid @RequestBody Item item) {
        resolveCategory(item);
        return ResponseEntity.status(201).body(itemRepo.save(item));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> update(@PathVariable Long id, @Valid @RequestBody Item updated) {
        return itemRepo.findById(id).map(item -> {
            item.setName(updated.getName());
            item.setDescription(updated.getDescription());
            item.setPrice(updated.getPrice());
            item.setSize(updated.getSize());
            item.setCategory(updated.getCategory());
            resolveCategory(item);
            return ResponseEntity.ok(itemRepo.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!itemRepo.existsById(id)) return ResponseEntity.notFound().build();
        itemRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void resolveCategory(Item item) {
        if (item.getCategory() != null && item.getCategory().getId() != null) {
            item.setCategory(categoryRepo.findById(item.getCategory().getId()).orElse(null));
        } else {
            item.setCategory(null);
        }
    }
}
