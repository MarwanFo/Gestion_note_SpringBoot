package com.school.gestionnotes.services;

import com.school.gestionnotes.entities.Note;
import com.school.gestionnotes.repositories.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiRoadmapService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public String generateRoadmapForStudent(Long etudiantId) {
        List<Note> notes = noteRepository.findByEtudiantId(etudiantId);
        
        // Filter notes to only include subjects belonging to the student's filiere,
        // and where at least one grade is actually entered (not a blank/draft note)
        List<Note> activeNotes = notes.stream()
                .filter(note -> note.getMatiere() != null && 
                                note.getEtudiant() != null && 
                                note.getEtudiant().getFiliere() != null &&
                                note.getMatiere().getFiliere() != null &&
                                note.getMatiere().getFiliere().getId().equals(note.getEtudiant().getFiliere().getId()))
                .filter(note -> note.getCc1() != null || 
                                note.getCc2() != null || 
                                note.getExamen() != null)
                .toList();

        if (activeNotes.isEmpty()) {
            return "Aucune note disponible pour générer un plan d'étude.";
        }

        String fallbackRoadmap = generateFallbackRoadmap(activeNotes);

        if ("NO_KEY_PROVIDED".equals(groqApiKey) || groqApiKey.trim().isEmpty()) {
            return fallbackRoadmap;
        }

        StringBuilder statsBuilder = new StringBuilder();
        for (Note note : activeNotes) {
            statsBuilder.append("📖 Matière : ").append(note.getMatiere().getLibelle())
                    .append(" (Code : ").append(note.getMatiere().getCode()).append(")\n");
            statsBuilder.append("   - Note globale actuelle : ").append(note.getValeur()).append("/20\n");
            if (note.getCc1() != null) statsBuilder.append("   - Contrôle Continu 1 (CC1) : ").append(note.getCc1()).append("/20\n");
            if (note.getCc2() != null) statsBuilder.append("   - Contrôle Continu 2 (CC2) : ").append(note.getCc2()).append("/20\n");
            if (note.getExamen() != null) statsBuilder.append("   - Examen Final : ").append(note.getExamen()).append("/20\n");
            if (note.getRattrapage() != null) statsBuilder.append("   - Session de Rattrapage : ").append(note.getRattrapage()).append("/20\n");
            if (note.getObservation() != null && !note.getObservation().trim().isEmpty()) {
                statsBuilder.append("   - Appréciation du professeur : \"").append(note.getObservation()).append("\"\n");
            }
            statsBuilder.append("\n");
        }

        String prompt = "Tu es 'Mon Coach IA', un mentor académique d'élite, expert en pédagogie et en psychologie de la réussite universitaire. " +
                "Analyse en détail les performances académiques de l'étudiant ci-dessous, y compris les contrôles continus, l'examen final et les remarques du professeur, afin de lui construire une feuille de route sur-mesure hyper motivante et structurée.\n\n" +
                "--- NOTES DÉTAILLÉES DE L'ÉTUDIANT ---\n" + statsBuilder.toString() + "\n" +
                "Rédige un rapport premium en français en utilisant un ton chaleureux, inspirant et extrêmement professionnel. Structure ta réponse précisément en utilisant du Markdown de haut niveau (titres, listes, émojis, mise en gras pour les concepts clés) :\n\n" +
                "### 🎯 **1. Diagnostic Académique & Forces**\n" +
                "Fais une analyse fine et personnalisée. Identifie ses forces majeures basées sur ses notes et contrôles continus les plus élevés. Souligne sa progression ou sa régularité. Explique-lui concrètement pourquoi cette force est un atout précieux pour sa future carrière.\n\n" +
                "### ⚡ **2. Axes d'Amélioration & Stratégie Métacognitive**\n" +
                "Cible les faiblesses clés de manière constructive. Par exemple, s'il a échoué aux CC mais a brillé à l'examen, ou s'il doit passer le rattrapage. Donne-lui une technique d'apprentissage spécifique et avancée adaptée à la matière (ex: Méthode Feynman, Répétition Espacée, Technique Pomodoro, Active Recall) pour surmonter ses blocages.\n\n" +
                "### 📈 **3. Plan d'Action Hebdomadaire (Actionnable)**\n" +
                "Propose un planning d'étude ou des actions concrètes découpées par étapes faciles à réaliser (ex: réviser les concepts clés, faire 3 exercices d'application, simuler un examen blanc sous temps limité).\n\n" +
                "### 🔗 **4. Ressources Ciblées & Mots-Clés de Recherche**\n" +
                "Suggère des concepts précis, chaînes YouTube académiques célèbres en français, plateformes (OpenClassrooms, Coursera, Khan Academy) ou expressions clés à rechercher sur Google pour combler ses lacunes.\n\n" +
                "### ✨ **5. Le Mot du Coach**\n" +
                "Termine par une citation ou une phrase de motivation puissante et sur-mesure pour booster sa confiance et sa productivité.\n\n" +
                "Évite les généralités. Sois extrêmement précis sur les matières étudiées.";

        String apiResult = callGroqApi(prompt);
        if (apiResult == null) {
            return fallbackRoadmap;
        }
        return apiResult;
    }

    private String generateFallbackRoadmap(List<Note> notes) {
        List<Note> bestNotes = new java.util.ArrayList<>();
        List<Note> weakNotes = new java.util.ArrayList<>();
        Note lowestNote = null;

        for (Note note : notes) {
            double val = note.getValeur();
            if (val >= 12.0) {
                bestNotes.add(note);
            } else if (val < 10.0) {
                weakNotes.add(note);
            }
            if (lowestNote == null || val < lowestNote.getValeur()) {
                lowestNote = note;
            }
        }

        StringBuilder fallback = new StringBuilder();
        fallback.append("✨ **[Assistant Académique]** Voici votre plan de réussite personnalisé basé sur vos notes actuelles :\n\n");

        // 1. Diagnostic Rapide
        fallback.append("### 💡 Diagnostic Rapide\n");
        if (!bestNotes.isEmpty()) {
            fallback.append("Félicitations pour vos excellentes performances en ");
            for (int i = 0; i < bestNotes.size(); i++) {
                fallback.append("**").append(bestNotes.get(i).getMatiere().getLibelle()).append("**");
                if (i < bestNotes.size() - 1) fallback.append(", ");
            }
            fallback.append(" ! Vous y démontrez une excellente maîtrise.\n");
        } else {
            fallback.append("Vos résultats montrent un rythme régulier, mais vous avez le potentiel de viser plus haut.\n");
        }

        if (!weakNotes.isEmpty() || lowestNote != null) {
            Note mainWeak = !weakNotes.isEmpty() ? weakNotes.get(0) : lowestNote;
            fallback.append("Votre priorité stratégique doit être de consolider vos acquis en **")
                   .append(mainWeak.getMatiere().getLibelle())
                   .append("** (")
                   .append(String.format("%.2f", mainWeak.getValeur()))
                   .append("/20) pour remonter votre moyenne générale.\n\n");
        } else {
            fallback.append("Toutes vos matières sont validées avec succès ! Continuez sur cette belle lancée.\n\n");
        }

        // 2. Actions Précises
        fallback.append("### 📈 Actions Précises\n");
        if (lowestNote != null) {
            fallback.append("- **Objectif ")
                   .append(lowestNote.getMatiere().getLibelle())
                   .append("** : Consacrez 3 sessions hebdomadaires de 45 minutes pour refaire activement les exercices clés et les examens blancs.\n");
        }
        fallback.append("- **Apprentissage Actif** : Retravaillez vos synthèses de cours sous forme de cartes mentales (mindmaps) pour mieux structurer vos idées.\n");
        fallback.append("- **Collaboration** : Rejoignez un groupe d'étude ou demandez l'appui d'un tuteur de filière pour clarifier les concepts les plus complexes.\n\n");

        // 3. Ressources Suggérées
        fallback.append("### 🔗 Ressources Suggérées\n");
        if (lowestNote != null) {
            fallback.append("- **Supports de ")
                   .append(lowestNote.getMatiere().getLibelle())
                   .append("** : Reprenez en priorité les fascicules de TD officiels et demandez les corrigés de la filière.\n");
        }
        fallback.append("- **Bibliothèque Numérique** : Explorez des plateformes universitaires comme Coursera ou Khan Academy pour aborder les sujets difficiles sous un autre angle.\n\n");
        fallback.append("*Ce plan a été optimisé par notre conseiller d'orientation universitaire intégré.*");

        return fallback.toString();
    }

    private String callGroqApi(String prompt) {
        try {
            String url = groqApiUrl;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            Map<String, Object> messagePart = new HashMap<>();
            messagePart.put("role", "user");
            messagePart.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", List.of(messagePart));
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) choice.get("message");
                    if (message != null) {
                        return (String) message.get("content");
                    }
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("⚠️ Groq API Call failed: " + e.getMessage());
            return null;
        }
    }
}
