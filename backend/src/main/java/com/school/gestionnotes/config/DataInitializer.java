package com.school.gestionnotes.config;

import com.school.gestionnotes.entities.*;
import com.school.gestionnotes.enums.Role;
import com.school.gestionnotes.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FiliereRepository filiereRepository;

    @Autowired
    private DepartementRepository departementRepository;

    @Autowired
    private MatiereRepository matiereRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private ProfesseurRepository professeurRepository;

    @Autowired
    private EtudiantRepository etudiantRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            if (!userRepository.existsByUsername("admin")) {
                User admin = User.builder()
                        .username("admin")
                        .email("admin@school.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ROLE_ADMIN)
                        .active(true)
                        .build();
                userRepository.save(admin);
                System.out.println(">>> Admin user created: admin / admin123");
            }
            User student = userRepository.findByUsername("student1").orElse(null);
            if (student == null) {
                student = User.builder()
                        .username("student1")
                        .email("student1@school.com")
                        .password(passwordEncoder.encode("student123"))
                        .role(Role.ROLE_ETUDIANT)
                        .active(true)
                        .build();
                student = userRepository.save(student);
                System.out.println(">>> Student user created: student1 / student123");
            }
            
            // Check if this student user has an Etudiant profile
            final User finalStudent = student;
            Etudiant etudiantProfile = etudiantRepository.findByUserUsername("student1").orElse(null);
            if (etudiantProfile == null) {
                etudiantProfile = Etudiant.builder()
                        .nom("Etudiant")
                        .prenom("Test")
                        .cne("TEST12345")
                        .user(finalStudent)
                        .email(finalStudent.getEmail())
                        .build();
                etudiantProfile = etudiantRepository.save(etudiantProfile);
                System.out.println(">>> Etudiant profile created and linked to student1");
            }

            // Create some test subjects (Matieres) and Grades (Notes) to see them in the UI
            if (matiereRepository.count() == 0) {
                Matiere math = Matiere.builder().code("MATH101").libelle("Algèbre Linéaire").coefficient(3.0).build();
                Matiere info = Matiere.builder().code("INFO101").libelle("Programmation Java").coefficient(4.0).build();
                Matiere reseau = Matiere.builder().code("RES101").libelle("Réseaux Informatiques").coefficient(2.0).build();
                matiereRepository.save(math);
                matiereRepository.save(info);
                matiereRepository.save(reseau);
                System.out.println(">>> Matieres created.");
            }

            if (etudiantProfile != null && noteRepository.findByEtudiantId(etudiantProfile.getId()).isEmpty()) {
                java.util.List<Matiere> matieres = matiereRepository.findAll();
                if (matieres.size() >= 1) {
                    Note note1 = Note.builder().valeur(15.5).observation("Très bon travail").etudiant(etudiantProfile).matiere(matieres.get(0)).build();
                    noteRepository.save(note1);
                }
                if (matieres.size() >= 2) {
                    Note note2 = Note.builder().valeur(18.0).observation("Excellent").etudiant(etudiantProfile).matiere(matieres.get(1)).build();
                    noteRepository.save(note2);
                }
                if (matieres.size() >= 3) {
                    Note note3 = Note.builder().valeur(9.0).observation("Doit faire plus d'efforts").etudiant(etudiantProfile).matiere(matieres.get(2)).build();
                    noteRepository.save(note3);
                }
                System.out.println(">>> Notes created for student1.");
            }
        } catch (Exception e) {
            System.err.println(">>> Admin initialization skipped: " + e.getMessage());
        }
        System.out.println(">>> DataInitializer: Cleanup completed.");
    }
}
