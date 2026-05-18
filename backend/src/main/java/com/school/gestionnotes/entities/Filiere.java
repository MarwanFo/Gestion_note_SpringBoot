package com.school.gestionnotes.entities;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "filieres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Filiere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String libelle;

    @OneToMany(mappedBy = "filiere")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Etudiant> etudiants;

    @OneToMany(mappedBy = "filiere")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Matiere> matieres;

    @ManyToMany(mappedBy = "filieres")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Professeur> professeurs;
}
