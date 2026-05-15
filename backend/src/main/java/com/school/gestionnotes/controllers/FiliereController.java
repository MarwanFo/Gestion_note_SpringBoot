package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Filiere;
import com.school.gestionnotes.repositories.FiliereRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/filieres")
public class FiliereController {

    @Autowired
    private FiliereRepository filiereRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF') or hasRole('ETUDIANT')")
    public List<Filiere> getAllFilieres() {
        System.out.println(">>> Fetching all filieres...");
        return filiereRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Filiere createFiliere(@RequestBody Filiere filiere) {
        return filiereRepository.save(filiere);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFiliere(@PathVariable Long id) {
        return filiereRepository.findById(id).map(filiere -> {
            try {
                filiereRepository.delete(filiere);
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                        .body("Impossible de supprimer cette filiere car elle possede des etudiants, matieres ou professeurs.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Filiere> updateFiliere(@PathVariable Long id, @RequestBody Filiere filiereDetails) {
        return filiereRepository.findById(id).map(filiere -> {
            filiere.setCode(filiereDetails.getCode());
            filiere.setLibelle(filiereDetails.getLibelle());
            return ResponseEntity.ok(filiereRepository.save(filiere));
        }).orElse(ResponseEntity.notFound().build());
    }
}
