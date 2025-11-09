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
     * Recherche d'annonces avec géolocalisation et filtres avancés.
     * POST /api/annonces/search
     *
     * Les coordonnées latitude/longitude sont calculées côté frontend à partir
     * de la localisation sélectionnée via l'API de géocodage.
     *
     * Exemple de payload JSON:
     * {
     *   "latitude": 48.8566,
     *   "longitude": 2.3522,
     *   "rayonKm": 10,
     *   "dateDebut": "2025-01-15",
     *   "dateFin": "2025-01-20",
     *   "marque": "Renault",
     *   "modele": "Clio",
     *   "typeCarburant": "Essence",
     *   "boiteVitesse": "Manuelle",
     *   "prixMin": 20,
     *   "prixMax": 100,
     *   "anneeMin": 2015,
     *   "anneeMax": 2024,
     *   "nbPlaces": 5,
     *   "climatisation": true,
     *   "triOption": "PRIX_ASC"
     * }
     *
     * Options de tri disponibles :
     * - DISTANCE_ASC : Distance croissante (par défaut si géolocalisation)
     * - PRIX_ASC : Prix croissant
     * - PRIX_DESC : Prix décroissant
     * - DATE_PUBLICATION_ASC : Date de publication ancienne → récente
     * - DATE_PUBLICATION_DESC : Date de publication récente → ancienne (par défaut)
     * - NB_AVIS_ASC : Nombre d'avis croissant
     * - NB_AVIS_DESC : Nombre d'avis décroissant
     */
    @PostMapping("/search")
    public ResponseEntity<List<AnnonceResponse>> rechercherAnnonces(
            @RequestBody com.partikar.annonces.dto.SearchAnnonceRequest request) {
        List<AnnonceResponse> annonces = annonceService.rechercherAnnonces(request);
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
