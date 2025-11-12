package com.partikar.avis;

import java.time.LocalDateTime;

/**
 * DTO de réponse pour un avis.
 */
public class AvisResponse {

    private Long id;
    private Long locationId;
    private Long auteurId;
    private String auteurNom;
    private String auteurPrenom;
    private Long cibleId;
    private String cibleNom;
    private String ciblePrenom;
    private Integer noteUtilisateur;
    private Integer noteVehicule;
    private String commentaire;
    private LocalDateTime creeLe;

    public AvisResponse() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getLocationId() {
        return locationId;
    }

    public void setLocationId(Long locationId) {
        this.locationId = locationId;
    }

    public Long getAuteurId() {
        return auteurId;
    }

    public void setAuteurId(Long auteurId) {
        this.auteurId = auteurId;
    }

    public String getAuteurNom() {
        return auteurNom;
    }

    public void setAuteurNom(String auteurNom) {
        this.auteurNom = auteurNom;
    }

    public String getAuteurPrenom() {
        return auteurPrenom;
    }

    public void setAuteurPrenom(String auteurPrenom) {
        this.auteurPrenom = auteurPrenom;
    }

    public Long getCibleId() {
        return cibleId;
    }

    public void setCibleId(Long cibleId) {
        this.cibleId = cibleId;
    }

    public String getCibleNom() {
        return cibleNom;
    }

    public void setCibleNom(String cibleNom) {
        this.cibleNom = cibleNom;
    }

    public String getCiblePrenom() {
        return ciblePrenom;
    }

    public void setCiblePrenom(String ciblePrenom) {
        this.ciblePrenom = ciblePrenom;
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

    public LocalDateTime getCreeLe() {
        return creeLe;
    }

    public void setCreeLe(LocalDateTime creeLe) {
        this.creeLe = creeLe;
    }

    public static AvisResponse fromAvis(Avis avis) {
        AvisResponse response = new AvisResponse();
        response.setId(avis.getId());
        response.setLocationId(avis.getLocation() != null ? avis.getLocation().getId() : null);
        response.setAuteurId(avis.getAuteur().getId());
        response.setAuteurNom(avis.getAuteur().getNom());
        response.setAuteurPrenom(avis.getAuteur().getPrenom());
        if (avis.getCible() != null) {
            response.setCibleId(avis.getCible().getId());
            response.setCibleNom(avis.getCible().getNom());
            response.setCiblePrenom(avis.getCible().getPrenom());
        }
        response.setNoteUtilisateur(avis.getNoteUtilisateur());
        response.setNoteVehicule(avis.getNoteVehicule());
        response.setCommentaire(avis.getCommentaire());
        response.setCreeLe(avis.getCreeLe());
        return response;
    }
}

