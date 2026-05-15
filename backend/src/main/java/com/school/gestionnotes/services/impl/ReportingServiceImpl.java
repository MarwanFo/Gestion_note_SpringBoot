package com.school.gestionnotes.services.impl;

import com.school.gestionnotes.services.ReportingService;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class ReportingServiceImpl implements ReportingService {

    @Override
    public byte[] generateStudentBulletin(Long etudiantId) throws Exception {
        Map<String, Object> parameters = new HashMap<>();
        parameters.put("title", "Bulletin de Notes");
        
        return "Contenu PDF simulé (JasperReports)".getBytes();
    }
}
