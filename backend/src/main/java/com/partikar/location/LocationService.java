package com.partikar.location;

import com.partikar.disponibilite.Disponibilite;
import com.partikar.disponibilite.DisponibiliteRepository;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import com.partikar.voiture.Voiture;
import com.partikar.voiture.VoitureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Service pour gérer les réservations/locations de voitures.
 */
@Service
public class LocationService {

    private static final Logger logger = LoggerFactory.getLogger(LocationService.class);

    private final LocationRepository locationRepository;
    private final VoitureRepository voitureRepository;
    private final UserRepository userRepository;
    private final DisponibiliteRepository disponibiliteRepository;

    public LocationService(LocationRepository locationRepository,
                          VoitureRepository voitureRepository,
                          UserRepository userRepository,
                          DisponibiliteRepository disponibiliteRepository) {
        this.locationRepository = locationRepository;
        this.voitureRepository = voitureRepository;
        this.userRepository = userRepository;
        this.disponibiliteRepository = disponibiliteRepository;
    }

    /**
     * Crée une nouvelle réservation de voiture.
     * Vérifie la disponibilité et met à jour les disponibilités.
     *
     * @param request DTO contenant les informations de la réservation
     * @return LocationResponse avec les détails de la réservation créée
     */
    @Transactional
    public LocationResponse creerLocation(CreerLocationRequest request) {
        logger.info("Création d'une location: {}", request);

        // Validation des données
        if (request.getVoitureId() == null) {
            throw new RuntimeException("L'ID de la voiture est requis");
        }
        if (request.getDateDebut() == null || request.getDateFin() == null) {
            throw new RuntimeException("Les dates de début et de fin sont requises");
        }
        if (request.getDateFin().isBefore(request.getDateDebut())) {
            throw new RuntimeException("La date de fin doit être égale ou postérieure à la date de début");
        }

        // Récupérer la voiture
        Voiture voiture = voitureRepository.findById(request.getVoitureId())
                .orElseThrow(() -> new RuntimeException("Voiture introuvable avec l'ID: " + request.getVoitureId()));

        // Vérifier que la voiture est disponible
        if (!"disponible".equalsIgnoreCase(voiture.getStatut())) {
            throw new RuntimeException("Cette voiture n'est pas disponible pour la location");
        }

        // Récupérer le locataire (utilisateur authentifié ou via paramètre)
        User locataire;
        if (request.getLocataireId() != null) {
            locataire = userRepository.findById(request.getLocataireId())
                    .orElseThrow(() -> new RuntimeException("Locataire introuvable"));
        } else {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null) {
                throw new RuntimeException("Utilisateur non authentifié");
            }
            String email = auth.getName();
            locataire = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        }

        // Vérifier que le locataire n'est pas le propriétaire
        if (locataire.getId().equals(voiture.getProprietaire().getId())) {
            throw new RuntimeException("Vous ne pouvez pas louer votre propre voiture");
        }

        // Vérifier la disponibilité pour toute la période
        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voiture.getId());
        LocalDate current = request.getDateDebut();
        while (!current.isAfter(request.getDateFin())) {
            final LocalDate checkDate = current;
            boolean jourDisponible = disponibilites.stream()
                    .anyMatch(d -> d.getJour().equals(checkDate)
                        && d.getStatut() == Disponibilite.Statut.DISPONIBLE);

            if (!jourDisponible) {
                throw new RuntimeException("La voiture n'est pas disponible pour la date: " + checkDate);
            }
            current = current.plusDays(1);
        }

        // Calculer le nombre de jours et le prix total
        long nbJours = ChronoUnit.DAYS.between(request.getDateDebut(), request.getDateFin()) + 1;
        BigDecimal prixTotal = voiture.getPrixParJour().multiply(BigDecimal.valueOf(nbJours));

        // Créer la location
        Location location = new Location();
        location.setVoiture(voiture);
        location.setLocataire(locataire);
        location.setDateDebut(request.getDateDebut());
        location.setDateFin(request.getDateFin());
        location.setPrixTotal(prixTotal);
        location.setStatut("EN_ATTENTE"); // String au lieu d'enum
        location.setCreeLe(LocalDateTime.now());
        location.setMajLe(LocalDateTime.now());

        Location savedLocation = locationRepository.save(location);

        // Marquer les jours comme RESERVE
        current = request.getDateDebut();
        while (!current.isAfter(request.getDateFin())) {
            final LocalDate dateToUpdate = current;
            disponibilites.stream()
                    .filter(d -> d.getJour().equals(dateToUpdate))
                    .findFirst()
                    .ifPresent(d -> {
                        d.setStatut(Disponibilite.Statut.RESERVE);
                        disponibiliteRepository.save(d);
                    });
            current = current.plusDays(1);
        }

        logger.info("Location créée avec succès: ID={}", savedLocation.getId());

        // Construire la réponse
        LocationResponse response = new LocationResponse();
        response.setLocationId(savedLocation.getId());
        response.setVoitureId(voiture.getId());
        response.setVoitureMarque(voiture.getMarque());
        response.setVoitureModele(voiture.getModele());
        response.setLocataireId(locataire.getId());
        response.setLocataireNom(locataire.getNom());
        response.setLocatairePrenom(locataire.getPrenom());
        response.setProprietaireId(voiture.getProprietaire().getId());
        response.setProprietaireNom(voiture.getProprietaire().getNom());
        response.setProprietairePrenom(voiture.getProprietaire().getPrenom());
        response.setDateDebut(savedLocation.getDateDebut());
        response.setDateFin(savedLocation.getDateFin());
        response.setHeureDebut(request.getHeureDebut());
        response.setHeureFin(request.getHeureFin());
        response.setPrixTotal(savedLocation.getPrixTotal());
        response.setNbJours((int) nbJours);
        response.setStatut(savedLocation.getStatut());
        response.setCreeLe(savedLocation.getCreeLe());

        return response;
    }

    /**
     * Récupère toutes les locations d'un locataire.
     */
    @Transactional(readOnly = true)
    public List<Location> getLocationsLocataire(Long locataireId) {
        return locationRepository.findByLocataireId(locataireId);
    }

    /**
     * Récupère toutes les locations d'un propriétaire (via sa voiture).
     */
    @Transactional(readOnly = true)
    public List<Location> getLocationsProprietaire(Long proprietaireId) {
        return locationRepository.findByVoitureProprietaireId(proprietaireId);
    }

    /**
     * Récupère une location par son ID.
     */
    @Transactional(readOnly = true)
    public Location getLocationById(Long locationId) {
        return locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable avec l'ID: " + locationId));
    }

    /**
     * Annule une location (uniquement si statut EN_ATTENTE).
     */
    @Transactional
    public void annulerLocation(Long locationId, Long userId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        // Vérifier que l'utilisateur est le locataire ou le propriétaire
        boolean isLocataire = location.getLocataire().getId().equals(userId);
        boolean isProprietaire = location.getVoiture().getProprietaire().getId().equals(userId);

        if (!isLocataire && !isProprietaire) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler cette location");
        }

        // Vérifier le statut
        if (!"EN_ATTENTE".equals(location.getStatut())) {
            throw new RuntimeException("Cette location ne peut pas être annulée (statut: " + location.getStatut() + ")");
        }

        // Libérer les disponibilités
        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(location.getVoiture().getId());
        LocalDate current = location.getDateDebut();
        while (!current.isAfter(location.getDateFin())) {
            final LocalDate dateToUpdate = current;
            disponibilites.stream()
                    .filter(d -> d.getJour().equals(dateToUpdate))
                    .findFirst()
                    .ifPresent(d -> {
                        d.setStatut(Disponibilite.Statut.DISPONIBLE);
                        disponibiliteRepository.save(d);
                    });
            current = current.plusDays(1);
        }

        // Marquer la location comme annulée
        location.setStatut("ANNULEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        logger.info("Location annulée: ID={}", locationId);
    }
}

