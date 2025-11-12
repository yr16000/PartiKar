package com.partikar.disponibilite;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO pour la réponse des disponibilités d'une voiture.
 */
public class DisponibiliteResponse {
    private Long id;
    private LocalDate jour;
    private String statut;
    private BigDecimal prixSpecifique;

    public DisponibiliteResponse() {
    }

    public DisponibiliteResponse(Long id, LocalDate jour, String statut, BigDecimal prixSpecifique) {
        this.id = id;
        this.jour = jour;
        this.statut = statut;
        this.prixSpecifique = prixSpecifique;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getJour() {
        return jour;
    }

    public void setJour(LocalDate jour) {
        this.jour = jour;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public BigDecimal getPrixSpecifique() {
        return prixSpecifique;
    }

    public void setPrixSpecifique(BigDecimal prixSpecifique) {
        this.prixSpecifique = prixSpecifique;
    }
}

