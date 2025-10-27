package com.partikar.location;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByLocataireId(Long locataireId);
    List<Location> findByVoitureId(Long voitureId);
    List<Location> findByStatut(String statut);
}

