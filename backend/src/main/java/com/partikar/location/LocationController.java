package com.partikar.location;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Contrôleur REST pour la gestion des locations/réservations.
 */
@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    /**
     * Crée une nouvelle réservation de voiture.
     * POST /api/locations
     *
     * Exemple de payload JSON:
     * {
     *   "voitureId": 1,
     *   "dateDebut": "2025-01-15",
     *   "dateFin": "2025-01-20",
     *   "heureDebut": "10:00",
     *   "heureFin": "10:00"
     * }
     */
    @PostMapping
    public ResponseEntity<?> creerLocation(@RequestBody CreerLocationRequest request) {
        try {
            LocationResponse response = locationService.creerLocation(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Récupère toutes les locations d'un locataire.
     * GET /api/locations/locataire/1
     */
    @GetMapping("/locataire/{locataireId}")
    public ResponseEntity<List<Location>> getLocationsLocataire(@PathVariable Long locataireId) {
        List<Location> locations = locationService.getLocationsLocataire(locataireId);
        return ResponseEntity.ok(locations);
    }

    /**
     * Récupère toutes les locations d'un propriétaire.
     * GET /api/locations/proprietaire/1
     */
    @GetMapping("/proprietaire/{proprietaireId}")
    public ResponseEntity<List<Location>> getLocationsProprietaire(@PathVariable Long proprietaireId) {
        List<Location> locations = locationService.getLocationsProprietaire(proprietaireId);
        return ResponseEntity.ok(locations);
    }

    /**
     * Récupère une location par son ID.
     * GET /api/locations/1
     */
    @GetMapping("/{locationId}")
    public ResponseEntity<?> getLocationById(@PathVariable Long locationId) {
        try {
            Location location = locationService.getLocationById(locationId);
            return ResponseEntity.ok(location);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
        }
    }

    /**
     * Annule une location.
     * DELETE /api/locations/1?userId=1
     */
    @DeleteMapping("/{locationId}")
    public ResponseEntity<?> annulerLocation(
            @PathVariable Long locationId,
            @RequestParam Long userId) {
        try {
            locationService.annulerLocation(locationId, userId);
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

