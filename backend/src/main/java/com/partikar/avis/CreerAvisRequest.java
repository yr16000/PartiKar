package com.partikar.avis;

/**
 * DTO pour créer ou modifier un avis.
 */
public class CreerAvisRequest {

    private Long locationId;
    private Integer noteUtilisateur; // Note du propriétaire ou du locataire (1-5)
    private Integer noteVehicule;    // Note du véhicule (1-5) - optionnel
    private String commentaire;

    public CreerAvisRequest() {}

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Integer getNoteUtilisateur() {
        return noteUtilisateur;
    }

    public void setNoteUtilisateur(Integer noteUtilisateur) {
        this.noteUtilisateur = noteUtilisateur;
    }

    public Integer getNoteVehicule() {
        return noteVehicule;
    }

    public void setNoteVehicule(Integer noteVehicule) {
        this.noteVehicule = noteVehicule;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}

