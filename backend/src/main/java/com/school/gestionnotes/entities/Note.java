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

    private Double cc1;
    private Double cc2;
    private Double examen;
    private Double rattrapage;

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

    public void calculateValeur() {
        double ccAvg = 0.0;
        int ccCount = 0;
        if (cc1 != null) { ccAvg += cc1; ccCount++; }
        if (cc2 != null) { ccAvg += cc2; ccCount++; }
        ccAvg = ccCount > 0 ? (ccAvg / ccCount) : 0.0;

        double examVal = examen != null ? examen : 0.0;
        double initialMoyenne = (ccAvg * 0.25) + (examVal * 0.75);

        if (initialMoyenne < 10.0 && rattrapage != null) {
            double rattMoyenne = (ccAvg * 0.25) + (rattrapage * 0.75);
            this.valeur = Math.max(initialMoyenne, rattMoyenne);
        } else {
            this.valeur = initialMoyenne;
        }
    }

    @PrePersist
    @PreUpdate
    protected void onCreateOrUpdate() {
        dateSaisie = LocalDateTime.now();
        calculateValeur();
    }
}
