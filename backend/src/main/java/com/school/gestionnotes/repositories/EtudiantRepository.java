package com.school.gestionnotes.repositories;

import com.school.gestionnotes.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    Optional<Etudiant> findByCne(String cne);
    boolean existsByCne(String cne);
    java.util.List<Etudiant> findByFiliereId(Long filiereId);
    Optional<Etudiant> findByUserUsername(String username);
}
