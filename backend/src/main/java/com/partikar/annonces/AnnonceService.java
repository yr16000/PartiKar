package com.partikar.annonces;

import com.partikar.disponibilite.Disponibilite;
import com.partikar.disponibilite.DisponibiliteRepository;
import com.partikar.user.User;
import com.partikar.user.UserRepository;
import com.partikar.annonces.dto.AnnonceResponse;
import com.partikar.annonces.dto.CreerAnnonceRequest;
import com.partikar.voiture.Voiture;
import com.partikar.voiture.VoitureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour gérer les annonces de voitures.
 * Gère la création, modification et consultation des annonces.
 */
@Service
public class AnnonceService {

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
     * @param proprietaireId ID du propriétaire de la voiture
     * @param request DTO contenant toutes les informations de l'annonce
     * @return La réponse avec les détails de la voiture créée
     * @throws RuntimeException si le propriétaire n'existe pas ou si les données sont invalides
     */
    @Transactional
    public AnnonceResponse creerAnnonce(Long proprietaireId, CreerAnnonceRequest request) {
        // Validation : vérifier que le propriétaire existe
        User proprietaire = userRepository.findById(proprietaireId)
            .orElseThrow(() -> new RuntimeException("Propriétaire introuvable avec l'ID: " + proprietaireId));

        // Validation : vérifier que l'immatriculation est unique
        if (voitureRepository.findAll().stream()
                .anyMatch(v -> v.getImmatriculation().equalsIgnoreCase(request.getImmatriculation()))) {
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
        try {
            voiture.setBoiteVitesse(Voiture.BoiteVitesse.valueOf(request.getBoiteVitesse().toUpperCase()));
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
        if (request.getDisponibilites() != null && !request.getDisponibilites().isEmpty()) {
            for (CreerAnnonceRequest.DisponibiliteDTO dispoDTO : request.getDisponibilites()) {
                Disponibilite dispo = new Disponibilite();
                dispo.setVoiture(voitureSauvegardee);
                dispo.setJour(dispoDTO.getJour());
                dispo.setStatut(Disponibilite.Statut.DISPONIBLE);

                // Si un prix spécifique est fourni, l'utiliser, sinon null (utilisera le prix par jour)
                dispo.setPrixSpecifique(dispoDTO.getPrixSpecifique());

                disponibiliteRepository.save(dispo);
                nbJoursDisponibles++;
            }
        }

        return AnnonceResponse.fromVoiture(voitureSauvegardee, nbJoursDisponibles);
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

