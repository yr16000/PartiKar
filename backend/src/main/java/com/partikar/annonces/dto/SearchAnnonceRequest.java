package com.partikar.annonces.dto;

import java.time.LocalDate;

/**
 * DTO pour la recherche d'annonces avec géolocalisation et filtres.
 * Tous les champs sont optionnels pour permettre une recherche flexible.
 *
 * Note: Les coordonnées latitude/longitude sont calculées à partir de la localisation
 * sélectionnée dans le Hero (via l'API de géocodage côté frontend).
 */
public class SearchAnnonceRequest {

    // Géolocalisation (coordonnées calculées depuis la localisation sélectionnée)
    private Double latitude;
    private Double longitude;
    private Double rayonKm = 10.0; // Rayon par défaut : 10 km

    // Dates de disponibilité
    private LocalDate dateDebut;
    private LocalDate dateFin;

    // Filtres véhicule basiques
    private String marque;
    private String modele;
    private String typeCarburant;
    private String boiteVitesse;
    private Integer nbPlaces;

    // Filtres prix et année
    private Double prixMin;
    private Double prixMax;
    private Integer anneeMin;
    private Integer anneeMax;

    // Filtres kilométrage (nouveau)
    private Integer kilometrageMin;
    private Integer kilometrageMax;

    // Autres filtres
    private Boolean climatisation;

    // Tri des résultats
    private TriOption triOption;

    // Constructeurs
    public SearchAnnonceRequest() {}

    // Getters et Setters
    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Double getRayonKm() {
        return rayonKm;
    }

    public void setRayonKm(Double rayonKm) {
        this.rayonKm = rayonKm;
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

    public String getMarque() {
        return marque;
    }

    public void setMarque(String marque) {
        this.marque = marque;
    }

    public String getModele() {
        return modele;
    }

    public void setModele(String modele) {
        this.modele = modele;
    }

    public String getTypeCarburant() {
        return typeCarburant;
    }

    public void setTypeCarburant(String typeCarburant) {
        this.typeCarburant = typeCarburant;
    }

    public String getBoiteVitesse() {
        return boiteVitesse;
    }

    public void setBoiteVitesse(String boiteVitesse) {
        this.boiteVitesse = boiteVitesse;
    }

    public Integer getNbPlaces() {
        return nbPlaces;
    }

    public void setNbPlaces(Integer nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    public Double getPrixMin() {
        return prixMin;
    }

    public void setPrixMin(Double prixMin) {
        this.prixMin = prixMin;
    }

    public Double getPrixMax() {
        return prixMax;
    }

    public void setPrixMax(Double prixMax) {
        this.prixMax = prixMax;
    }

    public Integer getAnneeMin() {
        return anneeMin;
    }

    public void setAnneeMin(Integer anneeMin) {
        this.anneeMin = anneeMin;
    }

    public Integer getAnneeMax() {
        return anneeMax;
    }

    public void setAnneeMax(Integer anneeMax) {
        this.anneeMax = anneeMax;
    }

    public Integer getKilometrageMin() {
        return kilometrageMin;
    }

    public void setKilometrageMin(Integer kilometrageMin) {
        this.kilometrageMin = kilometrageMin;
    }

    public Integer getKilometrageMax() {
        return kilometrageMax;
    }

    public void setKilometrageMax(Integer kilometrageMax) {
        this.kilometrageMax = kilometrageMax;
    }

    public Boolean getClimatisation() {
        return climatisation;
    }

    public void setClimatisation(Boolean climatisation) {
        this.climatisation = climatisation;
    }

    public TriOption getTriOption() {
        return triOption;
    }

    public void setTriOption(TriOption triOption) {
        this.triOption = triOption;
    }

    @Override
    public String toString() {
        return "SearchAnnonceRequest{" +
                "latitude=" + latitude +
                ", longitude=" + longitude +
                ", rayonKm=" + rayonKm +
                ", dateDebut=" + dateDebut +
                ", dateFin=" + dateFin +
                ", marque='" + marque + '\'' +
                ", modele='" + modele + '\'' +
                ", typeCarburant='" + typeCarburant + '\'' +
                ", boiteVitesse='" + boiteVitesse + '\'' +
                ", nbPlaces=" + nbPlaces +
                ", prixMin=" + prixMin +
                ", prixMax=" + prixMax +
                ", anneeMin=" + anneeMin +
                ", anneeMax=" + anneeMax +
                ", kilometrageMin=" + kilometrageMin +
                ", kilometrageMax=" + kilometrageMax +
                ", climatisation=" + climatisation +
                ", triOption=" + triOption +
                '}';
    }
}
