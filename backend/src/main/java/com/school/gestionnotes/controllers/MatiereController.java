package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Matiere;
import com.school.gestionnotes.repositories.MatiereRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matieres")
public class MatiereController {

    @Autowired
    private MatiereRepository matiereRepository;

    @Autowired
    private com.school.gestionnotes.repositories.FiliereRepository filiereRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF') or hasRole('ETUDIANT')")
    public List<Matiere> getAllMatieres() {
        return matiereRepository.findAll();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Matiere createMatiere(@RequestBody Matiere matiere) {
        return matiereRepository.save(matiere);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteMatiere(@PathVariable Long id) {
        return matiereRepository.findById(id).map(matiere -> {
            try {
                matiereRepository.delete(matiere);
                return ResponseEntity.ok().build();
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
                        .body("Impossible de supprimer cette matiere car elle possede des notes associees.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Matiere> updateMatiere(@PathVariable Long id, @RequestBody Matiere matiereDetails) {
        return matiereRepository.findById(id).map(matiere -> {
            matiere.setCode(matiereDetails.getCode());
            matiere.setLibelle(matiereDetails.getLibelle());
            matiere.setNbrHeures(matiereDetails.getNbrHeures());
            matiere.setFiliere(null);
            if (matiereDetails.getFiliere() != null && matiereDetails.getFiliere().getId() != null) {
                filiereRepository.findById(matiereDetails.getFiliere().getId()).ifPresent(matiere::setFiliere);
            }
            return ResponseEntity.ok(matiereRepository.save(matiere));
        }).orElse(ResponseEntity.notFound().build());
    }
}
