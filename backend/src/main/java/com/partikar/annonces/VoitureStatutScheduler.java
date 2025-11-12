package com.partikar.annonces;

import com.partikar.disponibilite.Disponibilite;
import com.partikar.disponibilite.DisponibiliteRepository;
import com.partikar.voiture.Voiture;
import com.partikar.voiture.VoitureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service planifié pour vérifier et mettre à jour automatiquement
 * le statut des voitures en fonction de leurs disponibilités.
 */
@Service
public class VoitureStatutScheduler {

    private static final Logger logger = LoggerFactory.getLogger(VoitureStatutScheduler.class);

    private final VoitureRepository voitureRepository;
    private final DisponibiliteRepository disponibiliteRepository;

    public VoitureStatutScheduler(VoitureRepository voitureRepository,
                                  DisponibiliteRepository disponibiliteRepository) {
        this.voitureRepository = voitureRepository;
        this.disponibiliteRepository = disponibiliteRepository;
    }

    /**
     * Tâche planifiée qui s'exécute tous les jours à 2h du matin
     * pour vérifier les voitures expirées.
     */
    @Scheduled(cron = "0 0 2 * * *") // Tous les jours à 2h00
    @Transactional
    public void verifierVoituresExpirees() {
        logger.info("=== Vérification quotidienne des statuts de voitures ===");

        LocalDate aujourdhui = LocalDate.now();

        // Récupérer toutes les voitures non inactives
        List<Voiture> voitures = voitureRepository.findAll().stream()
                .filter(v -> !"inactive".equalsIgnoreCase(v.getStatut()))
                .toList();

        int nbMisesAJour = 0;

        for (Voiture voiture : voitures) {
            try {
                List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voiture.getId());

                // Vérifier s'il y a des dates DISPONIBLES dans le futur
                boolean aDesDatesFuturesDisponibles = disponibilites.stream()
                        .anyMatch(d -> d.getJour().isAfter(aujourdhui)
                            && d.getStatut() == Disponibilite.Statut.DISPONIBLE);

                // Vérifier s'il y a au moins une date dans le futur
                boolean aDesDatesFutures = disponibilites.stream()
                        .anyMatch(d -> d.getJour().isAfter(aujourdhui));

                // Déterminer le nouveau statut
                String nouveauStatut;
                if (aDesDatesFuturesDisponibles) {
                    nouveauStatut = "disponible";
                } else if (aDesDatesFutures) {
                    nouveauStatut = "completement_reservee";
                } else {
                    nouveauStatut = "expiree";
                }

                // Mettre à jour si nécessaire
                if (!nouveauStatut.equalsIgnoreCase(voiture.getStatut())) {
                    logger.info("Mise à jour statut voiture {} : {} -> {}",
                        voiture.getId(), voiture.getStatut(), nouveauStatut);
                    voiture.setStatut(nouveauStatut);
                    voiture.setMajLe(LocalDateTime.now());
                    voitureRepository.save(voiture);
                    nbMisesAJour++;
                }
            } catch (Exception e) {
                logger.error("Erreur lors de la vérification de la voiture {}: {}",
                    voiture.getId(), e.getMessage());
            }
        }

        logger.info("=== Vérification terminée : {} voitures mises à jour ===", nbMisesAJour);
    }
}

