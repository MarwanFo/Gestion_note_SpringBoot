package com.school.gestionnotes.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "matieres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Matiere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String libelle;

    private Integer nbrHeures;

    @ManyToOne
    @JoinColumn(name = "filiere_id")
    private Filiere filiere;
}
