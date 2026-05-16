package com.school.gestionnotes.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double valeur;

    private String observation;

    private LocalDateTime dateSaisie;

    @ManyToOne
    @JoinColumn(name = "etudiant_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties("notes")
    private Etudiant etudiant;

    @ManyToOne
    @JoinColumn(name = "matiere_id")
    private Matiere matiere;

    @ManyToOne
    @JoinColumn(name = "professeur_id")
    private Professeur professeur;

    @PrePersist
    protected void onCreate() {
        dateSaisie = LocalDateTime.now();
    }
}
