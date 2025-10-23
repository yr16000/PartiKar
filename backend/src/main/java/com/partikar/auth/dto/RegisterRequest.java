package com.partikar.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record RegisterRequest(
        @NotBlank(message = "Le nom est obligatoire")
        String nom,

        @NotBlank(message = "Le prénom est obligatoire")
        String prenom,

        @Email(message = "L'email doit être valide")
        @NotBlank(message = "L'email est obligatoire")
        String email,

        @Past(message = "La date de naissance doit être dans le passé")
        LocalDate dateDeNaissance,

        @NotBlank(message = "Le mot de passe est obligatoire")
        @Size(min = 8, message = "Le mot de passe doit faire 8 caractères minimum")
        String password
) {}