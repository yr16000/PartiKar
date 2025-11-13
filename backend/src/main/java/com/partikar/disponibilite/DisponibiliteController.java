package com.partikar.disponibilite;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des disponibilités.
 */
@RestController
@RequestMapping("/api/disponibilites")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DisponibiliteController {

    private final DisponibiliteService disponibiliteService;

    public DisponibiliteController(DisponibiliteService disponibiliteService) {
        this.disponibiliteService = disponibiliteService;
    }

    /**
     * Récupère toutes les disponibilités d'une voiture.
     * GET /api/disponibilites/voiture/{voitureId}
     * GET /api/disponibilites?voitureId={voitureId}
     */
    @GetMapping("/voiture/{voitureId}")
    public ResponseEntity<List<DisponibiliteResponse>> getDisponibilitesParVoiture(@PathVariable Long voitureId) {
        List<DisponibiliteResponse> disponibilites = disponibiliteService.getDisponibilitesParVoiture(voitureId);
        return ResponseEntity.ok(disponibilites);
    }

    @GetMapping
    public ResponseEntity<List<DisponibiliteResponse>> getDisponibilitesParVoitureQuery(@RequestParam Long voitureId) {
        List<DisponibiliteResponse> disponibilites = disponibiliteService.getDisponibilitesParVoiture(voitureId);
        return ResponseEntity.ok(disponibilites);
    }
}

