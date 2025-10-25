package com.partikar.avis;

import com.partikar.user.User;
import com.partikar.voiture.Voiture;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
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

    /** Note de l'avis (1 à 5) */
    @Column(nullable = false)
    private Integer note;

    /** Commentaire libre */
    @Column(nullable = true, length = 2000)
    private String commentaire;

    /** Auteur de l'avis */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auteur_id", nullable = false)
    private User auteur;

    /** Cible de l'avis : la voiture concernée (optionnel) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voiture_id")
    private Voiture voiture;

    /** Cible de l'avis : le propriétaire concerné (optionnel) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cible_user_id")
    private User cibleUser;

    /** Date de création automatique */
    @CreationTimestamp
    @Column(name = "cree_le", nullable = false, updatable = false)
    private LocalDateTime creeLe;

    /** Date de dernière mise à jour automatique */
    @UpdateTimestamp
    @Column(name = "maj_le")
    private LocalDateTime majLe;

    // Constructeurs

    public Avis() {}

    /** Avis sur une voiture */
    public Avis(Integer note, String commentaire, User auteur, Voiture voiture) {
        this.note = note;
        this.commentaire = commentaire;
        this.auteur = auteur;
        this.voiture = voiture;
    }

    /** Avis sur un propriétaire */
    public Avis(Integer note, String commentaire, User auteur, User cibleUser) {
        this.note = note;
        this.commentaire = commentaire;
        this.auteur = auteur;
        this.cibleUser = cibleUser;
    }

    // Getters / Setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public User getAuteur() { return auteur; }
    public void setAuteur(User auteur) { this.auteur = auteur; }

    public Voiture getVoiture() { return voiture; }
    public void setVoiture(Voiture voiture) { this.voiture = voiture; }

    public User getCibleUser() { return cibleUser; }
    public void setCibleUser(User cibleUser) { this.cibleUser = cibleUser; }

    public LocalDateTime getCreeLe() { return creeLe; }
    public void setCreeLe(LocalDateTime creeLe) { this.creeLe = creeLe; }

    public LocalDateTime getMajLe() { return majLe; }
    public void setMajLe(LocalDateTime majLe) { this.majLe = majLe; }
}
