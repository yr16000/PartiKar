package com.partikar.annonces;

import com.partikar.disponibilite.Disponibilite;
import com.partikar.disponibilite.DisponibiliteRepository;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import com.partikar.annonces.dto.AnnonceResponse;
import com.partikar.annonces.dto.CreerAnnonceRequest;
import com.partikar.voiture.Voiture;
import com.partikar.voiture.VoitureRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gérer les annonces de voitures.
 * Gère la création, modification et consultation des annonces.
 */
@Service
public class AnnonceService {

    private static final Logger logger = LoggerFactory.getLogger(AnnonceService.class);

    private final VoitureRepository voitureRepository;
    private final DisponibiliteRepository disponibiliteRepository;
    private final UserRepository userRepository;
    private final com.partikar.avis.AvisRepository avisRepository;

    public AnnonceService(VoitureRepository voitureRepository,
                          DisponibiliteRepository disponibiliteRepository,
                          UserRepository userRepository,
                          com.partikar.avis.AvisRepository avisRepository) {
        this.voitureRepository = voitureRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.userRepository = userRepository;
        this.avisRepository = avisRepository;
    }

    /**
     * Crée une nouvelle annonce de voiture avec ses disponibilités.
     *
     * @param proprietaireId ID du propriétaire de la voiture (optionnel si utilisateur authentifié)
     * @param request DTO contenant toutes les informations de l'annonce
     * @return La réponse avec les détails de la voiture créée
     * @throws RuntimeException si le propriétaire n'existe pas ou si les données sont invalides
     */
    @Transactional
    public AnnonceResponse creerAnnonce(Long proprietaireId, com.partikar.annonces.dto.CreerAnnonceRequest request) {
        try {
            // LOG : dump léger du payload utile pour debug
            logger.info("Création annonce payload: immatriculation={}, marque={}, modele={}, typeCarburant={}, boiteVitesse={}, prixParJour={}",
                    request.getImmatriculation(), request.getMarque(), request.getModele(), request.getTypeCarburant(), request.getBoiteVitesse(), request.getPrixParJour());

            // Validation explicite : carburant non null
            if (request.getTypeCarburant() == null || request.getTypeCarburant().trim().isEmpty()) {
                throw new RuntimeException("Le champ 'typeCarburant' est requis (ESSENCE, DIESEL, ELECTRIQUE, HYBRIDE)");
            }

            // Normalisation du carburant
            String carburantNormalized = request.getTypeCarburant().trim().toUpperCase();
            request.setTypeCarburant(carburantNormalized);

            // Récupérer le propriétaire : soit via le paramètre, soit via l'utilisateur authentifié
            User proprietaire;
            if (proprietaireId != null) {
                proprietaire = userRepository.findById(proprietaireId)
                        .orElseThrow(() -> new RuntimeException("Propriétaire introuvable avec l'ID: " + proprietaireId));
            } else {
                Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                if (auth == null || auth.getName() == null) {
                    throw new RuntimeException("Utilisateur non authentifié");
                }
                String email = auth.getName();
                proprietaire = userRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Propriétaire introuvable pour l'utilisateur authentifié"));
            }

            // Validation : vérifier que l'immatriculation n'existe pas pour une voiture ACTIVE
            // On peut réutiliser une immatriculation UNIQUEMENT si l'ancienne voiture est "inactive" ou "expiree"
            if (request.getImmatriculation() != null) {
                List<Voiture> voituresAvecMemeImmat = voitureRepository.findAll().stream()
                    .filter(v -> v.getImmatriculation() != null
                        && v.getImmatriculation().equalsIgnoreCase(request.getImmatriculation()))
                    .toList();

                // Vérifier s'il existe des voitures actives avec cette immatriculation
                boolean immatExisteActive = voituresAvecMemeImmat.stream()
                    .anyMatch(v -> !"inactive".equalsIgnoreCase(v.getStatut())
                        && !"expiree".equalsIgnoreCase(v.getStatut()));

                if (immatExisteActive) {
                    throw new RuntimeException("Une voiture active avec cette immatriculation existe déjà");
                }

                // Limiter à maximum 1 voiture inactive/expirée avec la même immatriculation
                // (pour éviter d'avoir 100 voitures inactives avec la même plaque)
                long nbInactives = voituresAvecMemeImmat.stream()
                    .filter(v -> "inactive".equalsIgnoreCase(v.getStatut())
                        || "expiree".equalsIgnoreCase(v.getStatut()))
                    .count();

                if (nbInactives > 0) {
                    logger.warn("Réutilisation de l'immatriculation {} (ancienne voiture inactive/expirée)",
                        request.getImmatriculation());
                }
            }

            // Validation : kilométrage
            if (request.getKilometrage() == null || request.getKilometrage() < 0) {
                throw new RuntimeException("Le champ 'kilometrage' est obligatoire et doit être >= 0");
            }

            // Création de la voiture
            Voiture voiture = new Voiture();
            voiture.setProprietaire(proprietaire);
            voiture.setMarque(request.getMarque());
            voiture.setModele(request.getModele());
            voiture.setAnnee(request.getAnnee());
            voiture.setCouleur(request.getCouleur());
            voiture.setImmatriculation(request.getImmatriculation());
            voiture.setTypeCarburant(request.getTypeCarburant());
            voiture.setNbPlaces(request.getNbPlaces());
            voiture.setDescription(request.getDescription());
            voiture.setImageUrl(request.getImageUrl());
            voiture.setKilometrage(request.getKilometrage());
            voiture.setStatut("disponible"); // Statut initial
            voiture.setPrixParJour(request.getPrixParJour());
            voiture.setKilometrage(request.getKilometrage());

            // Conversion de la boîte de vitesse
            if (request.getBoiteVitesse() == null) {
                throw new RuntimeException("Le champ 'boiteVitesse' est requis (MANUELLE ou AUTOMATIQUE)");
            }
            try {
                voiture.setBoiteVitesse(Voiture.BoiteVitesse.valueOf(request.getBoiteVitesse().toUpperCase().trim()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Boîte de vitesse invalide. Valeurs acceptées: MANUELLE, AUTOMATIQUE");
            }

            voiture.setClimatisation(request.getClimatisation());
            voiture.setLocalisation(request.getLocalisation());
            voiture.setLatitude(request.getLatitude());
            voiture.setLongitude(request.getLongitude());
            voiture.setCreeLe(LocalDateTime.now());
            voiture.setMajLe(LocalDateTime.now());

            // Sauvegarde de la voiture
            Voiture voitureSauvegardee = voitureRepository.save(voiture);

            // Création des disponibilités
            int nbJoursDisponibles = 0;

            // Si la liste de disponibilités explicite est fournie, l'utiliser en priorité
            if (request.getDisponibilites() != null && !request.getDisponibilites().isEmpty()) {
                for (CreerAnnonceRequest.DisponibiliteDTO dispoDTO : request.getDisponibilites()) {
                    Disponibilite dispo = new Disponibilite();
                    dispo.setVoiture(voitureSauvegardee);
                    dispo.setJour(dispoDTO.getJour());
                    dispo.setStatut(Disponibilite.Statut.DISPONIBLE);
                    dispo.setPrixSpecifique(dispoDTO.getPrixSpecifique());

                    disponibiliteRepository.save(dispo);
                    nbJoursDisponibles++;
                }
            } else if (request.getDateDebut() != null && request.getDateFin() != null) {
                LocalDate debut = request.getDateDebut();
                LocalDate fin = request.getDateFin();
                if (fin.isBefore(debut)) {
                    throw new RuntimeException("dateFin doit être égale ou postérieure à dateDebut");
                }
                LocalDate cur = debut;
                while (!cur.isAfter(fin)) {
                    Disponibilite dispo = new Disponibilite();
                    dispo.setVoiture(voitureSauvegardee);
                    dispo.setJour(cur);
                    dispo.setStatut(Disponibilite.Statut.DISPONIBLE);
                    dispo.setPrixSpecifique(null);

                    disponibiliteRepository.save(dispo);
                    nbJoursDisponibles++;
                    cur = cur.plusDays(1);
                }
            }

            return AnnonceResponse.fromVoiture(voitureSauvegardee, nbJoursDisponibles);
        } catch (Exception ex) {
            // Log complet et renvoyer un message lisible pour le frontend
            ex.printStackTrace();
            throw new RuntimeException("Erreur création annonce: " + ex.toString());
        }
    }

    /**
     * Récupère toutes les annonces d'un propriétaire.
     *
     * @param proprietaireId ID du propriétaire
     * @return Liste des annonces du propriétaire
     */
    @Transactional(readOnly = true)
    public List<AnnonceResponse> getAnnoncesProprietaire(Long proprietaireId) {
        List<Voiture> voitures = voitureRepository.findByProprietaireId(proprietaireId);

        return voitures.stream()
                .map(voiture -> {
                    int nbJours = disponibiliteRepository.findByVoitureId(voiture.getId()).size();
                    AnnonceResponse response = AnnonceResponse.fromVoiture(voiture, nbJours);
                    enrichirAvecNoteProprietaire(response);
                    return response;
                })
                .collect(Collectors.toList());
    }

    /**
     * Récupère une annonce par son ID.
     *
     * @param voitureId ID de la voiture
     * @return L'annonce correspondante
     */
    @Transactional(readOnly = true)
    public AnnonceResponse getAnnonceById(Long voitureId) {
        Voiture voiture = voitureRepository.findById(voitureId)
                .orElseThrow(() -> new RuntimeException("Voiture introuvable avec l'ID: " + voitureId));

        int nbJours = disponibiliteRepository.findByVoitureId(voiture.getId()).size();
        AnnonceResponse response = AnnonceResponse.fromVoiture(voiture, nbJours);
        enrichirAvecNoteProprietaire(response);
        return response;
    }

    /**
     * Récupère toutes les annonces (pour la page d'accueil).
     * Masque les annonces complètement réservées (nbJoursDisponibles == 0).
     *
     * @return Liste de toutes les annonces
     */
    @Transactional(readOnly = true)
    public List<AnnonceResponse> getToutesLesAnnonces() {
        List<Voiture> voitures = voitureRepository.findAll();

        return voitures.stream()
                .filter(v -> "disponible".equalsIgnoreCase(v.getStatut()))
                .map(voiture -> {
                    // Compter uniquement les jours DISPONIBLES (pas les jours RESERVE)
                    int nbJoursDisponibles = (int) disponibiliteRepository.findByVoitureId(voiture.getId()).stream()
                            .filter(d -> d.getStatut() == Disponibilite.Statut.DISPONIBLE)
                            .count();
                    AnnonceResponse response = AnnonceResponse.fromVoiture(voiture, nbJoursDisponibles);
                    enrichirAvecNoteProprietaire(response);
                    return response;
                })
                // Masquer les annonces complètement réservées UNIQUEMENT sur l'accueil
                .filter(response -> response.getNbJoursDisponibles() > 0)
                .collect(Collectors.toList());
    }

    /**
     * Supprime une annonce (soft delete en changeant le statut).
     *
     * @param voitureId ID de la voiture
     * @param proprietaireId ID du propriétaire (pour vérification)
     */
    @Transactional
    public void supprimerAnnonce(Long voitureId, Long proprietaireId) {
        Voiture voiture = voitureRepository.findById(voitureId)
                .orElseThrow(() -> new RuntimeException("Voiture introuvable"));

        // Vérification que l'utilisateur est bien le propriétaire
        if (!voiture.getProprietaire().getId().equals(proprietaireId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette annonce");
        }

        // Soft delete : on change juste le statut
        voiture.setStatut("inactive");
        voiture.setMajLe(LocalDateTime.now());
        voitureRepository.save(voiture);
    }

    /**
     * Recherche d'annonces avec géolocalisation et filtres avancés.
     * Utilise la formule de Haversine pour calculer la distance entre deux points GPS.
     *
     * @param request DTO contenant les critères de recherche (tous optionnels)
     * @return Liste des annonces correspondant aux critères, triées par distance si géolocalisation activée
     */
    @Transactional(readOnly = true)
    public List<AnnonceResponse> rechercherAnnonces(com.partikar.annonces.dto.SearchAnnonceRequest request) {
        logger.info("Recherche d'annonces avec critères: {}", request);

        List<Voiture> voitures = voitureRepository.findAll();

        return voitures.stream()
                // Filtrer uniquement les annonces disponibles
                .filter(v -> "disponible".equalsIgnoreCase(v.getStatut()))

                // Filtre géographique (rayon autour de la ville sélectionnée)
                .filter(v -> {
                    if (request.getLatitude() != null && request.getLongitude() != null) {
                        if (v.getLatitude() == null || v.getLongitude() == null) {
                            logger.debug("Voiture {} exclue: pas de coordonnées GPS", v.getId());
                            return false;
                        }
                        double distance = calculerDistance(
                                request.getLatitude(), request.getLongitude(),
                                v.getLatitude().doubleValue(), v.getLongitude().doubleValue()
                        );
                        boolean dansRayon = distance <= request.getRayonKm();
                        if (!dansRayon) {
                            logger.debug("Voiture {} exclue: distance {}km > rayon {}km",
                                    v.getId(), String.format("%.1f", distance), request.getRayonKm());
                        }
                        return dansRayon;
                    }
                    return true; // Pas de filtre géographique
                })

                // Filtre marque (insensible à la casse)
                .filter(v -> {
                    if (request.getMarque() == null || request.getMarque().trim().isEmpty()) {
                        return true;
                    }
                    return v.getMarque() != null &&
                            v.getMarque().toLowerCase().contains(request.getMarque().toLowerCase().trim());
                })

                // Filtre modèle (insensible à la casse)
                .filter(v -> {
                    if (request.getModele() == null || request.getModele().trim().isEmpty()) {
                        return true;
                    }
                    return v.getModele() != null &&
                            v.getModele().toLowerCase().contains(request.getModele().toLowerCase().trim());
                })

                // Filtre type de carburant
                .filter(v -> {
                    if (request.getTypeCarburant() == null || request.getTypeCarburant().trim().isEmpty()) {
                        return true;
                    }
                    return v.getTypeCarburant() != null &&
                            v.getTypeCarburant().equalsIgnoreCase(request.getTypeCarburant());
                })

                // Filtre boîte de vitesse
                .filter(v -> {
                    if (request.getBoiteVitesse() == null || request.getBoiteVitesse().trim().isEmpty()) {
                        return true;
                    }
                    return v.getBoiteVitesse() != null &&
                            v.getBoiteVitesse().name().equalsIgnoreCase(request.getBoiteVitesse());
                })

                // Filtre nombre de places
                .filter(v -> {
                    if (request.getNbPlaces() == null) {
                        return true;
                    }
                    return v.getNbPlaces() != null && v.getNbPlaces().equals(request.getNbPlaces());
                })

                // Filtre prix minimum
                .filter(v -> {
                    if (request.getPrixMin() == null) {
                        return true;
                    }
                    return v.getPrixParJour() != null &&
                            v.getPrixParJour().doubleValue() >= request.getPrixMin();
                })

                // Filtre prix maximum
                .filter(v -> {
                    if (request.getPrixMax() == null) {
                        return true;
                    }
                    return v.getPrixParJour() != null &&
                            v.getPrixParJour().doubleValue() <= request.getPrixMax();
                })

                // Filtre année minimum
                .filter(v -> {
                    if (request.getAnneeMin() == null) {
                        return true;
                    }
                    return v.getAnnee() != null && v.getAnnee() >= request.getAnneeMin();
                })

                // Filtre année maximum
                .filter(v -> {
                    if (request.getAnneeMax() == null) {
                        return true;
                    }
                    return v.getAnnee() != null && v.getAnnee() <= request.getAnneeMax();
                })

                // Filtre climatisation
                .filter(v -> {
                    if (request.getClimatisation() == null) {
                        return true;
                    }
                    return v.getClimatisation() != null &&
                            v.getClimatisation().equals(request.getClimatisation());
                })

                // Filtre disponibilité (si dates fournies)
                .filter(v -> {
                    if (request.getDateDebut() != null && request.getDateFin() != null) {
                        boolean disponible = verifierDisponibilite(v.getId(), request.getDateDebut(), request.getDateFin());
                        if (!disponible) {
                            logger.debug("Voiture {} exclue: non disponible pour la période demandée", v.getId());
                        }
                        return disponible;
                    }
                    return true; // Pas de filtre de dates
                })

                // Transformer en AnnonceResponse et ajouter la distance + nb avis
                .map(voiture -> {
                    // Compter uniquement les jours DISPONIBLES (pas les jours RESERVE)
                    int nbJoursDisponibles = (int) disponibiliteRepository.findByVoitureId(voiture.getId()).stream()
                            .filter(d -> d.getStatut() == Disponibilite.Statut.DISPONIBLE)
                            .count();
                    AnnonceResponse response = AnnonceResponse.fromVoiture(voiture, nbJoursDisponibles);

                    // Enrichir avec la note du propriétaire
                    enrichirAvecNoteProprietaire(response);

                    // Calculer et ajouter la distance si géolocalisation activée
                    if (request.getLatitude() != null && request.getLongitude() != null
                            && voiture.getLatitude() != null && voiture.getLongitude() != null) {
                        double distance = calculerDistance(
                                request.getLatitude(), request.getLongitude(),
                                voiture.getLatitude().doubleValue(), voiture.getLongitude().doubleValue()
                        );
                        response.setDistanceKm(distance);
                    }

                    // Ajouter le nombre d'avis pour cette voiture
                    long nbAvis = avisRepository.countByCibleId(voiture.getId());
                    response.setNbAvis((int) nbAvis);

                    return response;
                })

                // Masquer les annonces complètement réservées
                .filter(response -> response.getNbJoursDisponibles() > 0)

                // Appliquer le tri selon l'option choisie
                .sorted(getComparator(request))

                .collect(Collectors.toList());
    }

    /**
     * Retourne le comparateur approprié selon l'option de tri demandée.
     * Si aucune option n'est spécifiée, tri par distance si géolocalisation activée,
     * sinon par date de publication décroissante (plus récent en premier).
     *
     * @param request Requête de recherche contenant l'option de tri
     * @return Comparateur pour trier les annonces
     */
    private java.util.Comparator<AnnonceResponse> getComparator(com.partikar.annonces.dto.SearchAnnonceRequest request) {
        com.partikar.annonces.dto.TriOption triOption = request.getTriOption();

        // Si pas d'option de tri spécifiée, utiliser le tri par défaut
        if (triOption == null) {
            // Si géolocalisation activée, trier par distance
            if (request.getLatitude() != null && request.getLongitude() != null) {
                triOption = com.partikar.annonces.dto.TriOption.DISTANCE_ASC;
            } else {
                // Sinon, trier par date de publication décroissante (plus récent en premier)
                triOption = com.partikar.annonces.dto.TriOption.DATE_PUBLICATION_DESC;
            }
        }

        switch (triOption) {
            case DISTANCE_ASC:
                return (a, b) -> {
                    if (a.getDistanceKm() != null && b.getDistanceKm() != null) {
                        return Double.compare(a.getDistanceKm(), b.getDistanceKm());
                    }
                    return 0;
                };

            case PRIX_ASC:
                return (a, b) -> {
                    if (a.getPrixParJour() != null && b.getPrixParJour() != null) {
                        return a.getPrixParJour().compareTo(b.getPrixParJour());
                    }
                    return 0;
                };

            case PRIX_DESC:
                return (a, b) -> {
                    if (a.getPrixParJour() != null && b.getPrixParJour() != null) {
                        return b.getPrixParJour().compareTo(a.getPrixParJour());
                    }
                    return 0;
                };

            case DATE_PUBLICATION_ASC:
                return (a, b) -> {
                    if (a.getCreeLe() != null && b.getCreeLe() != null) {
                        return a.getCreeLe().compareTo(b.getCreeLe());
                    }
                    return 0;
                };

            case DATE_PUBLICATION_DESC:
                return (a, b) -> {
                    if (a.getCreeLe() != null && b.getCreeLe() != null) {
                        return b.getCreeLe().compareTo(a.getCreeLe());
                    }
                    return 0;
                };

            case NB_AVIS_ASC:
                return (a, b) -> {
                    if (a.getNbAvis() != null && b.getNbAvis() != null) {
                        return Integer.compare(a.getNbAvis(), b.getNbAvis());
                    }
                    return 0;
                };

            case NB_AVIS_DESC:
                return (a, b) -> {
                    if (a.getNbAvis() != null && b.getNbAvis() != null) {
                        return Integer.compare(b.getNbAvis(), a.getNbAvis());
                    }
                    return 0;
                };

            default:
                return (a, b) -> 0; // Pas de tri
        }
    }

    /**
     * Calcule la distance entre deux points GPS en utilisant la formule de Haversine.
     * Cette formule permet de calculer la distance orthodromique (plus courte distance)
     * entre deux points sur une sphère à partir de leurs coordonnées GPS.
     *
     * @param lat1 Latitude du point 1 (en degrés)
     * @param lon1 Longitude du point 1 (en degrés)
     * @param lat2 Latitude du point 2 (en degrés)
     * @param lon2 Longitude du point 2 (en degrés)
     * @return Distance en kilomètres
     */
    private double calculerDistance(double lat1, double lon1, double lat2, double lon2) {
        final int RAYON_TERRE_KM = 6371; // Rayon moyen de la Terre en kilomètres

        // Conversion des degrés en radians
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        // Formule de Haversine
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return RAYON_TERRE_KM * c;
    }

    /**
     * Vérifie si une voiture est disponible pour une période donnée.
     * Tous les jours de la période doivent avoir le statut DISPONIBLE.
     *
     * @param voitureId ID de la voiture
     * @param dateDebut Date de début de la période
     * @param dateFin Date de fin de la période
     * @return true si la voiture est disponible pour toute la période, false sinon
     */
    private boolean verifierDisponibilite(Long voitureId, LocalDate dateDebut, LocalDate dateFin) {
        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voitureId);

        // Vérifier chaque jour de la période
        LocalDate current = dateDebut;
        while (!current.isAfter(dateFin)) {
            final LocalDate checkDate = current;
            boolean jourDisponible = disponibilites.stream()
                    .anyMatch(d -> d.getJour().equals(checkDate)
                            && d.getStatut() == Disponibilite.Statut.DISPONIBLE);

            if (!jourDisponible) {
                return false; // Au moins un jour n'est pas disponible
            }
            current = current.plusDays(1);
        }
        return true; // Tous les jours sont disponibles
    }

    /**
     * Récupère les annonces du propriétaire authentifié via le SecurityContext.
     */
    @Transactional(readOnly = true)
    public List<AnnonceResponse> getAnnoncesUtilisateurCourant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));
        return getAnnoncesProprietaire(user.getId());
    }

    /**
     * Met à jour une annonce existante. Seuls les champs non-nuls dans le DTO sont pris en compte.
     *
     * @param voitureId ID de la voiture à mettre à jour
     * @param request DTO contenant les nouvelles valeurs des champs
     * @return La réponse avec les détails de la voiture mise à jour
     * @throws RuntimeException si la voiture n'existe pas ou si l'utilisateur n'est pas le propriétaire
     */
    @Transactional
    public com.partikar.annonces.dto.AnnonceResponse mettreAJourAnnonce(Long voitureId, com.partikar.annonces.dto.UpdateAnnonceRequest request) {
        // Récupère la voiture
        com.partikar.voiture.Voiture v = voitureRepository.findById(voitureId)
                .orElseThrow(() -> new RuntimeException("Voiture introuvable"));

        // Vérifie propriétaire
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur authentifié introuvable"));
        if (!v.getProprietaire().getId().equals(user.getId())) {
            throw new RuntimeException("Accès refusé: vous n'êtes pas le propriétaire de cette annonce");
        }

        // Applique uniquement les champs non-nuls
        if (request.getMarque() != null) v.setMarque(request.getMarque());
        if (request.getModele() != null) v.setModele(request.getModele());
        if (request.getAnnee() != null) v.setAnnee(request.getAnnee());
        if (request.getCouleur() != null) v.setCouleur(request.getCouleur());
        if (request.getImmatriculation() != null) {
            // vérifie unicité si l'immatriculation change
            String newImmat = request.getImmatriculation();
            boolean exists = voitureRepository.findAll().stream()
                    .anyMatch(vo -> vo.getId() != v.getId() && newImmat.equalsIgnoreCase(vo.getImmatriculation()));
            if (exists) throw new RuntimeException("Immatriculation déjà utilisée");
            v.setImmatriculation(newImmat);
        }
        if (request.getTypeCarburant() != null) v.setTypeCarburant(request.getTypeCarburant());
        if (request.getNbPlaces() != null) v.setNbPlaces(request.getNbPlaces());
        if (request.getDescription() != null) v.setDescription(request.getDescription());
        if (request.getImageUrl() != null) v.setImageUrl(request.getImageUrl());
        if (request.getPrixParJour() != null) v.setPrixParJour(request.getPrixParJour());
        if (request.getBoiteVitesse() != null) {
            try {
                v.setBoiteVitesse(com.partikar.voiture.Voiture.BoiteVitesse.valueOf(request.getBoiteVitesse().toUpperCase().trim()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Boîte de vitesse invalide (MANUELLE|AUTOMATIQUE)");
            }
        }
        if (request.getClimatisation() != null) v.setClimatisation(request.getClimatisation());
        if (request.getLocalisation() != null) v.setLocalisation(request.getLocalisation());
        if (request.getLatitude() != null) v.setLatitude(java.math.BigDecimal.valueOf(request.getLatitude()));
        if (request.getLongitude() != null) v.setLongitude(java.math.BigDecimal.valueOf(request.getLongitude()));
        if (request.getKilometrage() != null) v.setKilometrage(request.getKilometrage());
        v.setMajLe(java.time.LocalDateTime.now());

        // Mise à jour des disponibilités si fournie
        if (request.getDisponibilites() != null && !request.getDisponibilites().isEmpty()) {
            // supprimer les anciennes
            List<com.partikar.disponibilite.Disponibilite> anciennes = disponibiliteRepository.findByVoitureId(v.getId());
            disponibiliteRepository.deleteAll(anciennes);
            for (com.partikar.annonces.dto.CreerAnnonceRequest.DisponibiliteDTO d : request.getDisponibilites()) {
                com.partikar.disponibilite.Disponibilite dispo = new com.partikar.disponibilite.Disponibilite();
                dispo.setVoiture(v);
                dispo.setJour(d.getJour());
                dispo.setStatut(com.partikar.disponibilite.Disponibilite.Statut.DISPONIBLE);
                dispo.setPrixSpecifique(d.getPrixSpecifique());
                disponibiliteRepository.save(dispo);
            }
        } else if (request.getDateDebut() != null && request.getDateFin() != null) {
            if (request.getDateFin().isBefore(request.getDateDebut())) {
                throw new RuntimeException("dateFin doit être >= dateDebut");
            }
            // remplacer anciennes par nouvelle plage
            List<com.partikar.disponibilite.Disponibilite> anciennes = disponibiliteRepository.findByVoitureId(v.getId());
            disponibiliteRepository.deleteAll(anciennes);
            java.time.LocalDate cur = request.getDateDebut();
            while (!cur.isAfter(request.getDateFin())) {
                com.partikar.disponibilite.Disponibilite dispo = new com.partikar.disponibilite.Disponibilite();
                dispo.setVoiture(v);
                dispo.setJour(cur);
                dispo.setStatut(com.partikar.disponibilite.Disponibilite.Statut.DISPONIBLE);
                dispo.setPrixSpecifique(null);
                disponibiliteRepository.save(dispo);
                cur = cur.plusDays(1);
            }
        }
        v.setMajLe(java.time.LocalDateTime.now());
        com.partikar.voiture.Voiture saved = voitureRepository.save(v);
        int nbJours = disponibiliteRepository.findByVoitureId(saved.getId()).size();
        return com.partikar.annonces.dto.AnnonceResponse.fromVoiture(saved, nbJours);
    }

    /**
     * Récupère les disponibilités d'une voiture.
     */
    @Transactional(readOnly = true)
    public List<com.partikar.disponibilite.DisponibiliteResponse> getDisponibilites(Long voitureId) {
        Voiture voiture = voitureRepository.findById(voitureId)
                .orElseThrow(() -> new RuntimeException("Voiture introuvable avec l'ID: " + voitureId));

        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voitureId);
        return disponibilites.stream()
                .map(d -> new com.partikar.disponibilite.DisponibiliteResponse(
                        d.getId(),
                        d.getJour(),
                        d.getStatut().name(),
                        d.getPrixSpecifique()
                ))
                .collect(Collectors.toList());
    }

    /**
     * Met à jour automatiquement le statut d'une voiture en fonction de ses disponibilités.
     * Appelé après une réservation ou une annulation.
     *
     * Logique des transitions de statut :
     * - disponible → completement_reservee (quand toutes dates futures sont réservées)
     * - disponible → expiree (quand toutes les dates sont passées)
     * - completement_reservee → disponible (quand une réservation est annulée)
     * - completement_reservee → expiree (quand toutes les dates sont passées)
     * - inactive : ne change JAMAIS (suppression définitive par le propriétaire)
     */
    @Transactional
    public void mettreAJourStatutVoiture(Long voitureId) {
        Voiture voiture = voitureRepository.findById(voitureId)
                .orElseThrow(() -> new RuntimeException("Voiture introuvable avec l'ID: " + voitureId));

        // Si la voiture est inactive (supprimée par le propriétaire), on ne change JAMAIS son statut
        if ("inactive".equalsIgnoreCase(voiture.getStatut())) {
            return;
        }

        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voitureId);
        LocalDate aujourdhui = LocalDate.now();

        // Vérifier s'il y a au moins une date dans le futur (disponible ou réservée)
        boolean aDesDatesFutures = disponibilites.stream()
                .anyMatch(d -> d.getJour().isAfter(aujourdhui) || d.getJour().isEqual(aujourdhui));

        // Si toutes les dates sont passées → expiree (peu importe le statut actuel)
        if (!aDesDatesFutures) {
            if (!"expiree".equalsIgnoreCase(voiture.getStatut())) {
                logger.info("Mise à jour du statut de la voiture {} : {} → expiree (toutes les dates sont passées)",
                        voitureId, voiture.getStatut());
                voiture.setStatut("expiree");
                voiture.setMajLe(LocalDateTime.now());
                voitureRepository.save(voiture);
            }
            return;
        }

        // Vérifier s'il y a des dates DISPONIBLES dans le futur
        boolean aDesDatesFuturesDisponibles = disponibilites.stream()
                .anyMatch(d -> (d.getJour().isAfter(aujourdhui) || d.getJour().isEqual(aujourdhui))
                        && d.getStatut() == Disponibilite.Statut.DISPONIBLE);

        // Déterminer le nouveau statut
        String nouveauStatut;
        if (aDesDatesFuturesDisponibles) {
            // Il y a au moins une date future disponible
            nouveauStatut = "disponible";
        } else {
            // Il y a des dates futures mais toutes sont réservées
            nouveauStatut = "completement_reservee";
        }

        // Mettre à jour le statut si nécessaire
        if (!nouveauStatut.equalsIgnoreCase(voiture.getStatut())) {
            logger.info("Mise à jour du statut de la voiture {} : {} → {}",
                    voitureId, voiture.getStatut(), nouveauStatut);
            voiture.setStatut(nouveauStatut);
            voiture.setMajLe(LocalDateTime.now());
            voitureRepository.save(voiture);
        }
    }

    /**
     * Enrichit une AnnonceResponse avec la note moyenne et le nombre d'avis du propriétaire.
     *
     * @param response L'AnnonceResponse à enrichir
     */
    private void enrichirAvecNoteProprietaire(AnnonceResponse response) {
        try {
            if (response.getProprietaireId() != null) {
                List<com.partikar.avis.Avis> avisProprietaire = avisRepository.findByCibleId(response.getProprietaireId());
                if (!avisProprietaire.isEmpty()) {
                    double moyenne = avisProprietaire.stream()
                        .filter(avis -> avis.getNoteUtilisateur() != null)
                        .mapToInt(com.partikar.avis.Avis::getNoteUtilisateur)
                        .average()
                        .orElse(0.0);
                    response.setProprietaireMoyenneAvis(moyenne);
                    response.setProprietaireNbAvis(avisProprietaire.size());
                } else {
                    response.setProprietaireMoyenneAvis(0.0);
                    response.setProprietaireNbAvis(0);
                }
            }
        } catch (Exception e) {
            logger.warn("Erreur lors de l'enrichissement des avis pour le propriétaire {}: {}",
                       response.getProprietaireId(), e.getMessage());
            response.setProprietaireMoyenneAvis(0.0);
            response.setProprietaireNbAvis(0);
        }
    }
}