package com.school.gestionnotes.repositories;

import com.school.gestionnotes.entities.Professeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfesseurRepository extends JpaRepository<Professeur, Long> {
    Optional<Professeur> findByMatricule(String matricule);
    boolean existsByMatricule(String matricule);
}
