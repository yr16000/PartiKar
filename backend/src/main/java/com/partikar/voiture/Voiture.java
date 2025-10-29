package com.partikar.voiture;

import com.partikar.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "voitures")
public class Voiture {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voiture_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "proprietaire_id", nullable = false)
    private User proprietaire;

    @Column(nullable = false) private String marque;
    @Column(nullable = false) private String modele;
    @Column(nullable = false) private Integer annee;

    @Column(name = "image_url") private String imageUrl;
    @Column(name = "prix_par_jour", nullable = false) private BigDecimal prixParJour;

    private String localisation;

    @Column(name = "cree_le") private LocalDateTime creeLe;
    @Column(name = "maj_le")  private LocalDateTime majLe;

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getProprietaire() { return proprietaire; }
    public void setProprietaire(User p) { this.proprietaire = p; }
    public String getMarque() { return marque; }
    public void setMarque(String m) { this.marque = m; }
    public String getModele() { return modele; }
    public void setModele(String m) { this.modele = m; }
    public Integer getAnnee() { return annee; }
    public void setAnnee(Integer a) { this.annee = a; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String u) { this.imageUrl = u; }
    public BigDecimal getPrixParJour() { return prixParJour; }
    public void setPrixParJour(BigDecimal p) { this.prixParJour = p; }
    public String getLocalisation() { return localisation; }
    public void setLocalisation(String l) { this.localisation = l; }
    public LocalDateTime getCreeLe() { return creeLe; }
    public void setCreeLe(LocalDateTime c) { this.creeLe = c; }
    public LocalDateTime getMajLe() { return majLe; }
    public void setMajLe(LocalDateTime m) { this.majLe = m; }
}
