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

    public AnnonceService(VoitureRepository voitureRepository,
                         DisponibiliteRepository disponibiliteRepository,
                         UserRepository userRepository) {
        this.voitureRepository = voitureRepository;
        this.disponibiliteRepository = disponibiliteRepository;
        this.userRepository = userRepository;
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
    public AnnonceResponse creerAnnonce(Long proprietaireId, CreerAnnonceRequest request) {
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

            // Validation : vérifier que l'immatriculation est unique
            if (request.getImmatriculation() != null && voitureRepository.findAll().stream()
                    .anyMatch(v -> v.getImmatriculation() != null && v.getImmatriculation().equalsIgnoreCase(request.getImmatriculation()))) {
                throw new RuntimeException("Une voiture avec cette immatriculation existe déjà");
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
            voiture.setStatut("disponible"); // Statut initial
            voiture.setPrixParJour(request.getPrixParJour());

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
                return AnnonceResponse.fromVoiture(voiture, nbJours);
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
        return AnnonceResponse.fromVoiture(voiture, nbJours);
    }

    /**
     * Récupère toutes les annonces (pour la page d'accueil).
     *
     * @return Liste de toutes les annonces
     */
    @Transactional(readOnly = true)
    public List<AnnonceResponse> getToutesLesAnnonces() {
        List<Voiture> voitures = voitureRepository.findAll();

        return voitures.stream()
            .filter(v -> "disponible".equalsIgnoreCase(v.getStatut()))
            .map(voiture -> {
                int nbJours = disponibiliteRepository.findByVoitureId(voiture.getId()).size();
                return AnnonceResponse.fromVoiture(voiture, nbJours);
            })
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
}
