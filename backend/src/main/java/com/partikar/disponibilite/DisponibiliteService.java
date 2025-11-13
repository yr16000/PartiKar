package com.partikar.disponibilite;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DisponibiliteService {

    private final DisponibiliteRepository disponibiliteRepository;

    public DisponibiliteService(DisponibiliteRepository disponibiliteRepository) {
        this.disponibiliteRepository = disponibiliteRepository;
    }

    /**
     * Récupère toutes les disponibilités d'une voiture.
     */
    public List<DisponibiliteResponse> getDisponibilitesParVoiture(Long voitureId) {
        List<Disponibilite> disponibilites = disponibiliteRepository.findByVoitureId(voitureId);
        return disponibilites.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private DisponibiliteResponse toResponse(Disponibilite disponibilite) {
        return new DisponibiliteResponse(
                disponibilite.getId(),
                disponibilite.getJour(),
                disponibilite.getStatut().name(),
                disponibilite.getPrixSpecifique()
        );
    }
}

