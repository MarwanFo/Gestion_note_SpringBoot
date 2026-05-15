package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Etudiant;
import com.school.gestionnotes.repositories.EtudiantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
public class EtudiantController {

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private com.school.gestionnotes.repositories.FiliereRepository filiereRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF')")
    public List<Etudiant> getAllEtudiants() {
        return etudiantRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Etudiant createEtudiant(@RequestBody Etudiant etudiant) {
        return etudiantRepository.save(etudiant);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF')")
    public ResponseEntity<Etudiant> getEtudiantById(@PathVariable Long id) {
        return etudiantRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/filiere/{filiereId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF')")
    public List<Etudiant> getEtudiantsByFiliere(@PathVariable Long filiereId) {
        return etudiantRepository.findByFiliereId(filiereId);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteEtudiant(@PathVariable Long id) {
        return etudiantRepository.findById(id).map(etudiant -> {
            try {
                etudiantRepository.delete(etudiant);
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                        .body("Impossible de supprimer cet etudiant car il possede des notes.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Etudiant> updateEtudiant(@PathVariable Long id, @RequestBody Etudiant etudiantDetails) {
        return etudiantRepository.findById(id).map(etudiant -> {
            etudiant.setCne(etudiantDetails.getCne());
            etudiant.setNom(etudiantDetails.getNom());
            etudiant.setPrenom(etudiantDetails.getPrenom());
            etudiant.setTelephone(etudiantDetails.getTelephone());
            etudiant.setAdresse(etudiantDetails.getAdresse());
            etudiant.setEmail(etudiantDetails.getEmail());
            etudiant.setFiliere(null);
            if (etudiantDetails.getFiliere() != null && etudiantDetails.getFiliere().getId() != null) {
                filiereRepository.findById(etudiantDetails.getFiliere().getId()).ifPresent(etudiant::setFiliere);
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<Etudiant> getMyProfile(java.security.Principal principal) {
        return etudiantRepository.findByUserUsername(principal.getName())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
