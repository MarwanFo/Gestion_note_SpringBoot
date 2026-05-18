package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Professeur;
import com.school.gestionnotes.repositories.ProfesseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.school.gestionnotes.entities.User;
import com.school.gestionnotes.repositories.UserRepository;
import java.util.UUID;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/professeurs")
public class ProfesseurController {

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private com.school.gestionnotes.repositories.FiliereRepository filiereRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Professeur> getAllProfesseurs() {
        return professeurRepository.findAll();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('PROF')")
    public ResponseEntity<Professeur> getMyProfile(java.security.Principal principal) {
        return professeurRepository.findAll().stream()
                .filter(p -> p.getUser() != null && p.getUser().getUsername().equals(principal.getName()))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Professeur createProfesseur(@RequestBody Professeur professeur) {
        String email = professeur.getNom().toLowerCase() + "." + professeur.getPrenom().toLowerCase() + "@school.com";
        String username = "prof_" + professeur.getMatricule().toLowerCase();
        
        // Generate random 8 character password
        String plainPassword = UUID.randomUUID().toString().substring(0, 8);
        
        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(plainPassword))
                .role(com.school.gestionnotes.enums.Role.ROLE_PROF)
                .active(true)
                .build();
                
        user = userRepository.save(user);
        professeur.setUser(user);
        
        Professeur savedProf = professeurRepository.save(professeur);
        savedProf.setGeneratedPassword(plainPassword); // Send password back once
        
        return savedProf;
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(@PathVariable Long id) {
        return professeurRepository.findById(id).map(prof -> {
            if (prof.getUser() != null) {
                String newPassword = UUID.randomUUID().toString().substring(0, 8);
                User user = prof.getUser();
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok(Collections.singletonMap("newPassword", newPassword));
            }
            return ResponseEntity.badRequest().body("Le professeur n'a pas de compte utilisateur.");
        }).orElse(ResponseEntity.notFound().build());
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
