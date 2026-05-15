package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Professeur;
import com.school.gestionnotes.repositories.ProfesseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professeurs")
public class ProfesseurController {

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private com.school.gestionnotes.repositories.FiliereRepository filiereRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Professeur> getAllProfesseurs() {
        return professeurRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Professeur createProfesseur(@RequestBody Professeur professeur) {
        return professeurRepository.save(professeur);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteProfesseur(@PathVariable Long id) {
        return professeurRepository.findById(id).map(prof -> {
            try {
                professeurRepository.delete(prof);
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                        .body("Impossible de supprimer ce professeur car il possede des notes associees.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Professeur> updateProfesseur(@PathVariable Long id, @RequestBody Professeur profDetails) {
        return professeurRepository.findById(id).map(prof -> {
            prof.setMatricule(profDetails.getMatricule());
            prof.setNom(profDetails.getNom());
            prof.setPrenom(profDetails.getPrenom());
            prof.setGrade(profDetails.getGrade());
            prof.setFiliere(null);
            if (profDetails.getFiliere() != null && profDetails.getFiliere().getId() != null) {
                filiereRepository.findById(profDetails.getFiliere().getId()).ifPresent(prof::setFiliere);
            }
            return ResponseEntity.ok(professeurRepository.save(prof));
        }).orElse(ResponseEntity.notFound().build());
    }
}
