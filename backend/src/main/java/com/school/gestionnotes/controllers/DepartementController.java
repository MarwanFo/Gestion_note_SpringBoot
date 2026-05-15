package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Departement;
import com.school.gestionnotes.repositories.DepartementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departements")
public class DepartementController {

    @Autowired
    private DepartementRepository departementRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF') or hasRole('ETUDIANT')")
    public List<Departement> getAllDepartements() {
        return departementRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Departement createDepartement(@RequestBody Departement departement) {
        return departementRepository.save(departement);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartement(@PathVariable Long id) {
        return departementRepository.findById(id).map(dep -> {
            departementRepository.delete(dep);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
