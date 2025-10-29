package com.partikar.user.profile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserProfile(
        Long id,
        String nom,
        String prenom,
        String email,
        LocalDate dateDeNaissance,
        String telephone,
        String adresse,
        String numeroPermis,
        LocalDate expirationPermis,
        BigDecimal credits,
        LocalDateTime creeLe,
        LocalDateTime majLe
) {}
