package com.school.gestionnotes.services.impl;

import com.school.gestionnotes.entities.Etudiant;
import com.school.gestionnotes.entities.Matiere;
import com.school.gestionnotes.entities.Note;
import com.school.gestionnotes.entities.Professeur;
import com.school.gestionnotes.repositories.EtudiantRepository;
import com.school.gestionnotes.repositories.MatiereRepository;
import com.school.gestionnotes.repositories.NoteRepository;
import com.school.gestionnotes.repositories.ProfesseurRepository;
import com.school.gestionnotes.services.NoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NoteServiceImpl implements NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private MatiereRepository matiereRepository;

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Override
    @Transactional
    public Note saveNote(Long etudiantId, Long matiereId, Long profId, Double valeur, String observation) {
        if (valeur < 0 || valeur > 20) {
            throw new IllegalArgumentException("La note doit être comprise entre 0 et 20");
        }

        Etudiant etudiant = etudiantRepository.findById(etudiantId)
                .orElseThrow(() -> new RuntimeException("Étudiant non trouvé"));
        Matiere matiere = matiereRepository.findById(matiereId)
                .orElseThrow(() -> new RuntimeException("Matière non trouvée"));
        Professeur prof = professeurRepository.findById(profId)
                .orElseThrow(() -> new RuntimeException("Professeur non trouvé"));

        Note note = Note.builder()
                .etudiant(etudiant)
                .matiere(matiere)
                .professeur(prof)
                .valeur(valeur)
                .observation(observation)
                .build();

        return noteRepository.save(note);
    }

    @Override
    public List<Note> getNotesByEtudiant(Long etudiantId) {
        return noteRepository.findByEtudiantId(etudiantId);
    }

    @Override
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}
