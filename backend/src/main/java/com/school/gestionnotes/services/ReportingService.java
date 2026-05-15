package com.school.gestionnotes.services;

public interface ReportingService {
    byte[] generateStudentBulletin(Long etudiantId) throws Exception;
}
