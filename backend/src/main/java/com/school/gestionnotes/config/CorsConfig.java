package com.school.gestionnotes.config;

// This class is intentionally left empty.
// CORS is now handled exclusively by WebSecurityConfig.corsConfigurationSource()
// Having two CORS configurations causes Spring to reject POST/PUT/DELETE requests.

// @Configuration - DISABLED to prevent conflict
public class CorsConfig {
    // Removed: the WebMvcConfigurer corsConfigurer bean was conflicting
    // with the Spring Security CorsConfigurationSource bean.
}
