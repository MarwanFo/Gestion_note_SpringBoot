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

    @Autowired
    private com.school.gestionnotes.repositories.UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createEtudiant(@RequestBody Etudiant etudiant) {
        // Validate email
        if (etudiant.getEmail() == null || etudiant.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'email est obligatoire.");
        }
        
        String generatedUsername = etudiant.getEmail().trim();
        
        if (userRepository.existsByUsername(generatedUsername) || userRepository.existsByEmail(generatedUsername)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body("Cet email est déjà utilisé.");
        }

        String generatedPassword = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "x$"; // Hard password
        
        com.school.gestionnotes.entities.User newUser = com.school.gestionnotes.entities.User.builder()
                .username(generatedUsername)
                .email(generatedUsername)
                .password(passwordEncoder.encode(generatedPassword))
                .role(com.school.gestionnotes.enums.Role.ROLE_ETUDIANT)
                .active(true)
                .build();
        userRepository.save(newUser);
        etudiant.setUser(newUser);
        etudiant.setGeneratedPassword(generatedPassword);

        if (etudiant.getFiliere() != null && etudiant.getFiliere().getId() != null) {
            filiereRepository.findById(etudiant.getFiliere().getId()).ifPresent(etudiant::setFiliere);
        } else {
            etudiant.setFiliere(null);
        }

        Etudiant savedEtudiant = etudiantRepository.save(etudiant);
        savedEtudiant.setGeneratedPassword(etudiant.getGeneratedPassword()); // Ensure it's passed back
        return ResponseEntity.ok(savedEtudiant);
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
    public ResponseEntity<?> updateEtudiant(@PathVariable Long id, @RequestBody Etudiant etudiantDetails) {
        if (etudiantDetails.getEmail() == null || etudiantDetails.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("L'email est obligatoire.");
        }
        
        return etudiantRepository.findById(id).map(etudiant -> {
            etudiant.setCne(etudiantDetails.getCne());
            etudiant.setNom(etudiantDetails.getNom());
            etudiant.setPrenom(etudiantDetails.getPrenom());
            etudiant.setTelephone(etudiantDetails.getTelephone());
            etudiant.setAdresse(etudiantDetails.getAdresse());
            etudiant.setEmail(etudiantDetails.getEmail().trim());
            etudiant.setFiliere(null);
            if (etudiantDetails.getFiliere() != null && etudiantDetails.getFiliere().getId() != null) {
                filiereRepository.findById(etudiantDetails.getFiliere().getId()).ifPresent(etudiant::setFiliere);
            }
            try {
                return ResponseEntity.ok(etudiantRepository.save(etudiant));
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body("Cet email ou CNE est déjà utilisé.");
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        return etudiantRepository.findById(id).map(etudiant -> {
            if (etudiant.getUser() == null) {
                return ResponseEntity.badRequest().body("Cet étudiant n'a pas de compte utilisateur lié.");
            }
            
            String newPassword = java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase() + "x$";
            com.school.gestionnotes.entities.User user = etudiant.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            etudiant.setGeneratedPassword(newPassword);
            return ResponseEntity.ok(etudiant);
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
