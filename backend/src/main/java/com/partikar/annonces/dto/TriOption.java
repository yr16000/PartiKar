package com.partikar.annonces.dto;

/**
 * Enum pour les options de tri des résultats de recherche.
 */
public enum TriOption {
    DISTANCE_ASC,           // Distance croissante (par défaut si géolocalisation)
    PRIX_ASC,               // Prix croissant
    PRIX_DESC,              // Prix décroissant
    DATE_PUBLICATION_ASC,   // Date de publication ancienne → récente
    DATE_PUBLICATION_DESC,  // Date de publication récente → ancienne (par défaut)
    NB_AVIS_ASC,            // Nombre d'avis croissant
    NB_AVIS_DESC            // Nombre d'avis décroissant
}
