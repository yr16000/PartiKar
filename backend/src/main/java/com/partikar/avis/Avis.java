package com.partikar.avis;

import com.partikar.location.Location;
import com.partikar.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * Entité représentant un avis laissé par un utilisateur
 * sur une voiture ou sur un propriétaire.
 */
@Entity
@Table(name = "avis")
@EntityListeners(AuditingEntityListener.class)
public class Avis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Location associée à l'avis */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    /** Auteur de l'avis */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private User auteur;

    /** Cible de l'avis */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cible_id")
    private User cible;

    /** Note donnée par l'utilisateur (1 à 5) */
    @Column(name = "note_utilisateur", nullable = false)
    private Integer noteUtilisateur;

    /** Note donnée au véhicule (1 à 5) */
    @Column(name = "note_vehicule")
    private Integer noteVehicule;

    /** Commentaire libre */
    @Column(name = "commentaire", nullable = true, length = 2000)
    private String commentaire;

    /** Date de création automatique */
    @CreationTimestamp
    @Column(name = "cree_le", nullable = false, updatable = false)
    private LocalDateTime creeLe;

    /** Date de dernière modification */
    @Column(name = "maj_le")
    private LocalDateTime majLe;

    // Constructeurs

    public Avis() {}

    /** Avis sur une location */
    public Avis(Location location, User auteur, User cible, Integer noteUtilisateur, Integer noteVehicule, String commentaire) {
        this.location = location;
        this.auteur = auteur;
        this.cible = cible;
        this.noteUtilisateur = noteUtilisateur;
        this.noteVehicule = noteVehicule;
        this.commentaire = commentaire;
    }

    // Getters / Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public User getAuteur() { return auteur; }
    public void setAuteur(User auteur) { this.auteur = auteur; }

    public User getCible() { return cible; }
    public void setCible(User cible) { this.cible = cible; }

    public Integer getNoteUtilisateur() { return noteUtilisateur; }
    public void setNoteUtilisateur(Integer noteUtilisateur) { this.noteUtilisateur = noteUtilisateur; }

    public Integer getNoteVehicule() { return noteVehicule; }
    public void setNoteVehicule(Integer noteVehicule) { this.noteVehicule = noteVehicule; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public LocalDateTime getCreeLe() { return creeLe; }
    public void setCreeLe(LocalDateTime creeLe) { this.creeLe = creeLe; }

    public LocalDateTime getMajLe() { return majLe; }
    public void setMajLe(LocalDateTime majLe) { this.majLe = majLe; }
}
