package com.partikar.annonces.dto;

import com.partikar.voiture.Voiture;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de réponse après la création d'une annonce.
 * Contient les informations essentielles de la voiture créée.
 */
public class AnnonceResponse {

    private Long voitureId;
    private String marque;
    private String modele;
    private Integer annee;
    private String couleur;
    private String immatriculation;
    private String typeCarburant;
    private Integer nbPlaces;
    private String description;
    private String imageUrl;
    private String statut;
    private BigDecimal prixParJour;
    private String boiteVitesse;
    private Boolean climatisation;
    private String localisation;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Long proprietaireId;
    private String proprietaireNom;
    private String proprietairePrenom;
    private LocalDateTime creeLe;
    private Integer nbJoursDisponibles;

    /**
     * Constructeur à partir d'une entité Voiture
     */
    public static AnnonceResponse fromVoiture(Voiture voiture, int nbJoursDisponibles) {
        AnnonceResponse response = new AnnonceResponse();
        response.setVoitureId(voiture.getId());
        response.setMarque(voiture.getMarque());
        response.setModele(voiture.getModele());
        response.setAnnee(voiture.getAnnee());
        response.setCouleur(voiture.getCouleur());
        response.setImmatriculation(voiture.getImmatriculation());
        response.setTypeCarburant(voiture.getTypeCarburant());
        response.setNbPlaces(voiture.getNbPlaces());
        response.setDescription(voiture.getDescription());
        response.setImageUrl(voiture.getImageUrl());
        response.setStatut(voiture.getStatut());
        response.setPrixParJour(voiture.getPrixParJour());
        response.setBoiteVitesse(voiture.getBoiteVitesse().name());
        response.setClimatisation(voiture.getClimatisation());
        response.setLocalisation(voiture.getLocalisation());
        response.setLatitude(voiture.getLatitude());
        response.setLongitude(voiture.getLongitude());
        response.setProprietaireId(voiture.getProprietaire().getId());
        response.setProprietaireNom(voiture.getProprietaire().getNom());
        response.setProprietairePrenom(voiture.getProprietaire().getPrenom());
        response.setCreeLe(voiture.getCreeLe());
        response.setNbJoursDisponibles(nbJoursDisponibles);
        return response;
    }

    // Getters et Setters
    public Long getVoitureId() { return voitureId; }
    public void setVoitureId(Long voitureId) { this.voitureId = voitureId; }

    public String getMarque() { return marque; }
    public void setMarque(String marque) { this.marque = marque; }

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

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

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

    public Long getProprietaireId() { return proprietaireId; }
    public void setProprietaireId(Long proprietaireId) { this.proprietaireId = proprietaireId; }

    public String getProprietaireNom() { return proprietaireNom; }
    public void setProprietaireNom(String proprietaireNom) { this.proprietaireNom = proprietaireNom; }

    public String getProprietairePrenom() { return proprietairePrenom; }
    public void setProprietairePrenom(String proprietairePrenom) { this.proprietairePrenom = proprietairePrenom; }

    public LocalDateTime getCreeLe() { return creeLe; }
    public void setCreeLe(LocalDateTime creeLe) { this.creeLe = creeLe; }

    public Integer getNbJoursDisponibles() { return nbJoursDisponibles; }
    public void setNbJoursDisponibles(Integer nbJoursDisponibles) { this.nbJoursDisponibles = nbJoursDisponibles; }
}

