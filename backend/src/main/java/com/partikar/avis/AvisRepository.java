package com.partikar.avis;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvisRepository extends JpaRepository<Avis, Long> {
    List<Avis> findByAuteurId(Long auteurId);
    List<Avis> findByLocationId(Long locationId);
    List<Avis> findByCibleId(Long cibleId);
}
