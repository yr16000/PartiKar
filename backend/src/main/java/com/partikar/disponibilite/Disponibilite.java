package com.partikar.disponibilite;

import com.partikar.voiture.Voiture;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "disponibilites")
public class Disponibilite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voiture_id", nullable = false)
    private Voiture voiture;

    @Column(name = "jour", nullable = false)
    private LocalDate jour;

    /**
     * Statut du jour pour la voiture. Correspond aux valeurs métier :
     * - DISPONIBLE (le propriétaire a rendu la voiture disponible)
     * - RESERVE (la voiture a été réservée pour ce jour)
     * - BLOQUE_PROPRIETAIRE (le propriétaire a bloqué le jour)
     *
     * Stocké en base comme chaîne (EnumType.STRING).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 40)
    private Statut statut;

    @Column(name = "prix_specifique", precision = 10, scale = 2)
    private BigDecimal prixSpecifique;

    public Disponibilite() {}

    public Disponibilite(Voiture voiture, LocalDate jour, Statut statut, BigDecimal prixSpecifique) {
        this.voiture = voiture;
        this.jour = jour;
        this.statut = statut;
        this.prixSpecifique = prixSpecifique;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Voiture getVoiture() { return voiture; }
    public void setVoiture(Voiture voiture) { this.voiture = voiture; }

    public LocalDate getJour() { return jour; }
    public void setJour(LocalDate jour) { this.jour = jour; }

    public Statut getStatut() { return statut; }
    public void setStatut(Statut statut) { this.statut = statut; }

    public BigDecimal getPrixSpecifique() { return prixSpecifique; }
    public void setPrixSpecifique(BigDecimal prixSpecifique) { this.prixSpecifique = prixSpecifique; }

    public enum Statut {
        DISPONIBLE,
        RESERVE,
        BLOQUE_PROPRIETAIRE
    }
}
