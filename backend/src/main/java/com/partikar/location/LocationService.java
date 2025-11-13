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
    private final com.partikar.annonces.AnnonceService annonceService;
    private final com.partikar.avis.AvisRepository avisRepository;
    private final com.partikar.transaction.TransactionService transactionService;

    public LocationService(LocationRepository locationRepository,
                          VoitureRepository voitureRepository,
                          UserRepository userRepository,
                          DisponibiliteRepository disponibiliteRepository,
                          com.partikar.annonces.AnnonceService annonceService,
                          com.partikar.avis.AvisRepository avisRepository,
                          com.partikar.transaction.TransactionService transactionService) {
        this.locationRepository = locationRepository;
        this.voitureRepository = voitureRepository;
        this.userRepository = userRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.annonceService = annonceService;
        this.avisRepository = avisRepository;
        this.transactionService = transactionService;
    }

    /**
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

        // Vérifier qu'il n'y a pas déjà une demande EN_ATTENTE exactement identique
        // (même utilisateur + même voiture + même dateDebut + même dateFin)
        List<Location> demandesEnAttente = locationRepository.findByVoitureIdAndLocataireIdAndStatut(
                voiture.getId(), locataire.getId(), "EN_ATTENTE");

        for (Location demande : demandesEnAttente) {
            boolean memeDates = demande.getDateDebut().equals(request.getDateDebut())
                             && demande.getDateFin().equals(request.getDateFin());

            if (memeDates) {
                throw new RuntimeException("Vous avez déjà une demande de réservation en attente pour cette voiture avec exactement les mêmes dates");
            }
        }

        // Vérifier la disponibilité pour toute la période
        // Note : Les dates DISPONIBLES excluent déjà les réservations ACCEPTÉES
        // Les demandes EN_ATTENTE ne bloquent PAS les dates (plusieurs utilisateurs peuvent demander les mêmes dates)
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

        // Créer une transaction EN_ATTENTE pour suspendre les crédits
        try {
            transactionService.creerTransactionEnAttente(locataire, savedLocation, prixTotal);
        } catch (RuntimeException e) {
            // Si l'utilisateur n'a pas assez de crédits, supprimer la location
            locationRepository.delete(savedLocation);
            throw e;
        }

        // NE PAS marquer les jours comme RESERVE pour une demande EN_ATTENTE
        // Les dates seront réservées uniquement lors de l'ACCEPTATION de la demande
        // Cela permet à plusieurs utilisateurs de demander les mêmes dates

        logger.info("Demande de location créée avec succès: ID={}, statut=EN_ATTENTE", savedLocation.getId());

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

        // Pour une demande EN_ATTENTE, pas besoin de libérer les disponibilités
        // car elles n'ont jamais été réservées

        // Marquer la location comme annulée
        location.setStatut("ANNULEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        logger.info("Demande de location annulée: ID={}", locationId);
    }

    /**
     * Récupère les demandes de réservation en attente pour le propriétaire authentifié.
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getDemandesEnAttenteProprietaire() {
        // Récupérer l'utilisateur authentifié
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User proprietaire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Récupérer toutes les locations en attente pour les voitures du propriétaire
        List<Location> locations = locationRepository.findAll().stream()
                .filter(l -> l.getVoiture().getProprietaire().getId().equals(proprietaire.getId()))
                .filter(l -> "EN_ATTENTE".equals(l.getStatut()))
                .toList();

        // Transformer en LocationResponse
        return locations.stream()
                .map(this::toLocationResponse)
                .toList();
    }

    /**
     * Récupère toutes les demandes de réservation du locataire authentifié (quel que soit le statut).
     */
    @Transactional(readOnly = true)
    public List<LocationResponse> getMesDemandesReservation() {
        // Récupérer l'utilisateur authentifié
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User locataire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Récupérer toutes les locations du locataire
        List<Location> locations = locationRepository.findAll().stream()
                .filter(l -> l.getLocataire().getId().equals(locataire.getId()))
                .toList();

        // Transformer en LocationResponse
        return locations.stream()
                .map(this::toLocationResponse)
                .toList();
    }

    /**
     * Valide (accepte) une demande de réservation.
     */
    @Transactional
    public void validerReservation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        // Vérifier que l'utilisateur est le propriétaire
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User proprietaire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!location.getVoiture().getProprietaire().getId().equals(proprietaire.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à valider cette réservation");
        }

        // Vérifier le statut
        if (!"EN_ATTENTE".equals(location.getStatut())) {
            throw new RuntimeException("Cette réservation ne peut pas être validée (statut: " + location.getStatut() + ")");
        }

        // Marquer les dates comme RESERVE lors de l'acceptation
        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(location.getVoiture().getId());
        LocalDate current = location.getDateDebut();
        while (!current.isAfter(location.getDateFin())) {
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

        // Mettre à jour le statut
        location.setStatut("CONFIRMEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        // Supprimer automatiquement les autres demandes EN_ATTENTE qui se chevauchent avec les dates acceptées
        List<Location> autresDemandesEnAttente = locationRepository.findByVoitureIdAndStatut(
                location.getVoiture().getId(), "EN_ATTENTE");

        for (Location autreDemande : autresDemandesEnAttente) {
            // Vérifier si les dates se chevauchent
            boolean seChevauche = !(autreDemande.getDateFin().isBefore(location.getDateDebut()) ||
                                   autreDemande.getDateDebut().isAfter(location.getDateFin()));

            if (seChevauche) {
                // Annuler cette demande car elle chevauche avec la réservation acceptée
                autreDemande.setStatut("ANNULEE");
                autreDemande.setMajLe(LocalDateTime.now());
                locationRepository.save(autreDemande);

                // Annuler la transaction associée pour libérer les crédits suspendus
                try {
                    transactionService.annulerTransaction(autreDemande.getId());
                } catch (Exception e) {
                    logger.warn("Erreur lors de l'annulation de la transaction pour la demande ID={}: {}",
                               autreDemande.getId(), e.getMessage());
                }

                logger.info("Demande EN_ATTENTE ID={} automatiquement annulée car elle chevauche avec la réservation acceptée ID={}",
                           autreDemande.getId(), locationId);
            }
        }

        // Confirmer la transaction : débiter le locataire et créditer le propriétaire
        transactionService.confirmerTransaction(location.getId());

        // Mettre à jour le statut de la voiture
        annonceService.mettreAJourStatutVoiture(location.getVoiture().getId());

        logger.info("Location validée et dates réservées: ID={}", locationId);
    }

    /**
     * Annule une réservation (utilisé par le propriétaire pour refuser une demande).
     */
    @Transactional
    public void annulerReservationProprietaire(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        // Vérifier que l'utilisateur est le propriétaire
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
        // Annuler la transaction EN_ATTENTE pour libérer les crédits suspendus
        transactionService.annulerTransaction(location.getId());

            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User proprietaire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!location.getVoiture().getProprietaire().getId().equals(proprietaire.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler cette réservation");
        }

        // Vérifier le statut
        if (!"EN_ATTENTE".equals(location.getStatut())) {
            throw new RuntimeException("Cette réservation ne peut pas être annulée (statut: " + location.getStatut() + ")");
        }

        // Pour une demande EN_ATTENTE, pas besoin de libérer les disponibilités
        // car elles n'ont jamais été réservées

        // Marquer la location comme annulée
        location.setStatut("ANNULEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        logger.info("Demande de location refusée par le propriétaire: ID={}", locationId);
    }

    /**
     * Annule une demande de réservation (utilisé par le locataire pour annuler sa propre demande).
     */
    @Transactional
    public void annulerDemandeLocataire(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        // Vérifier que l'utilisateur est le locataire
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User locataire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!location.getLocataire().getId().equals(locataire.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à annuler cette demande");
        }

        // Vérifier le statut
        if (!"EN_ATTENTE".equals(location.getStatut())) {
            throw new RuntimeException("Cette demande ne peut pas être annulée (statut: " + location.getStatut() + ")");
        }

        // Pour une demande EN_ATTENTE, pas besoin de libérer les disponibilités
        // car elles n'ont jamais été réservées

        // Annuler la transaction EN_ATTENTE pour libérer les crédits suspendus
        transactionService.annulerTransaction(location.getId());

        // Marquer la location comme annulée
        location.setStatut("ANNULEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        logger.info("Demande de location annulée par le locataire: ID={}", locationId);
    }

    /**
     * Convertit une Location en LocationResponse.
     */
    private LocationResponse toLocationResponse(Location location) {
        LocationResponse response = new LocationResponse();
        response.setLocationId(location.getId());
        response.setVoitureId(location.getVoiture().getId());
        response.setVoitureMarque(location.getVoiture().getMarque());
        response.setVoitureModele(location.getVoiture().getModele());
        response.setLocataireId(location.getLocataire().getId());
        response.setLocataireNom(location.getLocataire().getNom());
        response.setLocatairePrenom(location.getLocataire().getPrenom());

        // Calculer la note moyenne et le nombre d'avis du locataire
        List<com.partikar.avis.Avis> avisLocataire = avisRepository.findByCibleId(location.getLocataire().getId());
        if (!avisLocataire.isEmpty()) {
            double moyenne = avisLocataire.stream()
                .mapToInt(com.partikar.avis.Avis::getNoteUtilisateur)
                .average()
                .orElse(0.0);
            response.setLocataireMoyenneAvis(moyenne);
            response.setLocataireNbAvis(avisLocataire.size());
        } else {
            response.setLocataireMoyenneAvis(null);
            response.setLocataireNbAvis(0);
        }

        response.setDateDebut(location.getDateDebut());
        response.setDateFin(location.getDateFin());
        response.setPrixTotal(location.getPrixTotal());
        response.setStatut(location.getStatut());
        response.setCreeLe(location.getCreeLe());
        return response;
    }

    /**
     * Récupère les réservations du locataire authentifié (en cours et passées).
     */
    @Transactional(readOnly = true)
    public MesReservationsResponse getMesReservations() {
        // Récupérer l'utilisateur authentifié
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User locataire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Récupérer toutes les réservations CONFIRMEES du locataire
        List<Location> reservations = locationRepository.findByLocataireId(locataire.getId()).stream()
                .filter(l -> "CONFIRMEE".equals(l.getStatut()) || "TERMINEE".equals(l.getStatut()))
                .toList();

        LocalDate aujourdhui = LocalDate.now();

        // Séparer en cours et passées
        List<LocationResponse> enCours = reservations.stream()
                .filter(l -> "CONFIRMEE".equals(l.getStatut()))
                .filter(l -> !l.getDateFin().isBefore(aujourdhui))
                .map(this::toLocationResponseAvecProprio)
                .toList();

        List<LocationResponse> passees = reservations.stream()
                .filter(l -> "TERMINEE".equals(l.getStatut()) ||
                            ("CONFIRMEE".equals(l.getStatut()) && l.getDateFin().isBefore(aujourdhui)))
                .map(this::toLocationResponseAvecProprio)
                .toList();

        MesReservationsResponse response = new MesReservationsResponse();
        response.setEnCours(enCours);
        response.setPassees(passees);
        return response;
    }

    /**
     * Récupère les locations du propriétaire authentifié (en cours et passées).
     */
    @Transactional(readOnly = true)
    public MesReservationsResponse getMesLocations() {
        // Récupérer l'utilisateur authentifié
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User proprietaire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        // Récupérer toutes les locations CONFIRMEES pour les voitures du propriétaire
        List<Location> locations = locationRepository.findByVoitureProprietaireId(proprietaire.getId()).stream()
                .filter(l -> "CONFIRMEE".equals(l.getStatut()) || "TERMINEE".equals(l.getStatut()))
                .toList();

        LocalDate aujourdhui = LocalDate.now();

        // Séparer en cours et passées
        List<LocationResponse> enCours = locations.stream()
                .filter(l -> "CONFIRMEE".equals(l.getStatut()))
                .filter(l -> !l.getDateFin().isBefore(aujourdhui))
                .map(this::toLocationResponse)
                .toList();

        List<LocationResponse> passees = locations.stream()
                .filter(l -> "TERMINEE".equals(l.getStatut()) ||
                            ("CONFIRMEE".equals(l.getStatut()) && l.getDateFin().isBefore(aujourdhui)))
                .map(this::toLocationResponse)
                .toList();

        MesReservationsResponse response = new MesReservationsResponse();
        response.setEnCours(enCours);
        response.setPassees(passees);
        return response;
    }

    /**
     * Marque une réservation comme terminée (uniquement par le locataire).
     */
    @Transactional
    public void terminerReservation(Long locationId) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new RuntimeException("Location introuvable"));

        // Vérifier que l'utilisateur est le locataire
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User locataire = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (!location.getLocataire().getId().equals(locataire.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à terminer cette réservation");
        }

        // Vérifier le statut
        if (!"CONFIRMEE".equals(location.getStatut())) {
            throw new RuntimeException("Cette réservation ne peut pas être terminée (statut: " + location.getStatut() + ")");
        }

        // Marquer comme terminée
        location.setStatut("TERMINEE");
        location.setMajLe(LocalDateTime.now());
        locationRepository.save(location);

        logger.info("Réservation terminée: ID={}", locationId);
    }

    /**
     * Convertit une Location en LocationResponse avec les infos du propriétaire.
     */
    private LocationResponse toLocationResponseAvecProprio(Location location) {
        LocationResponse response = toLocationResponse(location);
        response.setProprietaireId(location.getVoiture().getProprietaire().getId());
        response.setProprietaireNom(location.getVoiture().getProprietaire().getNom());
        response.setProprietairePrenom(location.getVoiture().getProprietaire().getPrenom());
        return response;
    }
}

