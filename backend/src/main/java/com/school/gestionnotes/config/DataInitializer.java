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
            if (!userRepository.existsByUsername("student1")) {
                User student = User.builder()
                        .username("student1")
                        .email("student1@school.com")
                        .password(passwordEncoder.encode("student123"))
                        .role(Role.ROLE_ETUDIANT)
                        .active(true)
                        .build();
                userRepository.save(student);
                System.out.println(">>> Student user created: student1 / student123");
            }
        } catch (Exception e) {
            System.err.println(">>> Admin initialization skipped: " + e.getMessage());
        }
        System.out.println(">>> DataInitializer: Cleanup completed.");
    }
}
