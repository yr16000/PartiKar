package com.partikar.location;

import java.time.LocalDate;

/**
 * DTO pour créer une nouvelle réservation/location.
 */
public class CreerLocationRequest {

    private Long voitureId;
    private Long locataireId; // Optionnel si utilisateur authentifié
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String heureDebut; // Format: "HH:mm" (ex: "10:00")
    private String heureFin;   // Format: "HH:mm" (ex: "10:00")

    // Constructeurs
    public CreerLocationRequest() {}

    // Getters et Setters
    public Long getVoitureId() {
        return voitureId;
    }

    public void setVoitureId(Long voitureId) {
        this.voitureId = voitureId;
    }

    public Long getLocataireId() {
        return locataireId;
    }

    public void setLocataireId(Long locataireId) {
        this.locataireId = locataireId;
    }

    public LocalDate getDateDebut() {
        return dateDebut;
    }

    public void setDateDebut(LocalDate dateDebut) {
        this.dateDebut = dateDebut;
    }

    public LocalDate getDateFin() {
        return dateFin;
    }

    public void setDateFin(LocalDate dateFin) {
        this.dateFin = dateFin;
    }

    public String getHeureDebut() {
        return heureDebut;
    }

    public void setHeureDebut(String heureDebut) {
        this.heureDebut = heureDebut;
    }

    public String getHeureFin() {
        return heureFin;
    }

    public void setHeureFin(String heureFin) {
        this.heureFin = heureFin;
    }

    @Override
    public String toString() {
        return "CreerLocationRequest{" +
                "voitureId=" + voitureId +
                ", locataireId=" + locataireId +
                ", dateDebut=" + dateDebut +
                ", dateFin=" + dateFin +
                ", heureDebut='" + heureDebut + '\'' +
                ", heureFin='" + heureFin + '\'' +
                '}';
    }
}

