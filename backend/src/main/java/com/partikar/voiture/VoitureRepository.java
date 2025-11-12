package com.partikar.voiture;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VoitureRepository extends JpaRepository<Voiture, Long> {
    List<Voiture> findByProprietaireId(Long proprietaireId);
    List<Voiture> findByMarqueContainingIgnoreCase(String marque);
    List<Voiture> findByLocalisationContainingIgnoreCase(String ville);

}