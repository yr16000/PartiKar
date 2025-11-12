package com.partikar.avis;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des avis.
 */
@RestController
@RequestMapping("/api/avis")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AvisController {

    private final AvisService avisService;

    public AvisController(AvisService avisService) {
        this.avisService = avisService;
    }

    /**
     * Crée un nouvel avis.
     * POST /api/avis
     */
    @PostMapping
    public ResponseEntity<?> creerAvis(@RequestBody CreerAvisRequest request) {
        try {
            AvisResponse response = avisService.creerAvis(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Modifie un avis existant.
     * PUT /api/avis/1
     */
    @PutMapping("/{avisId}")
    public ResponseEntity<?> modifierAvis(@PathVariable Long avisId, @RequestBody CreerAvisRequest request) {
        try {
            AvisResponse response = avisService.modifierAvis(avisId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Récupère l'avis de l'utilisateur authentifié pour une location.
     * GET /api/avis/location/1
     */
    @GetMapping("/location/{locationId}")
    public ResponseEntity<?> getMonAvisPourLocation(@PathVariable Long locationId) {
        try {
            AvisResponse response = avisService.getMonAvisPourLocation(locationId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Récupère tous les avis d'un utilisateur.
     * GET /api/avis/utilisateur/1
     */
    @GetMapping("/utilisateur/{userId}")
    public ResponseEntity<List<AvisResponse>> getAvisUtilisateur(@PathVariable Long userId) {
        List<AvisResponse> avis = avisService.getAvisUtilisateur(userId);
        return ResponseEntity.ok(avis);
    }

    /**
     * Supprime un avis.
     * DELETE /api/avis/1
     */
    @DeleteMapping("/{avisId}")
    public ResponseEntity<?> supprimerAvis(@PathVariable Long avisId) {
        try {
            avisService.supprimerAvis(avisId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Classe interne pour les réponses d'erreur.
     */
    private static class ErrorResponse {
        private final String message;

        public ErrorResponse(String message) {
            this.message = message;
        }

        public String getMessage() {
            return message;
        }
    }
}

