package com.partikar.transaction;

import com.partikar.location.Location;
import com.partikar.user.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Enregistrement d'un mouvement de crédits lié (ou non) à une location.
 *
 * Conventions métier :
 * - montant négatif => débit (le solde de l'utilisateur diminue, ex: réservation)
 * - montant positif => crédit (le solde de l'utilisateur augmente, ex: paiement propriétaire)
 */
@Entity
@Table(name = "transactions")
@EntityListeners(AuditingEntityListener.class)
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Locataire dont le compte est affecté par la transaction */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    /** Location associée à la transaction */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    /** Montant en crédits : négatif = débit, positif = crédit */
    @Column(name = "montant", nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    /** Raison / type de la transaction (ex : reservation_debit, paiement_proprietaire, remboursement_annulation) */
    @Column(name = "type", nullable = false, length = 64)
    private String type;

    /** Statut de la transaction : EN_ATTENTE, CONFIRMEE, ANNULEE, REMBOURSEE */
    @Column(name = "statut", nullable = false, length = 32)
    private String statut;

    /** Date/heure de la transaction (générée automatiquement) */
    @CreationTimestamp
    @Column(name = "cree_le", nullable = false, updatable = false)
    private LocalDateTime creeLe;

    // Constructeurs
    public Transaction() {}

    /** Transaction liée à une location */
    public Transaction(User utilisateur, Location location, BigDecimal montant, String type, String statut) {
        this.utilisateur = utilisateur;
        this.location = location;
        this.montant = montant;
        this.type = type;
        this.statut = statut;
    }

    /** Transaction n'ayant pas de location (ex: bonus, ajustement manuel) */
    public Transaction(User utilisateur, BigDecimal montant, String type, String statut) {
        this(utilisateur, null, montant, type, statut);
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUtilisateur() { return utilisateur; }
    public void setUtilisateur(User utilisateur) { this.utilisateur = utilisateur; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public BigDecimal getMontant() { return montant; }
    public void setMontant(BigDecimal montant) { this.montant = montant; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public LocalDateTime getCreeLe() { return creeLe; }
    public void setCreeLe(LocalDateTime creeLe) { this.creeLe = creeLe; }
}