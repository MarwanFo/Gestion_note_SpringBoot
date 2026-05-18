package com.school.gestionnotes.services.impl;

import com.school.gestionnotes.entities.Note;
import com.school.gestionnotes.repositories.NoteRepository;
import com.school.gestionnotes.services.CalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CalculationServiceImpl implements CalculationService {

    @Autowired
    private NoteRepository noteRepository;

    @Override
    public Double calculateEtudiantAverage(Long etudiantId, String semestre) {
        List<Note> notes = noteRepository.findByEtudiantId(etudiantId);
        
        // Filter by semester if needed (assuming Matiere has semester)
        // For simplicity, we calculate based on all notes for now
        
        if (notes.isEmpty()) return 0.0;

        double sum = 0;
        for (Note note : notes) {
            sum += note.getValeur();
        }

        return sum / notes.size();
    }
}
