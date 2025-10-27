package com.partikar.disponibilite;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DisponibiliteRepository extends JpaRepository<Disponibilite, Long> {
    List<Disponibilite> findByVoitureId(Long voitureId);
    List<Disponibilite> findByJour(LocalDate jour);
}

