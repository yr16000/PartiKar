package com.partikar.annonces;

import com.partikar.annonces.dto.AnnonceResponse;
import com.partikar.annonces.dto.CreerAnnonceRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des annonces de voitures.
 * Expose les endpoints pour créer, consulter et supprimer des annonces.
 */
@RestController
@RequestMapping("/api/annonces")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AnnonceController {

    private final AnnonceService annonceService;

    public AnnonceController(AnnonceService annonceService) {
        this.annonceService = annonceService;
    }

    /**
     * Crée une nouvelle annonce de voiture.
     * POST /api/annonces?proprietaireId=1
     */
    @PostMapping
    public ResponseEntity<?> creerAnnonce(
            @RequestParam(required = false) Long proprietaireId,
            @RequestBody CreerAnnonceRequest request) {
        try {
            AnnonceResponse response = annonceService.creerAnnonce(proprietaireId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Récupère toutes les annonces d'un propriétaire.
     * GET /api/annonces/proprietaire/1
     */
    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<List<AnnonceResponse>> getAnnoncesProprietaire(
            @PathVariable Long proprietaireId) {
        List<AnnonceResponse> annonces = annonceService.getAnnoncesProprietaire(proprietaireId);
        return ResponseEntity.ok(annonces);
    }

    /**
     * Récupère une annonce par son ID.
     * GET /api/annonces/1
     */
    @GetMapping("/{voitureId}")
    public ResponseEntity<?> getAnnonceById(@PathVariable Long voitureId) {
        try {
            AnnonceResponse response = annonceService.getAnnonceById(voitureId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Récupère toutes les annonces disponibles.
     * GET /api/annonces
     */
    @GetMapping
    public ResponseEntity<List<AnnonceResponse>> getToutesLesAnnonces() {
        List<AnnonceResponse> annonces = annonceService.getToutesLesAnnonces();
        return ResponseEntity.ok(annonces);
    }

    /**
     * Supprime une annonce (soft delete).
     * DELETE /api/annonces/1?proprietaireId=1
     */
    @DeleteMapping("/{voitureId}")
    public ResponseEntity<?> supprimerAnnonce(
            @PathVariable Long voitureId,
            @RequestParam Long proprietaireId) {
        try {
            annonceService.supprimerAnnonce(voitureId, proprietaireId);
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
