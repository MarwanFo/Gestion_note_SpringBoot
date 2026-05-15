package com.school.gestionnotes.repositories;

import com.school.gestionnotes.entities.Filiere;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FiliereRepository extends JpaRepository<Filiere, Long> {
    java.util.Optional<Filiere> findByCode(String code);
}
