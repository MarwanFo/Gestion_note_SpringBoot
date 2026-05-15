package com.school.gestionnotes.repositories;

import com.school.gestionnotes.entities.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByEtudiantId(Long etudiantId);
    List<Note> findByMatiereId(Long matiereId);
    java.util.Optional<Note> findByEtudiantIdAndMatiereId(Long etudiantId, Long matiereId);
}
