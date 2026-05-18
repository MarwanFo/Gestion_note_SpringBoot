package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Note;
import com.school.gestionnotes.repositories.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.school.gestionnotes.services.AiRoadmapService;
import java.util.Collections;

import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private AiRoadmapService aiRoadmapService;

    @GetMapping("/matiere/{matiereId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROF')")
    public List<Note> getNotesByMatiere(@PathVariable Long matiereId) {
        return noteRepository.findByMatiereId(matiereId);
    }

    @PostMapping
    @PreAuthorize("hasRole('PROF') or hasRole('ADMIN')")
    public Note saveOrUpdateNote(@RequestBody Note note) {
        // Check if note already exists for this student and subject
        Optional<Note> existing = noteRepository.findByEtudiantIdAndMatiereId(
                note.getEtudiant().getId(), 
                note.getMatiere().getId()
        );
        
        if (existing.isPresent()) {
            Note n = existing.get();
            n.setCc1(note.getCc1());
            n.setCc2(note.getCc2());
            n.setExamen(note.getExamen());
            n.setRattrapage(note.getRattrapage());
            n.setObservation(note.getObservation());
            n.calculateValeur();
            return noteRepository.save(n);
        }
        
        note.calculateValeur();
        return noteRepository.save(note);
    }
    @Autowired
    private com.school.gestionnotes.repositories.EtudiantRepository etudiantRepository;

    @GetMapping("/mes-notes")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<List<Note>> getMyNotes(java.security.Principal principal) {
        return etudiantRepository.findByUserUsername(principal.getName())
                .map(etudiant -> ResponseEntity.ok(noteRepository.findByEtudiantId(etudiant.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/mes-notes/roadmap")
    @PreAuthorize("hasRole('ETUDIANT')")
    public ResponseEntity<?> getMyAiRoadmap(java.security.Principal principal) {
        return etudiantRepository.findByUserUsername(principal.getName())
                .map(etudiant -> {
                    String roadmap = aiRoadmapService.generateRoadmapForStudent(etudiant.getId());
                    return ResponseEntity.ok(Collections.singletonMap("roadmap", roadmap));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
