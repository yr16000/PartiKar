package com.partikar.voiture;

import com.partikar.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entité représentant une voiture mise en location sur la plateforme PartiKar.
 */
@Entity
@Table(name = "voitures")
@EntityListeners(AuditingEntityListener.class)
public class Voiture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marque;

    @Column(nullable = false)
    private String modele;

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = false)
    private String carburant;

    @Column(nullable = false)
    private String transmission;

    @Column(nullable = false)
    private Integer nbPlaces;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal prixParJour;

    @Column(nullable = false)
    private String ville;

    @Column(nullable = true, length = 1024)
    private String photoUrl;

    @Column(nullable = true, length = 2000)
    private String description;

    @Column(nullable = true, precision = 2, scale = 1)
    private BigDecimal noteMoyenne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private User proprietaire;

    @CreationTimestamp
    @Column(name = "cree_le", nullable = false, updatable = false)
    private LocalDateTime creeLe;

    @UpdateTimestamp
    @Column(name = "maj_le")
    private LocalDateTime majLe;

    // === Constructeurs ===

    public Voiture() {}

    public Voiture(String marque, String modele, Integer annee, String carburant, String transmission,
                   Integer nbPlaces, BigDecimal prixParJour, String ville, User proprietaire) {
        this.marque = marque;
        this.modele = modele;
        this.annee = annee;
        this.carburant = carburant;
        this.transmission = transmission;
        this.nbPlaces = nbPlaces;
        this.prixParJour = prixParJour;
        this.ville = ville;
        this.proprietaire = proprietaire;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public String getCarburant() {
        return carburant;
    }
    public void setCarburant(String carburant) {
        this.carburant = carburant;
    }

    public String getTransmission() {
        return transmission;
    }
    public void setTransmission(String transmission) {
        this.transmission = transmission;
    }

    public Integer getNbPlaces() {
        return nbPlaces;
    }
    public void setNbPlaces(Integer nbPlaces) {
        this.nbPlaces = nbPlaces;
    }

    public BigDecimal getPrixParJour() {
        return prixParJour;
    }

    public void setPrixParJour(BigDecimal prixParJour) {
        this.prixParJour = prixParJour;
    }

    public String getVille() {
        return ville;
    }

    public void setVille(String ville) {
        this.ville = ville;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getDescription() {
        return description;
    }
    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(BigDecimal noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public User getProprietaire() {
        return proprietaire;
    }
    public void setProprietaire(User proprietaire) {
        this.proprietaire = proprietaire;
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
}
