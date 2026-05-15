package com.school.gestionnotes.services;

import com.school.gestionnotes.entities.Note;
import java.util.List;

public interface NoteService {
    Note saveNote(Long etudiantId, Long matiereId, Long profId, Double valeur, String observation);
    List<Note> getNotesByEtudiant(Long etudiantId);
    void deleteNote(Long id);
}
