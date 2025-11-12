package com.partikar.voiture; // Assure-toi que le package est correct

import com.partikar.user.User; // Importe l'entité User
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "voitures") // Nom de la table en BDD
@EntityListeners(AuditingEntityListener.class) // Pour @CreatedDate et @LastModifiedDate
public class Voiture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voiture_id") // Explicite le nom de colonne (bonne pratique)
    private Long id;

    //  Relation avec l'utilisateur (Propriétaire)
    @ManyToOne(fetch = FetchType.LAZY) // LAZY est souvent mieux pour les performances
    @JoinColumn(name = "proprietaire_id", nullable = false) // Nom de la colonne clé étrangère
    private User proprietaire;

    //  Champs de base
    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String modele;

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = true)
    private String couleur;

    @Column(nullable = false) // Suppression de unique=true pour gérer la validation en Java
    private String immatriculation;

    // Correspond à la colonne SQL `type_carburant` (nom attendu par la base)
    @Column(name = "carburant", nullable = false)
    private String typeCarburant; // Ex: ESSENCE, DIESEL, ELECTRIQUE, HYBRIDE

    @Column(nullable = false)
    private Integer nbPlaces;

    @Lob // Pour les textes potentiellement longs
    @Column(columnDefinition = "TEXT") // Spécifie le type SQL pour être sûr
    private String description;

    // Augmentation de la taille maximale pour éviter value too long for type character varying(255)
    @Column(nullable = true, length = 1000)
    private String imageUrl;

    @Column(nullable = false)
    private String statut; // Ex: ACTIVE, INACTIVE, EN_VALIDATION

    //  Champs ajoutés/modifiés

    @Column(nullable = false)
    private BigDecimal prixParJour; // Utilise BigDecimal pour l'argent/les prix

    @Enumerated(EnumType.STRING) // Stocke "MANUELLE" ou "AUTOMATIQUE" en BDD
    @Column(nullable = false)
    private BoiteVitesse boiteVitesse;

    @Column(nullable = false)
    private Boolean climatisation; // true ou false

    //  Champs Géolocalisation
    @Column(nullable = true, length = 10000)
    private String localisation; // L'adresse complète (ex: "10 Rue de Rivoli, Paris")

    @Column(nullable = true)
    private BigDecimal latitude; // Coordonnée GPS

    @Column(nullable = true)
    private BigDecimal longitude; // Coordonnée GPS

    //  Champs Auditing
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime creeLe;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime majLe;


    @Column(nullable = false)
    private Integer kilometrage;

    //  Constructeur vide (obligatoire pour JPA)
    public Voiture() {
    }

    //  Enum pour BoiteVitesse
    public enum BoiteVitesse {
        MANUELLE, AUTOMATIQUE
    }

    //  Enum pour le statut de la voiture
    public enum StatutVoiture {
        DISPONIBLE,              // La voiture a des dates disponibles dans le futur
        COMPLETEMENT_RESERVEE,   // Toutes les dates sont réservées
        EXPIREE,                 // La dernière date de disponibilité est passée
        INACTIVE                 // Le propriétaire a supprimé l'annonce (soft delete)
    }

    //  Getters et Setters (Générés par l'IDE)
    // ... Ajoute tous les getters et setters pour tous les champs ...

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getProprietaire() {
        return proprietaire;
    }

    public void setProprietaire(User proprietaire) {
        this.proprietaire = proprietaire;
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

    public Integer getAnnee() {
        return annee;
    }

    public void setAnnee(Integer annee) {
        this.annee = annee;
    }

    public String getCouleur() {
        return couleur;
    }

    public void setCouleur(String couleur) {
        this.couleur = couleur;
    }

    public String getImmatriculation() {
        return immatriculation;
    }

    public void setImmatriculation(String immatriculation) {
        this.immatriculation = immatriculation;
    }

    public String getTypeCarburant() {
        return typeCarburant;
    }

    public void setTypeCarburant(String typeCarburant) {
        this.typeCarburant = typeCarburant;
    }

    public Integer getNbPlaces() {
        return nbPlaces;
    }

    public void setNbPlaces(Integer nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public BigDecimal getPrixParJour() {
        return prixParJour;
    }

    public void setPrixParJour(BigDecimal prixParJour) {
        this.prixParJour = prixParJour;
    }

    public BoiteVitesse getBoiteVitesse() {
        return boiteVitesse;
    }

    public void setBoiteVitesse(BoiteVitesse boiteVitesse) {
        this.boiteVitesse = boiteVitesse;
    }

    public Boolean getClimatisation() {
        return climatisation;
    }

    public void setClimatisation(Boolean climatisation) {
        this.climatisation = climatisation;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public BigDecimal getLatitude() {
        return latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public LocalDateTime getCreeLe() {
        return creeLe;
    }

    public void setCreeLe(LocalDateTime creeLe) {
        this.creeLe = creeLe;
    }

    public LocalDateTime getMajLe() {
        return majLe;
    }

    public void setMajLe(LocalDateTime majLe) {
        this.majLe = majLe;
    }

    public Integer getKilometrage() {
        return kilometrage;
    }

    public void setKilometrage(Integer kilometrage) {
        this.kilometrage = kilometrage;
    }
}
