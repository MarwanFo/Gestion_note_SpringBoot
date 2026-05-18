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

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    public String generateRoadmapForStudent(Long etudiantId) {
        if ("NO_KEY_PROVIDED".equals(geminiApiKey) || geminiApiKey.trim().isEmpty()) {
            return "⚠️ **Configuration Requise:** Veuillez configurer `GEMINI_API_KEY` dans votre backend pour activer le coach académique IA.";
        }

        List<Note> notes = noteRepository.findByEtudiantId(etudiantId);
        if (notes.isEmpty()) {
            return "Aucune note disponible pour générer un plan d'étude.";
        }

        StringBuilder statsBuilder = new StringBuilder();
        for (Note note : notes) {
            statsBuilder.append("- ")
                    .append(note.getMatiere().getLibelle())
                    .append(": ")
                    .append(note.getValeur())
                    .append("/20\n");
        }

        String prompt = "Tu es un coach académique expert et bienveillant. " +
                "Analyse les notes suivantes d'un étudiant et propose un 'Plan de Réussite' très concis et structuré en français.\n" +
                "Notes de l'étudiant:\n" + statsBuilder.toString() + "\n" +
                "Structure de ta réponse (utilise du Markdown):\n" +
                "1. **💡 Diagnostic Rapide** : 1 phrase sur ses points forts (notes >= 12) et ses axes d'amélioration (notes < 10).\n" +
                "2. **📈 Actions Précises** : 2 ou 3 conseils pratiques et concrets pour ses matières les plus faibles.\n" +
                "3. **🔗 Ressources Suggérées** : 2 types de recherches ou sujets à explorer.\n" +
                "Reste très motivant, court, et direct.";

        return callGeminiApi(prompt);
    }

    private String callGeminiApi(String prompt) {
        try {
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Constructing the JSON payload manually using Maps to avoid creating multiple DTO classes
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(contentPart));

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.getBody().get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "Une erreur est survenue lors de la lecture de la réponse de l'IA.";
        } catch (Exception e) {
            e.printStackTrace();
            return "⚠️ **Service Indisponible:** Impossible de se connecter au service d'Intelligence Artificielle. Veuillez réessayer plus tard.\n\n" +
                   "*(Erreur technique: " + e.getMessage() + ")*";
        }
    }
}
