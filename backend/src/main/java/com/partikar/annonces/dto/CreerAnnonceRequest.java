package com.partikar.annonces.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour la création d'une annonce de voiture.
 * Contient toutes les informations nécessaires pour créer une voiture
 * et définir ses disponibilités initiales.
 */
public class CreerAnnonceRequest {

    // Informations de base de la voiture
    private String marque;
    private String modele;
    private Integer annee;
    private String couleur;
    private String immatriculation;
    private String typeCarburant;
    private Integer nbPlaces;
    private String description;
    private String imageUrl;
    private Integer kilometrage;

    // Prix et équipements
    private BigDecimal prixParJour;
    private String boiteVitesse; // "MANUELLE" ou "AUTOMATIQUE"
    private Boolean climatisation;

    // Localisation
    private String localisation;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Disponibilités initiales (liste de jours optionnelle)
    private List<DisponibiliteDTO> disponibilites;

    // Nouveaux champs : plage de dates (dateDebut/dateFin) envoyés par le frontend
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;

    // Getters et Setters
    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

    public Integer getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Integer kilometrage) {
        this.kilometrage = kilometrage;
    }

    public String getModele() { return modele; }
    public void setModele(String modele) { this.modele = modele; }

    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer annee) { this.annee = annee; }

    public String getCouleur() { return couleur; }
    public void setCouleur(String couleur) { this.couleur = couleur; }

    public String getImmatriculation() { return immatriculation; }
    public void setImmatriculation(String immatriculation) { this.immatriculation = immatriculation; }

    public String getTypeCarburant() { return typeCarburant; }
    public void setTypeCarburant(String typeCarburant) { this.typeCarburant = typeCarburant; }

    public Integer getNbPlaces() { return nbPlaces; }
    public void setNbPlaces(Integer nbPlaces) { this.nbPlaces = nbPlaces; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public BigDecimal getPrixParJour() { return prixParJour; }
    public void setPrixParJour(BigDecimal prixParJour) { this.prixParJour = prixParJour; }

    public String getBoiteVitesse() { return boiteVitesse; }
    public void setBoiteVitesse(String boiteVitesse) { this.boiteVitesse = boiteVitesse; }

    public Boolean getClimatisation() { return climatisation; }
    public void setClimatisation(Boolean climatisation) { this.climatisation = climatisation; }

    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public List<DisponibiliteDTO> getDisponibilites() { return disponibilites; }
    public void setDisponibilites(List<DisponibiliteDTO> disponibilites) { this.disponibilites = disponibilites; }

    public LocalDate getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDate dateDebut) { this.dateDebut = dateDebut; }

    public LocalDate getDateFin() { return dateFin; }
    public void setDateFin(LocalDate dateFin) { this.dateFin = dateFin; }

    /**
     * DTO interne pour représenter une disponibilité
     */
    public static class DisponibiliteDTO {
        private LocalDate jour;
        private BigDecimal prixSpecifique; // Optionnel, sinon utilise prixParJour

        public LocalDate getJour() { return jour; }
        public void setJour(LocalDate jour) { this.jour = jour; }

        public BigDecimal getPrixSpecifique() { return prixSpecifique; }
        public void setPrixSpecifique(BigDecimal prixSpecifique) { this.prixSpecifique = prixSpecifique; }
    }
}
