package com.example.crud.controller;

import com.example.crud.model.Category;
import com.example.crud.repository.CategoryRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository repo;
    public CategoryController(CategoryRepository repo) { this.repo = repo; }

    @GetMapping
    public List<Category> getAll() { return repo.findAll(); }

    @PostMapping
    public ResponseEntity<Category> create(@Valid @RequestBody Category category) {
        return ResponseEntity.status(201).body(repo.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
