package com.school.gestionnotes.controllers;

import com.school.gestionnotes.entities.Note;
import com.school.gestionnotes.repositories.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private NoteRepository noteRepository;

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
            n.setValeur(note.getValeur());
            n.setObservation(note.getObservation());
            return noteRepository.save(n);
        }
        
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
}
